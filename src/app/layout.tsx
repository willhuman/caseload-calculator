import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://caseload.nessoapp.com'),
  title: "Therapist Caseload Calculator | Nesso",
  description: "Free calculator for therapists and mental health professionals. Find your ideal caseload based on income goals and weekly hours. Calculate session fees, client load, and manage your private practice sustainability.",
  keywords: [
    "therapist caseload calculator",
    "therapy session fee calculator",
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
    title: "Therapist Caseload Calculator | Nesso",
    description: "Free calculator for therapists. Find your ideal caseload based on income goals and weekly hours. Calculate session fees and manage your private practice sustainability.",
    type: "website",
    url: "https://caseload.nessoapp.com",
    siteName: "Nesso Caseload Calculator",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Therapist Caseload Calculator | Nesso",
    description: "Free calculator for therapists. Find your ideal caseload based on income goals and weekly hours.",
    creator: "@nessoapp",
  },
  alternates: {
    canonical: "https://caseload.nessoapp.com",
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
