"use client"
import { TitleHeader } from "@/components/custom/main-heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Dashboard from "../provider/ui";

export default function Page() {
    const [Feedback, setFeedback] = useState("");

    const handleSend = async () => {
        try {
            const res = await fetch("/api/v1/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: Feedback }),
            });

            const data = await res.json();
            setFeedback("");
        } catch (err) {
            console.log("Error:", err);
        }
    };

    return (
        <Dashboard>
            <div className="p-4">

                <TitleHeader
                    label="Feedback"
                    span="Share your thought about oneManage with Us. The Problems, Solutions that are occurred."
                />
                <div className="w-full mt-3">
                    <Textarea
                        className="w-96 mb-2"
                        placeholder="Write your feedback..."
                        value={Feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button onClick={handleSend}>Send</Button>
                </div>
            </div>
        </Dashboard>
    );
}
