import { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db"; // Adjust this import based on your directory structure
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            const{ response , domainUrl } = req.body;
            // return res.status(200).json(response);
            const { userId } = getAuth(req)

            // Validate required fields
            const { email, email_anon_id, domain, email_status, first_name, last_name, type } = response;

            // if (!email || !domain) {
            //     return res.status(400).json({ error: "Email and domain are required." });
            // }

            // Format the domain URL

            // Check if a record with the same email exists
            const existingEmailRecord = await db.email.findUnique({
                where: {
                    email: email,
                },
            });

            if (existingEmailRecord) {
                // Update the existing record
                const updatedRecord = await db.email.update({
                    where: { id: existingEmailRecord.id }, // Update by ID
                    data: {
                        emailAnonId: email_anon_id,
                        domainUrl: domainUrl, // Update domain URL too if necessary
                        emailStatus: email_status,
                        firstName: first_name,
                        lastName: last_name,
                        email_type: type,
                        updatedAt: new Date(), // Update timestamp
                    },
                });
                return res.status(200).json(updatedRecord);
            } else {
                // Check if a record with the same domainUrl exists for a new record creation scenario
                const existingDomainRecord = await db.email.findUnique({
                    where: {
                        domainUrl: domainUrl,
                    },
                });

                if (!existingDomainRecord) {
                    // Create a new record since both email and domainUrl are unique
                    const newRecord = await db.email.create({
                        data: {
                            email,
                            emailAnonId: email_anon_id,
                            domainUrl: domainUrl,
                            userId:userId,
                            emailStatus: email_status,
                            firstName: first_name,
                            lastName: last_name,
                            email_type: type,
                        },
                    });
                    return res.status(201).json(newRecord);
                } else {
                    return res.status(409).json({ error: "Domain URL already exists with a different email." });
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error processing request" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

