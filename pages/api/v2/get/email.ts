import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { domainUrl } = req.body;

      if (!domainUrl) {
        return res.status(400).json({ error: "Social URL is required." });
      }
      // Retrieve social data for the provided social_url
      const emailRecords = await db.email.findUnique({
        where: { domainUrl: domainUrl },
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


      if (emailRecords) {
        return res.status(200).json({
          resData:emailRecords,
        });
      } else {
        return res.status(200).json({
          resData: null,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error retrieving email data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
