export function CalculatorStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Therapist Caseload Calculator",
    "applicationCategory": "BusinessApplication",
    "description": "Calculate your ideal therapy practice caseload based on income goals and weekly hours. Free tool for therapists, counselors, and mental health professionals in private practice.",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "Nesso",
      "url": "https://www.nessoapp.com"
    },
    "featureList": [
      "Calculate session fees based on income goals",
      "Determine optimal client load per week",
      "Account for cancellation rates",
      "Factor in documentation and admin time",
      "Customize session length",
      "Set weekly work hour limits"
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Therapists, Counselors, Mental Health Professionals, Private Practice Owners"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
