import type { NextApiRequest, NextApiResponse } from "next";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { db } from "../../../config/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    // Ensure the user data exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user already exists in the database
    const existingProfile = await db.user.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      // User already exists, redirect to the home page
      return res.redirect(302, '/');
    }

    // If no existing profile, create a new one
    const profile = await db.user.create({
      data: {
        userId: user.id,
        username: user.username || "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress,
        phoneNumber: parseInt(user.phoneNumbers[0]?.phoneNumber.replace(/\D/g, "") || "0"), // Ensure phone number is a number
        isEmailVerified: user.emailAddresses[0]?.verification?.status === "verified",
        isPhoneVerified: user.phoneNumbers[0]?.verification?.status === "verified",
        provider: user.externalAccounts[0]?.type || "unknown",
      },
    });

    // Redirect to the home page after profile creation
    return res.redirect(302, '/pricing');

  } catch (e) {
    console.error("Error occurred:", e);
    res.status(500).json({
      error: "Something went wrong retrieving the user from Clerk",
      message: e.message,
    });
  }
}
