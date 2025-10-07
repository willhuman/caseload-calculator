import type { Metadata } from "next";

export const metadata: Metadata = {
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
  ],
  openGraph: {
    title: "Calculate Your Ideal Caseload | Nesso",
    description: "Interactive calculator to find your ideal therapy caseload. Set income and time goals, get recommended session fees and client load.",
    type: "website",
    url: "https://caseload.nessoapp.com/plan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculate Your Ideal Caseload | Nesso",
    description: "Interactive calculator to find your ideal therapy caseload. Set income and time goals.",
  },
  alternates: {
    canonical: "https://caseload.nessoapp.com/plan",
  },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
