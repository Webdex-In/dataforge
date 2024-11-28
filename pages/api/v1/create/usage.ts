import { db } from "../../../../config/db";

// Function to calculate total credits based on usage
function calculateTotalCredits(usage) {
    return (usage.linkedinProfiles || 0) + (usage.validEmails || 0) + (usage.unverifiedEmails || 0) + (usage.bulkCompanyEmails || 0) + (usage.phoneNumbers || 0);
}

// Function to sanitize inputs and convert them to integers
function sanitizeInput(value) {
    if (typeof value === 'number') {
        return Math.max(0, Math.floor(value)); // Ensure it's a positive integer
    } else if (typeof value === 'string') {
        const digits = value.match(/\d+/g); // Get all digits in the string
        return digits ? Math.max(0, parseInt(digits.join(''), 10)) : 0; // Join and convert to integer, or return 0
    }
    return 0; // Default return value
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, usageData } = req.body;

        try {
            // Check if the user exists
            const userExists = await db.user.findUnique({
                where: { userId: userId },
            });

            if (!userExists) {
                return res.status(400).json({ error: 'User does not exist.' });
            }

            // Initialize an array to collect promises for upserts
            const upsertPromises = [];

            // Loop through the usageData to create or update records
            for (const [dateString, usage] of Object.entries(usageData)) {
                const date = new Date(dateString); // Convert string date to Date object
                
                // Fetch existing usage for the given date
                const existingUsage = await db.usage.findUnique({
                    where: { userId }, // Assuming the `userId` is the unique identifier here
                });

                // Prepare sanitized usage data, summing with existing values
                const sanitizedUsage = {
                    linkedinProfiles: (existingUsage?.linkedinProfiles || 0) + sanitizeInput(usage.linkedinProfiles),
                    validEmails: (existingUsage?.validEmails || 0) + sanitizeInput(usage.validEmails),
                    unverifiedEmails: (existingUsage?.unverifiedEmails || 0) + sanitizeInput(usage.unverifiedEmails),
                    bulkCompanyEmails: (existingUsage?.bulkCompanyEmails || 0) + sanitizeInput(usage.bulkCompanyEmails),
                    phoneNumbers: (existingUsage?.phoneNumbers || 0) + sanitizeInput(usage.phoneNumbers),
                };

                // Debugging output to check sanitized values

                // Upsert the usage data
                const upsertPromise = db.usage.upsert({
                    where: { userId }, // Use a unique identifier for upsert
                    update: {
                        date, // Update date
                        ...sanitizedUsage, // Spread sanitized usage
                    },
                    create: {
                        userId,
                        date,
                        ...sanitizedUsage, // Spread sanitized usage
                    },
                });

                upsertPromises.push(upsertPromise); // Collect promises
            }

            // Wait for all upsert operations to complete
            await Promise.all(upsertPromises);

            // Optionally, update the user's total credits
            const totalCredits = await db.usage.aggregate({
                where: { userId },
                _sum: {
                    linkedinProfiles: true,
                    validEmails: true,
                    unverifiedEmails: true,
                    bulkCompanyEmails: true,
                    phoneNumbers: true,
                },
            });

            const totalCreditCount = calculateTotalCredits(totalCredits._sum);

            // Update the user's total credit
            await db.user.update({
                where: { userId },
                data: { totalCredit: totalCreditCount },
            });

            res.status(200).json({ message: 'Usage data inserted successfully.' });
        } catch (error) {
            console.error('Error inserting usage data:', error);
            res.status(500).json({ error: 'Failed to insert usage data.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
