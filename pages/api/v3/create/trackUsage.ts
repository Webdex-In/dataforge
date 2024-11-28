import { db } from "../../../../config/db";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { usage, dataType ,userId} = req.body;

    // Validate required fields
    if (!userId || !usage) {
      console.error("Missing required fields:", { userId, usage });
      return res.status(400).json({ message: "Missing required fields." });
    }

    try {
      const date = new Date();
      const formattedDate = date.toISOString().split("T")[0];

      if (dataType == "bulkEnrichment") {
        // Find existing usage for the same date, user, and dataType
        const existingUsage = await db.creditUsage.findFirst({
          where: {
            date: formattedDate,
            userId,
            dataType,
          },
        });

        if (existingUsage) {
          await db.creditUsage.update({
            where: {
              id: existingUsage.id, // Use the record's ID for updating
            },
            data: {
              linkedinProfiles: { increment: usage.linkedinProfiles || 0 },
              validEmails: { increment: usage.validEmails || 0 },
              phoneNumbers: { increment: usage.phoneNumbers || 0 },
              files: { increment: usage.files || 0 },
              entries: { increment: usage.entries || 0 },

              totalUseCredits: {
                increment: calculateCredits(usage),
              },
            },
          });
        } else {
          // Create a new usage entry if none exists
          await db.creditUsage.create({
            data: {
              date: formattedDate,
              userId,
              dataType,
              linkedinProfiles: usage.linkedinProfiles || 0,
              validEmails: usage.validEmails || 0,
              phoneNumbers: usage.phoneNumbers || 0,
              files: usage.files || 0,
              entries: usage.entries || 0,
              totalUseCredits: calculateCredits(usage),
            },
          });
        }
      }

      if (dataType == "individual") {
        // Find existing usage for the same date, user, and dataType
        const existingUsage = await db.creditUsage.findFirst({
          where: {
            date: formattedDate,
            userId,
            dataType,
          },
        });

        if (existingUsage) {
          await db.creditUsage.update({
            where: {
              id: existingUsage.id, // Use the record's ID for updating
            },
            data: {
              linkedinProfiles: { increment: usage.linkedinProfiles || 0 },
              validEmails: { increment: usage.validEmails || 0 },
              phoneNumbers: { increment: usage.phoneNumbers || 0 },
              totalUseCredits: {
                increment: calculateCredits(usage),
              },
            },
          });
        } else {
          // Create a new usage entry if none exists
          await db.creditUsage.create({
            data: {
              date: formattedDate,
              userId,
              dataType,
              linkedinProfiles: usage.linkedinProfiles || 0,
              validEmails: usage.validEmails || 0,
              phoneNumbers: usage.phoneNumbers || 0,
              totalUseCredits: calculateCredits(usage),
            },
          });
        }
      }
        //  Update the user's total credits used
         await db.user.update({
          where: { userId: userId },
          data: {
            totalCredit: {
              decrement: calculateCredits(usage),
            },
          },
        });
      res.status(200).json({ message: "Usage tracked successfully!" });
    } catch (error) {
      console.error("Error while tracking usage:", error);
      res.status(500).json({
        message: "An error occurred while tracking usage.",
        error: error.message,
      });
    } finally {
      await db.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Helper function to calculate total credits
function calculateCredits(usage) {
  const CREDIT_COSTS = {
    linkedinProfile: 1,
    validEmail: 2,
    phoneNumber: 15,
  };

  // Calculate the total credits
  const totalCredits =
    (usage.linkedinProfiles || 0) * CREDIT_COSTS.linkedinProfile +
    (usage.validEmails || 0) * CREDIT_COSTS.validEmail +
    (usage.phoneNumbers || 0) * CREDIT_COSTS.phoneNumber;

  return totalCredits; // Return the total sum
}


