import { db } from "../../../../config/db";
import { getAuth } from "@clerk/nextjs/server";
import crypto from 'crypto'; // To generate a secure API key

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            // Generate a secure API key using crypto
            const apiKey = crypto.randomBytes(32).toString('hex'); // Generates a random 256-bit API key

            // Store the generated API key in the user's record in the database
            const user = await db.user.update({
                where: { userId: userId },
                data: {
                  ApiKey:  apiKey,  // Store the generated API key in the user's model
                },
            });

            // Return the generated API key to the client (or you could store it in a secure place)
            return res.status(200).json({ apiKey });

        } catch (error) {
            console.error('Error generating API key:', error);
            res.status(500).json({ 
                message: 'An error occurred while generating the API key.',
                error: error.message, 
            });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
