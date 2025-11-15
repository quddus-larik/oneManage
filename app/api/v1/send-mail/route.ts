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

    return NextResponse.json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (err) {
    console.error("Mail error:", err);
    return NextResponse.json({ error: "Failed to send mail" }, { status: 500 });
  }
}
