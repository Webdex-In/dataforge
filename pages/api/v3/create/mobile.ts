import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db"; // Adjust the import according to your db setup

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { response, social_url,userId } = req.body; // Extract response from the request body

      // Check if the necessary data is present
      if (!response) {
        return res.status(400).json({ error: "Response is required" });
      }

      // Retrieve social data for the provided social_url
      const socialRecords = await db.social.findUnique({
        where: { social_url: social_url },
      });

      // Check if social record exists
      if (!socialRecords) {
        return res.status(404).json({ error: "Social record not found" });
      }

      const {
        raw_format,
        international_format,
        national_format,
        prefix,
        country_name,
        country_code,
      } = response;

      // Check for existing mobile records
      const mobileRecords = await db.mobile.findUnique({
        where: { socialId: socialRecords.id },
        select: {
          id: true,
        },
      });

      if (mobileRecords) {
        const updatedMobileRecord = await db.mobile.update({
          where: { socialId: socialRecords.id }, 
          data: {
            raw_format,
            international_format,
            national_format,
            prefix,
            country_name,
            country_code,
          },
        });

        // Send response for update
        return res.status(200).json({
          message: "Mobile record updated successfully",
          mobile: updatedMobileRecord,
        });
      } else {
        // If mobile record does not exist, create it
        const mobileRecord = await db.mobile.create({
          data: {
            raw_format,
            international_format,
            national_format,
            prefix,
            country_name,
            country_code,
            socialId: socialRecords.id,
          },
        });

        // Send response for creation
        return res.status(201).json({
          message: "Mobile record created successfully",
          mobile: mobileRecord,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
