import axios from "axios";
import { db } from "../../../../config/db";
import { formatUrl, trackUsage } from "./support";

// Helper function to fetch email record by domain URL
export const getEmailRecordByDomain = async (company: string,userId:any) => {
  return db.email.findUnique({
      where: { domainUrl: company },
      select: {
        email: true,
        emailAnonId: true,
        domainUrl: true,
        emailStatus: true,
        firstName: true,
        lastName: true,
        email_type: true,
      },
    });
  };
  
 export  const getDomainRecords = async (domain_url: string,userId:any) => {
    const domainRecords = await db.domain.findUnique({
      where: { domain: domain_url },
      select: {
        domain: true,
        total_emails: true,
        remaining_emails: true,
        search_id: true,
        more_results: true,
        limit: true,
        companyEnrichment: true, 
        emails: true, 
      },
    });
      // Check if there are valid results
    //   if (domainRecords?.emails) {
    //     // Filter for valid emails
    //     const validEmails: number =await  domainRecords?.emails.filter(
    //       (email) => email.verification?.status === "VALID"
    //     ).length;
  
  
    //     if (validEmails && validEmails > 0) {
    //       // Track usage for valid emails
    //       // trackUsage("validEmails",userId,validEmails);
    //     }

    // }
    return domainRecords;
  };
  

  export  const getEnrichLinkedInRecords = async (url:string ,userId:any) => {
    const res = await axios.post(`http://localhost:3000/api/v2/get/social`, {
      social_url: formatUrl(url),
    });
    // trackUsage("linkedinProfiles", userId,1);

    return res.data;
  };

  export  const getPhoneNumberRecords = async (url:string ,userId:any) => {
    const res = await axios.post(`http://localhost:3000/api/v2/get/mobile`, {
      social_url: formatUrl(url),
    });

    return res.data;
  };