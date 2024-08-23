"use server"

import db from "@/db/db"
import nodemailer from "nodemailer"
import { z } from "zod"

const emailSchema = z.string().email()

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service provider
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"))

  if (result.success === false) {
    return { error: "Invalid email address" }
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              filePath:true,
              description: true,
            },
          },
        },
      },
    },
  })

  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    }
  }

  const orders = await Promise.all(user.orders.map(async order => {
    return {
      ...order,
      downloadVerificationId: (
        await db.downloadVerification.create({
          data: {
            expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
            productId: order.product.id,
          },
        })
      ).id,
    }
  }))

  // Generate HTML content
  const orderItemsHtml = orders.map(order => `
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 18px; color: #333;">${order.product.name}</h2>
      <img src="${order.product.imagePath}" alt="${order.product.name}" style="
        display: block;
        max-width: 100%;
        height: auto;
        margin-bottom: 10px;
      "/>
      <p style="font-size: 16px; color: #555;">Order ID: ${order.id}</p>
      <p style="font-size: 16px; color: #555;">Price Paid: $${order.pricePaidInCents / 100}</p>
      <a href="${order.product.filePath}" style="
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
        text-align: center;
      ">Download Here</a>
    </div>
  `).join('')

  const emailHtml = `
    <html>
      <body>
        <h1 style="font-size: 24px; color: #333;">Your Order History</h1>
        <p style="font-size: 16px; color: #555;">Here is your order history and download links:</p>
        ${orderItemsHtml}
      </body>
    </html>
  `

  // Send Email
  try {
    await transporter.sendMail({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Your Order History",
      html: emailHtml,
    })

    return {
      message:
        "Check your email to view your order history and download your products.",
    }
  } catch (error) {
    console.error("Failed to send email", error)
    return { error: "There was an error sending your email. Please try again." }
  }
}
