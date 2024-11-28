import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db";
import callApi from "./helper/call-api";
import { processEmailData } from "./create/email";
import { formatDomainUrl, formatUrl, trackUsage } from "./helper/support";
import axios from "axios";
import {
  getDomainRecords,
  getEmailRecordByDomain,
  getEnrichLinkedInRecords,
  getPhoneNumberRecords,
} from "./helper/get-db-data";
import { PhoneNumber } from "@clerk/nextjs/dist/types/server";

// Helper function to handle missing API key
const handleMissingApiKey = (res: NextApiResponse) => {
  return res.status(400).json({ error: "Authorization header is missing" });
};

// Helper function to check if user exists with the API key
const getUserByApiKey = async (apiKey: string) => {
  return db.user.findUnique({
    where: { ApiKey: apiKey },
    select: { userId: true },
  });
};

// Helper function to create and return new email data
const createAndTrackEmail = async (data: any, userId: any, company: string) => {
  try {
    const emailResult = await callApi("/email-finder", data);
    emailResult.domainUrl = formatDomainUrl(company);
    const emailData = await processEmailData(emailResult, userId);
    // trackUsage("validEmails", 2, userId); // Track usage of valid emails
    return emailData;
  } catch (error) {
    console.error("Error creating and tracking email:", error);
    throw new Error("Error creating and tracking email");
  }
};

// Helper function to create and return new company email data
const createAndTrackCompanyEmails = async (data: any, userId: any) => {
  const payload = {
    company: data.company,
    limit: 50,
    email_type: "all",
    company_enrichment: true,
  };

  try {
    // Call the API to search for domain information
    const res = await callApi("/domain-search", payload);

    if (res?.error) {
      throw new Error(`API error during domain search: ${res.error}`);
    }

    if (!res?.response) {
      throw new Error("No response data returned from domain search API");
    }

    try {
      // Create the social record using the enriched data
      const createResponse = await axios.post(
        `http://localhost:3000/api/v2/create/domain`,
        {
          response: res.response,
          userId: userId,
        }
      );

      // Return the response data from the creation process
      return createResponse?.data || {};
    } catch (creationError) {
      console.error("Error during domain creation API call:", creationError);
      throw new Error("Failed to create domain data");
    }
  } catch (error) {
    console.error("Error in createAndTrackCompanyEmails:", error.message || error);
    throw new Error("An error occurred while creating and tracking company emails");
  }
};


// Helper function to create and return new company email data enriched with LinkedIn profile data
const createAndTrackPhoneNumber = async (linkedinUrl: string, userId: string) => {
  const payload = {
    url: linkedinUrl,
  };

  try {
    // Call the mobile-finder API with the payload
    const res = await callApi("/mobile-finder", payload);
    if (!res.error && res.response) {
      // Create the social record using the enriched data
      const createResponse = await axios.post(
        "http://localhost:3000/api/v2/create/mobile",
        {
          social_url: formatUrl( linkedinUrl),
          response: res.response,
          userId: userId,
        }
      );
      // Track LinkedIn profile usage for the user
      // trackUsage("phoneNumbers", userId, 15);

      // Return the response data from the creation process
      return createResponse.data;
    } else {
      throw new Error(res.error || "Unknown error during mobile-finder API call");
    }
  } catch (error) {
    console.error("Error enriching LinkedIn data:", error);
    throw new Error("Error enriching LinkedIn data");
  }
};


// Main API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const apiKey = req.headers["authorization"] as string;
      const { firstName, lastName, company, linkedinUrl } = req.body;

      if (!apiKey) {
        return handleMissingApiKey(res); // Respond if API key is missing
      }

      const userRecords = await getUserByApiKey(apiKey);

      if (!userRecords) {
        return res
          .status(404)
          .json({ error: "Invalid API key or user not found" });
      }

      const { userId } = userRecords;
      const userIdString = String(userId);
      const data = { firstName, lastName, company, linkedinUrl };

      // Check for existing records in the database
      const emailRecords = await getEmailRecordByDomain(company, userId);
      const domainRecords = await getDomainRecords(
        formatDomainUrl(company),
        userId
      );
      const enrichLinkedInRecords = await getEnrichLinkedInRecords(
        linkedinUrl,
        userId
      );

      const  phoneNumberRecords = await getPhoneNumberRecords(
        linkedinUrl,
        userId
      );

      let emailData, companyEmailsData, enrichLinkedInData,PhoneNumberData;

      // If emailRecords are missing, create and track email
      if (!emailRecords) {
        emailData = await createAndTrackEmail(data, userId, company);
      }

      // If domainRecords are missing, create and track company emails
      if (!domainRecords) {
        companyEmailsData = await createAndTrackCompanyEmails(
          data,
          userIdString
        );
      }

      // If LinkedIn records are missing, create and track enriched LinkedIn data
      if (!enrichLinkedInRecords) {
        enrichLinkedInData = await createAndTrackEnrichLinkedIn(
          data,
          userId,
          formatUrl(linkedinUrl)
        );
      }

      if(!phoneNumberRecords){
        PhoneNumberData = await createAndTrackPhoneNumber(
          linkedinUrl,
          userId
        );
      }
      // Respond with available data
      return res.status(200).json({
        data: {
          emailRecords: emailRecords || emailData,
          domainRecords: domainRecords || companyEmailsData,
          enrichLinkedInRecords: enrichLinkedInRecords || enrichLinkedInData,
          PhoneNumberRecords: phoneNumberRecords || PhoneNumberData
        },
      });
    } catch (error) {
      console.error("Error processing request:", error);
      // Return a detailed error message in the response
      return res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  } else {
    // Respond with a 405 if the method is not allowed
    return res.status(405).json({ error: "Method not allowed" });
  }
}
