import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"



export const metadata: Metadata = {
  title: "oneManage",
  description: "Minimal Employee management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
            {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
