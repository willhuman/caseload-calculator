import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Therapist Caseload Calculator | Nesso",
  description: "Find your ideal caseload to reach your goals. Calculate the perfect client load for your therapy practice.",
  keywords: ["therapist", "caseload", "calculator", "mental health", "practice management"],
  openGraph: {
    title: "Therapist Caseload Calculator | Nesso",
    description: "Find your ideal caseload to reach your goals. Calculate the perfect client load for your therapy practice.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
        />
        <Analytics />
      </body>
    </html>
  );
}
