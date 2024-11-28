import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../config/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { social_url } = req.body; 

      // console.log(social_url);
      
      if (!social_url) {
        return res.status(400).json({ error: "Social URL is required." });
      }

      
      const socialRecords = await db.social.findUnique({
        where: { social_url: social_url },
        include: {
          email: true,
          workExperience: true,
          education: true,
          mobile:true,
        },
      });

      
      if (socialRecords) {
        return res.status(200).json({
          resData: socialRecords,
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
