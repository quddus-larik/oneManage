import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/smtp";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin");
  const email = url.searchParams.get("email");
  const task_id = url.searchParams.get("task_id");

  if (!admin || !email || !task_id) {
    return NextResponse.json(
      { error: "admin, email, and task_id are required" },
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

  try {
    // Construct task link
    const taskUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tasks/yourtask?id=${task_id}&admin=${admin}`;

    // Send email using centralized transporter
    await transporter.sendMail({
      from: `"${admin}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Task Notification from ${admin}`,
      html: `
        <p>Hello,</p>
        <p>Your task from <strong>${admin}</strong> is assigned. Please complete it.</p>
        <p><a href="${taskUrl}">Click here to view your task</a></p>
        <p>Provider oneManage</p>
      `,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
