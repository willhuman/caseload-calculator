import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://therapycaseloadcalculator.com'),
  title: "Calculate Your Ideal Caseload | Therapist Caseload Calculator",
  description: "Interactive calculator to find your ideal therapy caseload. Set income and time goals, get recommended session fees and client load. Perfect for therapists, counselors, and mental health professionals building a sustainable private practice.",
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
    title: "Calculate Your Ideal Caseload | Nesso",
    description: "Interactive calculator to find your ideal therapy caseload. Set income and time goals, get recommended session fees and client load.",
    type: "website",
    url: "https://therapycaseloadcalculator.com",
    siteName: "Nesso Caseload Calculator",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculate Your Ideal Caseload | Nesso",
    description: "Interactive calculator to find your ideal therapy caseload. Set income and time goals.",
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
