import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL_V3!;

export function formatDomainUrl(url) {
    // Remove protocol (http:// or https://)
    let domain = url.replace(/^https?:\/\//, "");
  
    // Remove 'www.'
    domain = domain.replace(/^www\./, "");
  
    // Remove trailing slashes
    domain = domain.replace(/\/$/, "");
  
    return domain;
  }



export function formatUrl(link) {
    let profileId;
  
    // Check if it's an /in/ or /sales/ link
    if (link.includes("/in/")) {
      profileId = link.split("/in/")[1].split("/")[0];
    } else if (link.includes("/sales/")) {
      profileId = link.split("/lead/")[1].split(",")[0];
    } else {
      return "Invalid LinkedIn URL";
    }
  
    // Return the formatted LinkedIn URL
    return `https://www.linkedin.com/in/${profileId}`;
  }
  


  export async  function trackUsage(userId:any,type,count = 1 ,dataFor="individual") {

   
    const usage = {};
    const date = new Date().toISOString().split('T')[0];
  
    if (!usage[date]) {
      usage[date] = {
        linkedinProfiles: 0,
        validEmails: 0,
        phoneNumbers: 0,
      };
    }
  
    usage[date][type] += count;
    const formattedUsage = formatUsageData(usage);
  
    const payload = {
      userId:userId,
      usage: formattedUsage,
      dataType :dataFor
    };
  
    try {
     await axios.post(`${BASE_URL}/create/trackUsage`, payload);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }

  }
  
  
  export function formatUsageData(usage) {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
    // Initialize the usage object for the API request
    const formattedUsage = {
      linkedinProfiles: 0,
      validEmails: 0,
      phoneNumbers: 0,
    };
  
    // Check if there is usage data for today
    if (usage[today]) {
      const dailyUsage = usage[today];
  
      // Add the values for each type, ensuring validEmails is an integer
      formattedUsage.linkedinProfiles += dailyUsage.linkedinProfiles || 0;
  
      // Remove any unwanted `[object Object]` entries and parse validEmails as an integer
      const validEmailCount = String(dailyUsage.validEmails)
        .replace(/\[object Object\]/g, '') // Remove any instances of [object Object]
        .replace(/[^0-9]/g, ''); // Remove any non-numeric characters
  
      formattedUsage.validEmails += parseInt(validEmailCount) || 0; // Ensure it's an integer
      formattedUsage.phoneNumbers += dailyUsage.phoneNumbers || 0;
    }
  
    return formattedUsage;
  }
  