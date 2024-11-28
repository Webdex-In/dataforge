import { db } from "../../../../config/db";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            // Retrieve data from the database
            const usageData = await db.creditUsage.findMany({
                where: { userId },
                select: {
                    date: true,
                    linkedinProfiles: true,
                    validEmails: true,
                    phoneNumbers: true,
                },
            });

            // Check if data was found
            if (!usageData || usageData.length === 0) {
                return res.status(404).json({ message: 'No usage data found for this user.' });
            }

            // Transform data into the desired format
            const result = {};
            usageData.forEach(entry => {
                // Ensure entry.date is a Date object
                const dateKey = new Date(entry.date).toISOString().split('T')[0]; // Convert to date string format YYYY-MM-DD

                // Convert validEmails to an integer
                let validEmailsCount = 0;
                if (typeof entry.validEmails === 'string') {
                    validEmailsCount = parseInt(entry.validEmails.replace(/[^0-9]/g, ''), 10) || 0;
                } else if (typeof entry.validEmails === 'number') {
                    validEmailsCount = entry.validEmails; // If it's already a number
                }

                result[dateKey] = {
                    linkedinProfiles: entry.linkedinProfiles,
                    validEmails: validEmailsCount,
                    phoneNumbers: entry.phoneNumbers,
                };
            });

            // Return the transformed data
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching usage data:', error); // Log detailed error message
            res.status(500).json({ 
                message: 'An error occurred while fetching usage data.',
                error: error.message, // Include the error message for debugging
            });
        } finally {
            await db.$disconnect();
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
