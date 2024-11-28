import { NextApiRequest, NextApiResponse } from "next";
import { enrichIndividualDataV3Sequential } from "./supports/individualApiService";
import { db } from "../../../config/db";

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

// Default search options to false if not provided
const getDefaultSearchOptions = (searchOptions?: any) => {
  return {
    findIndividualEmail: searchOptions?.findIndividualEmail ?? false,
    getCompanyEmails: searchOptions?.getCompanyEmails ?? false,
    enrichLinkedIn: searchOptions?.enrichLinkedIn ?? false,
    findPhoneNumber: searchOptions?.findPhoneNumber ?? false,
  };
};

// Validate that only one search option is set to true
const validateSingleSearchOption = (searchOptions: any) => {
  const options = Object.values(searchOptions || {});
  const selectedOptions = options.filter((option) => option === true);
  if (selectedOptions.length > 2 ) {
    return "⚠️ You can select up to two search options at a time. If you need to use more than two, please contact support for assistance. 📧";
  }
  return null;
};

// Helper function to validate required fields
const validateRequiredFields = (formData: any) => {
  const requiredFields = ["firstName", "lastName", "company", "linkedinUrl"];
  for (let field of requiredFields) {
    if (!formData[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null; // All fields are valid
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); // Allowed HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respond OK to OPTIONS requests
  }

  if (req.method === "POST") {
    try {
      const apiKey = req.headers["authorization"] as string;
      const { searchOptions } = req.body;

      // Directly access formData fields without wrapping them
      const { firstName, lastName, company, linkedinUrl } = req.body;

      if (!apiKey) {
        return handleMissingApiKey(res);
      }

      const userRecords = await getUserByApiKey(apiKey);

      if (!userRecords) {
        return res
          .status(404)
          .json({ error: "Invalid API key or user not found" });
      }

      const { userId } = userRecords;

      // Validate required fields in formData
      const formData = { firstName, lastName, company, linkedinUrl };
      const validationError = validateRequiredFields(formData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Validate that only one search option is selected
      const searchOptionError = validateSingleSearchOption(searchOptions);
      if (searchOptionError) {
        return res.status(400).json({ error: searchOptionError });
      }

      // Get default search options or user-defined ones
      const finalSearchOptions = getDefaultSearchOptions(searchOptions);

      // Process data using enrichIndividualDataV3
      const enrichedData = await enrichIndividualDataV3Sequential(
        formData,
        finalSearchOptions,
        userId
      );

      // Send the processed data as response
      res.status(200).json(enrichedData);
    } catch (error) {
      res.status(500).json({
        error: "Something went wrong.",
        details: error.message,
      });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
