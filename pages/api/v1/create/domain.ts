import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db"; // Make sure your db instance is correctly configured
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { response } = req.body; // Extract response from the body
      const { userId } = getAuth(req)

      // Check if the necessary data is present
      if (!response) {
        return res.status(400).json({ error: "Response is required" });
      }

      const {
        email_list,
        company_enrichment,
        meta,
      } = response;

      // Validate company enrichment
      if (!company_enrichment || !company_enrichment.name) {
        return res.status(400).json({ error: "Company enrichment data is required" });
      }

      // Create or connect Domain
      const domainRecord = await db.domain.create({
        data: {
          domain: meta.domain,
          userId :userId,
          total_emails: meta.total_emails,
          remaining_emails: meta.remaining_emails,
          search_id: meta.search_id,
          more_results: meta.more_results,
          limit: meta.limit,
        },
      });

      // Create Company Enrichment
      const companyEnrichmentRecord = await db.companyEnrichment.create({
        data: {
          name: company_enrichment.name,
          is_catch_all: company_enrichment.is_catch_all,
          size: company_enrichment.size,
          logo: company_enrichment.logo,
          linkedin: company_enrichment.linkedin,
          website: company_enrichment.website,
          common_email_pattern: company_enrichment.common_email_pattern,
          industry: company_enrichment.industry,
          founded_in: company_enrichment.founded_in,
          description: company_enrichment.description,
          anon_id: company_enrichment.anon_id,
          // Create location if it exists
          location: {
            create: {
              country: company_enrichment.location.country,
              country_code: company_enrichment.location.country_code,
              state: company_enrichment.location.state,
              city: company_enrichment.location.city,
              timezone: company_enrichment.location.timezone,
              timezone_offset: company_enrichment.location.timezone_offset,
              postal_code: company_enrichment.location.postal_code,
              address: company_enrichment.location.address,
            }
          },
          domain: { connect: { id: domainRecord.id } }, // Associate with domain
        },
      });
      const uniqueEmailList = Array.from(new Set(email_list.map(email => email.email)))
      .map(email => email_list.find(e => e.email === email));
    
      // Create Emails
      const emailRecords = await Promise.all(
        uniqueEmailList.map(async (email) => {
          return await db.email.upsert({
            where: { email: email.email },
            update: {
              emailAnonId: email.email_anon_id,
              emailStatus: email.verification.status,
              firstName: email.first_name,
              lastName: email.last_name,
              email_type: email.email_type,
              domain: { connect: { id: domainRecord.id } },
            },
            create: {
              email: email.email,
              emailAnonId: email.email_anon_id,
              emailStatus: email.verification.status,
              firstName: email.first_name,
              lastName: email.last_name,
              email_type: email.email_type,
              domain: { connect: { id: domainRecord.id } },
            },
          });
        })
      );
      

      // Send response
      res.status(200).json({
        message: "Data inserted successfully",
        domain: domainRecord,
        companyEnrichment: companyEnrichmentRecord,
        emails: emailRecords,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error inserting data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
