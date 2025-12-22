import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/smtp";

export async function POST(req: NextRequest) {
  const { admin, email, task_id } = await req.json();

  if (!admin || !email || !task_id) {
    return NextResponse.json(
      { error: "admin, email, and task_id are required" },
      { status: 400 }
    );
  }

  try {
    const taskUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tasks/yourtask?id=${task_id}&admin=${admin}`;

    await transporter.sendMail({
      from: `"${admin}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Task Notification from ${admin}`,
      html: `
        <p>Hello,</p>
        <p>Your task from <strong>${admin}</strong> is assigned.</p>
        <p><a href="${taskUrl}">View Task</a></p>
        <p>Provider oneManage</p>
      `,
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

