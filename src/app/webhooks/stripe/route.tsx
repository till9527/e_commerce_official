import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  let event;

  try {
    // Parse and verify the incoming request body and Stripe signature
    const rawBody = await req.text(); // Get raw request body
    const signature = req.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // If verification fails, return an error response
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return new NextResponse("Webhook signature verification failed.", { status: 400 });
  }

  // Handle specific Stripe event types
  if (event.type === "charge.succeeded") {
    const charge = event.data.object; // Extract the charge object from the event
    const productId = charge.metadata.productId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;

    // Find the product associated with the charge
    const product = await db.product.findUnique({ where: { id: productId } });
    if (product == null || email == null) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Upsert the user and create a new order record
    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents } },
    };
    const { orders: [order] } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    // Create a download verification record with a 24-hour expiry
    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      },
    });

    // Send an order confirmation email to the user
    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Order Confirmation",
      react: (
        <PurchaseReceiptEmail
          order={order}
          product={product}
          downloadVerificationId={downloadVerification.id}
        />
      ),
    });
  }

  // Return a success response to Stripe
  return new NextResponse("Webhook received", { status: 200 });
}

