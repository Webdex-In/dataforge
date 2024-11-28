import Stripe from "stripe";
import { db } from "../../../config/db";
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    await db.order.update({
      where: { sessionId: session_id }, // Find the order by sessionId
      data: { status: session.payment_status }, // Update the status
    });

    const paymentId = session.id;
    const status = session.payment_status;

    // Verify if payment was successful
    if (session.payment_status === "paid") {
      // console.log(session)
      try {
        const updateOrder = await db.Order.update({
          where: { paymentId: paymentId },
          data: { status: status },
        });

        if (updateOrder) {
          const userId = updateOrder.userId;
          const credits = parseInt(updateOrder.credits);

          const existingCredit = await db.user.findUnique({
            where: { userId: userId },
            select: {
              totalCredit: true,
            },
          });
          const totalCredits = existingCredit.totalCredit + credits;
          await db.user.update({
            where: { userId: userId },
            data: { totalCredit: totalCredits },
          });
        }

        return res.redirect(302, '/');
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    } else {
      try {
        await db.Order.update({
          where: { paymentId: paymentId },
          data: { status: status },
        });
        return res.redirect(302, "/pricing");
      } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error retrieving session:", error.message);
    return res.status(500).json({ error: "Unable to verify payment session" });
  }
}

async function saveTransactionToDatabase({ productId, customerId, price }) {
  // Add your database save logic here
}
