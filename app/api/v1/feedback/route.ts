import { transporter } from "@/lib/smtp";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const { message } = await req.json();

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { err: true, data: "Message is required" },
                { status: 400 }
            );
        }

        await transporter.sendMail({
            from: `"Feedback" <${process.env.SMTP_USER}>`,
            to: process.env.BUSINESS_SMTP,
            subject: "Message from Feedback oneManager",
            text: message,
        });

        return NextResponse.json(
            { err: false, data: "Feedback sent successfully" },
            { status: 200 }
        );

    } catch (err) {
        return NextResponse.json(
            { err: true, data: "Internal server error", referenceErr: err },
            { status: 500 }
        );
    }
}
