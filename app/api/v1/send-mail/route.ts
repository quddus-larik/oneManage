import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email, message }: { email?: string; message?: string } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Message from Admin onManager",
      text: message,
    });

    return NextResponse.json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (err) {
    console.error("Mail error:", err);
    return NextResponse.json({ error: "Failed to send mail" }, { status: 500 });
  }
}
