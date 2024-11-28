import { trackUsage, trackBulkEnrichment } from './creditSystem';
import { formatDomainUrl, formatUrl } from './supports';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_BASE_URL = 'https://api.prospeo.io';
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

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

// async function enrichLinkedIn(url) {
//   if (!url) {
//     console.warn('Missing LinkedIn URL for enrichment');
//     return null;
//   }

//   try {
//     const socialResult = await callApi('/social-url-enrichment', {
//       url: url,
//       profile_only: false
//     });
//     if (!socialResult.error && socialResult.response) {
//       trackUsage('linkedinProfiles');
//     }
//     return socialResult.error ? null : socialResult.response;
//   } catch (error) {
//     console.error('Social URL Enrichment error:', error);
//     return null;
//   }
// }
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
       await axios.post(`${BASE_URL}/create/social`, {
        social_url: socialResult.response.linkedin,
        response: socialResult.response,
      });

      return socialResult.error ? null : socialResult.response;
    }

    return null;
  } catch (error) {
    console.error("Social URL Enrichment error:", error);
    return null;
  }
}

// async function findPhoneNumber(url) {
//   if (!url) {
//     console.warn('Missing LinkedIn URL for phone number search');
//     return null;
//   }

//   try {
//     const mobileResult = await callApi('/mobile-finder', {
//       url: url,
//     });
//     if (!mobileResult.error && mobileResult.response) {
//       trackUsage('phoneNumbers');
//     }
//     return mobileResult.error ? null : mobileResult.response;
//   } catch (error) {
//     console.error('Mobile Finder error:', error);
//     return null;
//   }
// }

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


async function findEmail(firstName, lastName, companyDomain) {
    if (!firstName || !lastName || !companyDomain) {
      console.warn('Missing required data for email search');
      return null;
    }

    try {
      // Check if the email already exists based on the domain URL
      const checkResponse = await axios.post(`${BASE_URL}/get/email`, {
        domainUrl: formatDomainUrl(companyDomain),
      });

      if (checkResponse.data.resData) {
        // If existing data is found, return it immediately
        return checkResponse.data.resData;
      }

      // If not found, call the API to find the email
      const emailResult = await callApi('/email-finder', {
        first_name: firstName,
        last_name: lastName,
        company: companyDomain,
      });

      if (emailResult.error) {
        console.error('Error finding email:', emailResult.error);
        return null;
      }

      // Track successful usage
      if (emailResult.response) {
        trackUsage('validEmails');
      }

      // Store the new email data in the database
      const createResponse = await axios.post(`${BASE_URL}/create/email`, {
        domainUrl: formatDomainUrl(companyDomain),
        response: emailResult.response,
      });

      if (createResponse.data) {
        // Re-check and return the new data from the database
        const newCheckResponse = await axios.post(`${BASE_URL}/get/email`, {
          domainUrl: formatDomainUrl(companyDomain),
        });
        return newCheckResponse.data.resData || emailResult.response;
      }

      return emailResult.response;
    } catch (error) {
      console.error('Email Finder error:', error);
      return null;
    }
}


export async function processBulkData(data, progressCallback) {
  const results = [];
  let processed = 0;
  const totalItems = data.length;

  trackBulkEnrichment(1, totalItems); // Track the bulk enrichment file and entry count

  for (const item of data) {
    try {
      // Step 1: LinkedIn Enrichment
      const linkedInData = await enrichLinkedIn(item.profileUrl);
      await delay(1000);
      // Step 2: Phone Number
      const phoneData = await findPhoneNumber(item.profileUrl);
      await delay(1000);
      // Step 3: Email Enrichment (using data from LinkedIn)
      let emailData = null;
      if (linkedInData && linkedInData.company && linkedInData.company.website) {
        emailData = await findEmail(item.firstName, item.lastName, linkedInData.company.website);
        await delay(1000);
      }
      const enrichedItem = {
        firstName: item.firstName,
        lastName: item.lastName,
        profileUrl: item.profileUrl,
        linkedInData,
        phoneData,
        emailData
      };
      results.push(enrichedItem);
    } catch (error) {
      console.error('Error processing item:', item, error);
      results.push({ ...item, error: 'Processing failed' });
    }
    processed++;
    if (progressCallback) {
      progressCallback((processed / totalItems) * 100);
    }
  }
  return results;
}

export function saveBulkProcessedData(data) {
  const timestamp = new Date().toISOString();
  const storedData = JSON.parse(localStorage.getItem('bulkProcessedData') || '[]');
  const newData = data.map(item => ({ timestamp, data: item }));
  storedData.push(...newData);
  localStorage.setItem('bulkProcessedData', JSON.stringify(storedData));
}

export function getBulkProcessedData() {
  const storedData = JSON.parse(localStorage.getItem('bulkProcessedData') || '[]');
  return storedData;
}

// Helper function to clear all bulk processed data (useful for testing)
export function clearBulkProcessedData() {
  localStorage.removeItem('bulkProcessedData');
}

// Function to clear cache (can be called periodically or when needed)
export function clearCache() {
  cache = {};
}