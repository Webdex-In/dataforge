import { db } from "/config/db"; // Adjust this import based on your directory structure

export async function processEmailData(data, userId) {
    const { response, domainUrl } = data;


    // Validate required fields
    const { email, email_anon_id, email_status, first_name, last_name, type } = response;

    // Check if a record with the same email exists
    const existingEmailRecord = await db.email.findUnique({
        where: { email },
    });

    if (existingEmailRecord) {
        // Update the existing record
        return await db.email.update({
            where: { id: existingEmailRecord.id },
            data: {
                emailAnonId: email_anon_id,
                domainUrl: domainUrl,
                emailStatus: email_status,
                firstName: first_name,
                lastName: last_name,
                email_type: type,
                updatedAt: new Date(), // Update timestamp
            },
        });
    } else {
        // Check if a record with the same domainUrl exists for a new record creation scenario
        const existingDomainRecord = await db.email.findUnique({
            where: { domainUrl },
        });

        if (!existingDomainRecord) {
            // Create a new record since both email and domainUrl are unique
            return await db.email.create({
                data: {
                    email,
                    emailAnonId: email_anon_id,
                    domainUrl: domainUrl,
                    userId,
                    emailStatus: email_status,
                    firstName: first_name,
                    lastName: last_name,
                    email_type: type,
                },
            });
        } else {
            throw new Error("Domain URL already exists with a different email.");
        }
    }
}
