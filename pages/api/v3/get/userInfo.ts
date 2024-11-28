import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../config/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "Invalid User" });
      }
      // Retrieve social data for the provided social_url
      const userRecords = await db.user.findUnique({
        where: { userId: userId },
        select: {
            email: true,
            ApiKey: true,
            imageUrl: true,
            totalCredit: true,
            firstName: true,
            lastName: true,
            phoneNumber:true,
          },
      });


      if (userRecords) {
        return res.status(200).json({
          resData:userRecords,
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
