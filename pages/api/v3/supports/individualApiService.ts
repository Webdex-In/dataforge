import axios from 'axios';
// import { trackUsage } from './creditSystem';
import { callApi } from './prospeo';
import { formatDomainUrl, formatUrl, trackUsage } from './supports';

// Constants
const API_BASE_URL = 'https://api.prospeo.io';
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL_V3;

// In-memory cache
const cache: Record<string, any> = {};

// Types
interface IndividualData {
  firstName?: string;
  lastName?: string;
  company?: string;
  linkedinUrl?: string;
}

interface EnrichmentOptions {
  getCompanyEmails?: boolean;
  findIndividualEmail?: boolean;
  enrichLinkedIn?: boolean;
  findPhoneNumber?: boolean;
}

interface EnrichedData {
  domainSearch?: any;
  email?: any;
  socialEnrichment?: any;
  mobile?: any;
}

// Helper: Generate a unique cache key
function getCacheKey(endpoint: string, data: object): string {
  return `${endpoint}:${JSON.stringify(data)}`;
}

// Helper: Delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Unified API call handler with caching and retries


// Task: Fetch individual email
async function findIndividualEmail(data: IndividualData,userId:any): Promise<any> {
  if (!data.firstName || !data.lastName || !data.company) return null;

  const domainUrl = formatDomainUrl(data.company);

  try {
    const existingEmail = await axios.post(`${BASE_URL}/get/email`, { domainUrl });
    if (existingEmail.data.resData) {
      trackUsage(userId,'validEmails', 1);
      return existingEmail.data.resData;
    }

    const emailResult = await callApi('/email-finder', {
      first_name: data.firstName,
      last_name: data.lastName,
      company: data.company,
    });

    if (emailResult.response?.email_status === 'VALID') {
      trackUsage(userId,'validEmails', 1);

      await axios.post(`${BASE_URL}/create/email`, {
        domainUrl,
        response: emailResult.response,
        userId,
      });
    }

    return emailResult.response;
  } catch (error) {
    console.error('Error finding individual email:', error);
    return null;
  }
}

// Task: Fetch company emails
async function getCompanyEmails(company: string,userId:any): Promise<any> {
  if (!company) return null;

  const domainUrl = formatDomainUrl(company);

  try {
    const existingEmails = await axios.post(`${BASE_URL}/get/domain`, { domain_url: domainUrl });
    if (existingEmails.data.resData) {
      trackUsage(userId,'validEmails', existingEmails.data.resData.length);
      return existingEmails.data.resData;
    }

    const domainResult = await callApi('/domain-search', {
      company,
      limit: 50,
      email_type: 'all',
      company_enrichment: true,
    });

    if (domainResult.response?.email_list?.length) {
      const validEmails = domainResult.response.email_list.filter(
        (email: any) => email.verification?.status === 'VALID'
      ).length;

      if (validEmails > 0) trackUsage(userId,'validEmails', validEmails);

      await axios.post(`${BASE_URL}/create/domain`, { response: domainResult.response ,userId});
    }

    return domainResult.response?.email_list || [];
  } catch (error) {
    console.error('Error fetching company emails:', error);
    return null;
  }
}

// Task: Enrich LinkedIn profile
async function enrichLinkedIn(url: string,userId:any): Promise<any> {
  if (!url) return null;

  try {
    const existingData = await axios.post(`${BASE_URL}/get/social`, { social_url: formatUrl(url) });
    if (existingData.data.resData) {
      trackUsage(userId,'linkedinProfiles');
      return existingData.data.resData;
    }

    const socialResult = await callApi('/social-url-enrichment', { url, profile_only: false });
    if (socialResult.response) {
      trackUsage(userId,'linkedinProfiles');

      await axios.post(`${BASE_URL}/create/social`, {
        social_url: socialResult.response.linkedin,
        response: socialResult.response,
        userId,
      });
    }

    return socialResult.response;
  } catch (error) {
    console.error('Error enriching LinkedIn:', error);
    return null;
  }
}

// Task: Find phone number
async function findPhoneNumber(url: string,userId:any): Promise<any> {
  if (!url) return null;

  try {
    const existingData = await axios.post(`${BASE_URL}/get/mobile`, { social_url: formatUrl(url) });
    if (existingData.data.resData) {
      trackUsage(userId,'phoneNumbers');
      return existingData.data.resData;
    }

    const phoneResult = await callApi('/mobile-finder', { url });
    if (phoneResult.response) {
      trackUsage(userId,'phoneNumbers');

      await axios.post(`${BASE_URL}/create/mobile`, {
        social_url: formatUrl(url),
        response: phoneResult.response,
        userId
      });
    }

    return phoneResult.response;
  } catch (error) {
    console.error('Error finding phone number:', error);
    return null;
  }
}

// Main: Enrich individual data

export async function enrichIndividualDataV3Sequential(
  data: IndividualData,
  searchOptions: EnrichmentOptions,
  userId:any,
): Promise<EnrichedData> {
  const enrichedData: EnrichedData = {};

  try {
    if (searchOptions.getCompanyEmails) {
      const domainSearchResult = await getCompanyEmails(data.company!,userId);
      enrichedData.domainSearch = domainSearchResult || null;
    }

    if (searchOptions.findIndividualEmail) {
      const emailResult = await findIndividualEmail(data,userId);
      enrichedData.email = emailResult || null;
    }

    if (searchOptions.enrichLinkedIn) {
      const socialResult = await enrichLinkedIn(data.linkedinUrl!,userId);
      enrichedData.socialEnrichment = socialResult || null;
    }

    if (searchOptions.findPhoneNumber) {
      const phoneResult = await findPhoneNumber(data.linkedinUrl!,userId);
      enrichedData.mobile = phoneResult || null;
    }
  } catch (error) {
    console.error('Error during enrichment:', error);
  }

  return enrichedData;
}
