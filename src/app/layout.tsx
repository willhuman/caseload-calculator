import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://therapycaseloadcalculator.com'),
  title: "Therapist Caseload Calculator - Find Your Ideal Session Fee & Client Load",
  description: "Free calculator for therapists to determine ideal session fees and caseload based on your income goals and weekly hours. Build a sustainable private practice with the right balance.",
  keywords: [
    "therapist caseload calculator",
    "therapy session fee calculator",
    "private practice planning",
    "therapist income planning",
    "mental health private practice",
    "counselor business planning",
    "therapy practice sustainability",
    "private practice calculator",
    "mental health",
    "therapist income calculator",
    "counselor caseload",
    "practice management",
    "therapist burnout prevention",
    "sustainable therapy practice"
  ],
  authors: [{ name: "Nesso", url: "https://www.nessoapp.com" }],
  creator: "Nesso",
  publisher: "Nesso",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Therapist Caseload Calculator - Find Your Ideal Session Fee & Client Load",
    description: "Free calculator for therapists to determine ideal session fees and caseload based on your income goals and weekly hours.",
    type: "website",
    url: "https://therapycaseloadcalculator.com",
    siteName: "Therapist Caseload Calculator",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Therapist Caseload Calculator - Find Your Ideal Session Fee & Client Load",
    description: "Free calculator for therapists to determine ideal session fees and caseload based on your income goals and weekly hours.",
    creator: "@nessoapp",
  },
  alternates: {
    canonical: "https://therapycaseloadcalculator.com",
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
