import { NextResponse } from "next/server";
import { transporter } from "@/lib/smtp";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email, message }: { email?: string; message?: string;} = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Actually send the email
    await transporter.sendMail({
      from: `"OneManager" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Message from OneManager",
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
