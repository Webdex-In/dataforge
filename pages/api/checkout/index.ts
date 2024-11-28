import { db } from "../../../config/db";
import { getAuth } from "@clerk/nextjs/server";
const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { productId, name, price, credits } = req.body;
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(400).json({ error: "User is not authenticated" });
      }

      // Fetch the user's current status
      const userRecord = await db.user.findUnique({
        where: { userId: userId },
        select: { freeCredit: true, totalCredit: true },
      });

      // If the user record doesn't exist
      if (!userRecord) {
        return res.status(404).json({ error: "User not found" });
      }

      // Handle trial verification
      if (!userRecord.freeCredit) {
        // Update the user record to set isTrialVerified to true and add the credits
        const cd = await db.user.update({
          where: { userId: userId },
          data: {
            freeCredit: true,
            totalCredit: userRecord.totalCredit + parseInt(credits),
          },
        });

        if(cd){
          return res.status(200).json({ url:"true" });

        }
      }

      // Retrieve prices associated with the product
      const prices = await stripe.prices.list({ product: productId });

      // Identify recurring and one-time prices
      const recurringPrice = prices.data.find((price) => price.recurring);
      const oneTimePrice = prices.data.find((price) => !price.recurring);

      // Determine which price ID to use based on availability
      const priceId = oneTimePrice ? oneTimePrice.id : recurringPrice ? recurringPrice.id : null;
      const mode = oneTimePrice ? "payment" : "subscription";

      if (!priceId) {
        return res.status(400).json({ error: "No valid price found for this product." });
      }

      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode, // Dynamic mode for one-time or recurring
        success_url: `${req.headers.origin}/api/payment-status/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
        metadata: { productId, name },
      });

      // Store the order in the database
      await db.Order.create({
        data: {
          userId: userId,
          paymentId: session.payment_intent || session.id,
          productId: productId,
          priceId: priceId,
          quantity: 1,
          mode: mode,
          status: "pending",
          currency: session.currency,
          sessionId: session.id,
          metadata: session.metadata,
          planeName: name,
          credits: String(credits),
          price: String(price),
        },
      });

      // Respond with the Checkout session URL
      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("Error occurred during payment process:", err);
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
}
