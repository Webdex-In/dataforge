import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../config/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { social_url, domain_url } = req.body; 

      
      if (!domain_url) {
        return res.status(400).json({ error: "Social URL is required." });
      }

      
      const domainRecords = await db.domain.findUnique({
        where: {  domain: domain_url },
        include: {
            companyEnrichment :true,
            emails:true,
        },
      });

      
      if (domainRecords) {
        return res.status(200).json({
          resData: domainRecords,
        });
      } else {
        return res.status(200).json({
          resData: null, 
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error retrieving social data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
