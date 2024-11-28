import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "/config/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { response, social_url, userEnterUrl,userId } = req.body;

      if (!response || !social_url) {
        return res.status(400).json({ error: "No response data provided" });
      }

      // Retrieve social data for the provided social_url
      const socialRecords = await db.social.findUnique({
        where: { social_url: social_url },
      });

      if (socialRecords) {
        return res.status(200).json({ message: "Data already exit's" });
      }

      const {
        email,
        first_name,
        last_name,
        full_name,
        gender,
        job_title,
        linkedin,
        summary,
        premium,
        skills,
        current_job_year,
        current_job_month,
        picture,
        company,
        work_experience = [],
        education = [],
        location,
      } = response;

      let emailRecord = null;

      // Insert into Email model only if email is provided
      if (email && email.email) {
        emailRecord = await db.email.upsert({
          where: {
            email: email.email, // Query by unique email
          },
          update: {
            emailAnonId: email?.email_anon_id ?? null,
            emailStatus: email?.email_status ?? null,
            email_type: email?.email_type ?? null,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
          },
          create: {
            email: email.email,
            userId: userId,
            emailAnonId: email?.email_anon_id ?? null,
            emailStatus: email?.email_status ?? null,
            email_type: email?.email_type ?? null,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
          },
        });
      }

      // Insert into Social model
      const socialRecord = await db.social.create({
        data: {
          userId: userId,
          userEnterUrl: userEnterUrl ?? "",
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          gender: gender ?? null,
          job_title: job_title ?? null,
          social_url: linkedin ?? null,
          summary: summary ?? null,
          premium: premium?.toString() ?? "false",
          skills: skills ?? null,
          current_job_year: current_job_year?.toString() ?? null,
          current_job_month: current_job_month?.toString() ?? null,
          picture: picture ?? null,

          // Company details (handling null cases)
          company_name: company?.name ?? null,
          company_size: company?.size ?? null,
          company_logo: company?.logo ?? null,
          company_linkedin: company?.linkedin ?? null,
          company_website: company?.website ?? null,
          company_common_email_pattern: company?.common_email_pattern ?? null,
          company_industry: company?.industry ?? null,
          company_founded_in: company?.founded_in?.toString() ?? null,
          company_description: company?.description ?? null,
          company_country: company?.location?.country ?? null,
          company_country_code: company?.location?.country_code ?? null,
          company_state: company?.location?.state ?? null,
          company_city: company?.location?.city ?? null,
          company_timezone: company?.location?.timezone ?? null,
          company_timezone_offset:
            company?.location?.timezone_offset?.toString() ?? null,
          company_postal_code: company?.location?.postal_code ?? null,
          company_address: company?.location?.address ?? null,

          // Location
          country: location?.country ?? null,
          country_code: location?.country_code ?? null,
          state: location?.state ?? null,
          city: location?.city ?? null,
          timezone: location?.timezone ?? null,
          timezone_offset: location?.timezone_offset?.toString() ?? null,
          postal_code: location?.postal_code?.toString() ?? null,
          raw: location?.raw ?? null,

          // Associate the Email record if it exists
          email: emailRecord ? { connect: { id: emailRecord.id } } : undefined,
        },
      });

      // Insert into WorkExperience model (if available)
      const workExperienceRecords = await Promise.all(
        work_experience.map(async (work) => {
          return await db.workExperience.create({
            data: {
              companyId: (work?.company?.id ?? 0).toString(),
              companyName: work?.company?.name ?? null,
              companyLogo: work?.company?.logo ?? null,
              companyUrl: work?.company?.url ?? null,
              employeeStart: work?.company?.employees?.start ?? null,
              employeeEnd: work?.company?.employees?.end ?? null,
              startYear:
                work?.profile_positions?.[0]?.date?.start?.year ?? null,
              startMonth:
                work?.profile_positions?.[0]?.date?.start?.month ?? null,
              endYear: work?.profile_positions?.[0]?.date?.end?.year ?? null,
              endMonth: work?.profile_positions?.[0]?.date?.end?.month ?? null,
              title: work?.profile_positions?.[0]?.title ?? null,
              description: work?.profile_positions?.[0]?.description ?? null,
              employmentType:
                work?.profile_positions?.[0]?.employment_type ?? null,
              location: work?.profile_positions?.[0]?.location ?? null,
              social: { connect: { id: socialRecord.id } }, // Associate with social record
            },
          });
        })
      );

      // Insert into Education model (if available)
      const educationRecords = await Promise.all(
        education.map(async (edu) => {
          return await db.education.create({
            data: {
              schoolName: edu?.school?.name ?? null,
              schoolLogo: edu?.school?.logo ?? null,
              schoolUrl: edu?.school?.url ?? null,
              degreeName: edu?.degree_name ?? null,
              fieldOfStudy: (edu?.field_of_study ?? null).toString(),
              startYear: edu?.date?.start?.year ?? null,
              endYear: edu?.date?.end?.year ?? null,
              social: { connect: { id: socialRecord.id } }, // Associate with social record
            },
          });
        })
      );

      // Send response
      res.status(200).json({
        email: emailRecord,
        social: socialRecord,
        workExperience: workExperienceRecords,
        education: educationRecords,
      });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Error inserting data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
