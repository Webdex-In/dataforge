
import axios from 'axios';
import { trackUsage } from './creditSystem';
import { formatDomainUrl, formatUrl } from './supports';

const API_BASE_URL = 'https://api.prospeo.io';
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// In-memory cache
let cache = {};

// Function to generate a unique key for caching
function getCacheKey(endpoint, data) {
  return `${endpoint}:${JSON.stringify(data)}`;
}

async function callApi(endpoint, data, retries = 0) {
  const cacheKey = getCacheKey(endpoint, data);

  // Check cache first
  if (cache[cacheKey]) {
    // console.log('Returning cached data for:', cacheKey);
    return cache[cacheKey];
  }

  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, data }),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`API Error: ${responseData.message}`);
    }

    const result = await response.json();

    // Cache the result
    cache[cacheKey] = result;

    return result;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      // console.log(`Retrying API call (${retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return callApi(endpoint, data, retries + 1);
    }
    console.error(`API call error:`, error);
    throw error;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function findIndividualEmail(data) {
  // Validate required fields
  if (!data.firstName || !data.lastName || !data.company) {
    console.warn("Missing required data for email search");
    return null;
  }

  try {
    // Check if the email already exists based on the domain URL in the local database
    const checkResponse = await axios.post(`${BASE_URL}/get/email`, {
      domainUrl: formatDomainUrl(data.company),
    });

    if (checkResponse.data.resData) {
      // If existing data is found in local DB, track usage and return it
      trackUsage("validEmails", 1);
      return checkResponse.data.resData;
    }

    // If no existing email is found, call the Prospeo API to find it
    const emailResult = await callApi("/email-finder", {
      first_name: data.firstName,
      last_name: data.lastName,
      company: data.company,
    });

    if (!emailResult.error && emailResult.response) {
      // Check if the found email is valid
      const isValid = emailResult.response.email_status === "VALID";

      if (isValid) {
        // Track usage for a valid email found via the Prospeo API
        trackUsage("validEmails", 1);
      }

      // Store the new email data in the local database
      const createResponse = await axios.post(`${BASE_URL}/create/email`, {
        domainUrl: formatDomainUrl(data.company),
        response: emailResult.response,
      });

      if (createResponse.data) {
        // Re-check and return the newly created data from the database
        const newCheckResponse = await axios.post(`${BASE_URL}/get/email`, {
          domainUrl: formatDomainUrl(data.company),
        });
        return newCheckResponse.data.resData;
      }
    }

    return emailResult.error ? null : emailResult.response;
  } catch (error) {
    console.error("Email Finder error:", error);
    return null;
  }
}



async function getCompanyEmails(company) {
  if (!company) {
    console.warn("Missing company name for domain search");
    return null;
  }

  try {
    // Check for existing data based on the company's domain
    const checkResponse = await axios.post(`${BASE_URL}/get/domain`, {
      domain_url: formatDomainUrl(company),
    });

    if (checkResponse.data.resData) {
      // console.log("Existing Data:", checkResponse.data.resData);
      trackUsage("validEmails",checkResponse.data.resData);
      return checkResponse.data.resData;

    }

    // Fetch domain emails if no existing data is found
    const domainResult = await callApi("/domain-search", {
      company,
      limit: 50,
      email_type: "all",
      company_enrichment: true,
    });

    // console.log("Domain search raw response:", domainResult);

    if (!domainResult.error && domainResult.response?.email_list) {
      // Filter for valid emails
      const validEmails = domainResult.response.email_list.filter(
        (email) => email.verification?.status === "VALID"
      ).length;

      // console.log(`Found ${validEmails} valid company emails`);

      // Track valid email usage if any are found
      if (validEmails > 0) {
        // console.log(`Tracking ${validEmails} valid company emails for credits`);
        trackUsage("validEmails", validEmails);
      }

      // Save the new domain email data
      const createResponse = await axios.post(`${BASE_URL}/create/domain`, {
        response: domainResult.response,
      });

      // Re-fetch and return the newly created data
      if (createResponse) {
        const response = await axios.post(`${BASE_URL}/get/domain`, {
          domain_url: formatDomainUrl(company),
        });
        return response.data.resData;
      }
    }

    // Return the response or null if there was an error
    return domainResult.error ? null : domainResult.response;
  } catch (error) {
    console.error("Domain Search error:", error);
    return null;
  }
}


async function enrichLinkedIn(url) {
  if (!url) {
    console.warn("Missing LinkedIn URL for enrichment");
    return null;
  }

  try {
    // Check if enrichment data already exists for the given LinkedIn URL
    const checkResponse = await axios.post(`${BASE_URL}/get/social`, {
      social_url: formatUrl(url),
    });

    // console.log(checkResponse);

    if (checkResponse.data.resData) {
      // console.log("Existing Data:", checkResponse.data.resData);
      trackUsage("linkedinProfiles");

      return checkResponse.data.resData;
    }

    // If no existing data, call the API to enrich LinkedIn data
    const socialResult = await callApi("/social-url-enrichment", {
      url,
      profile_only: false,
    });

    if (!socialResult.error && socialResult.response) {
      // console.log("LinkedIn profile enriched successfully");
      trackUsage("linkedinProfiles");
      
      // Save the enriched LinkedIn data in the database
      const createResponse = await axios.post(`${BASE_URL}/create/social`, {
        social_url: socialResult.response.linkedin,
        response: socialResult.response,
      });

      return socialResult.error ? null : createResponse.response;
    }

    return null;
  } catch (error) {
    console.error("Social URL Enrichment error:", error);
    return null;
  }
}



async function findPhoneNumber(url) {
  if (!url) {
    console.warn("Missing LinkedIn URL for phone number search");
    return null;
  }

  try {
    // Check if phone number data already exists for the given LinkedIn URL
    const checkResponse = await axios.post(`${BASE_URL}/get/mobile`, {
      social_url: formatUrl(url),
    });

    if (checkResponse.data.resData) {
      trackUsage('phoneNumbers');
      return checkResponse.data.resData;
    }

    // If no existing data, call the mobile-finder API to get the phone number
    const mobileResult = await callApi("/mobile-finder", { url });

    if (!mobileResult.error && mobileResult.response) {
      // console.log("Phone number found successfully");
      trackUsage("phoneNumbers");

      // Create a new entry in the database with the phone number data
      const createResponse = await axios.post(`${BASE_URL}/create/mobile`, {
        social_url: formatUrl(url),
        response: mobileResult.response,
      });

      // Re-fetch the newly created data to confirm and return
      if (createResponse.data) {
        const newCheckResponse = await axios.post(`${BASE_URL}/get/mobile`, {
          social_url: formatUrl(url),
        });
        return newCheckResponse.data.resData;
      }
    } else {
      // If phone number isn't found, attempt LinkedIn enrichment as a fallback
      const createSocial = await enrichLinkedIn(url);
      if (createSocial) {
        console.warn("LinkedIn profile enriched; however, no phone number found.");
      } else {
        console.warn("Oops, something went wrong with LinkedIn enrichment.");
      }
    }

    return mobileResult.error ? null : mobileResult.response;
  } catch (error) {
    console.error("Mobile Finder error:", error);
    return null;
  }
}


export async function enrichIndividualData(data, searchOptions) {
  let enrichedData = {};
  // console.log('Starting enrichment with options:', searchOptions);

  const enrichmentTasks = [
    {
      option: 'getCompanyEmails',
      func: getCompanyEmails,
      args: [data.company],
      key: 'domainSearch'
    },
    {
      option: 'findIndividualEmail',
      func: findIndividualEmail,
      args: [data],
      key: 'email'
    },
    {
      option: 'enrichLinkedIn',
      func: enrichLinkedIn,
      args: [data.linkedinUrl],
      key: 'socialEnrichment'
    },
    {
      option: 'findPhoneNumber',
      func: findPhoneNumber,
      args: [data.linkedinUrl],
      key: 'mobile'
    }
  ];

  for (const task of enrichmentTasks) {
    if (searchOptions[task.option]) {
      // console.log(`Processing ${task.option}`);
      const result = await task.func(...task.args);
      if (result) {
        enrichedData[task.key] = result;
        // console.log(`${task.option} completed successfully:`, result);
      }
      await delay(1000); // 1 second delay between API calls
    }
  }

  return enrichedData;
}

export function saveIndividualProcessedData(data) {
  const timestamp = new Date().toISOString();
  const storedData = JSON.parse(localStorage.getItem('individualProcessedData') || '[]');
  storedData.push({ timestamp, data });
  localStorage.setItem('individualProcessedData', JSON.stringify(storedData));
}

export function getIndividualProcessedData() {
  return JSON.parse(localStorage.getItem('individualProcessedData') || '[]');
}

export function clearCache() {
  cache = {};
}