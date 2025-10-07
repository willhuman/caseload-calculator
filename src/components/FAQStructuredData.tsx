export function FAQStructuredData() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I calculate my ideal therapy caseload?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To calculate your ideal therapy caseload, enter your monthly income goal and desired weekly work hours into the calculator. The tool will account for session length, cancellation rates, and documentation time to recommend an optimal session fee and number of clients per week for a sustainable private practice."
        }
      },
      {
        "@type": "Question",
        "name": "What session fee should I charge as a therapist?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your session fee should be based on your income goals, desired work hours, and expected caseload. Use the Nesso Caseload Calculator to input your financial goals and time availability. The calculator factors in cancellation rates and administrative time to recommend a sustainable session fee."
        }
      },
      {
        "@type": "Question",
        "name": "How many therapy clients should I see per week?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The ideal number of therapy clients per week depends on your income goals, session fees, and available work hours. Most therapists see between 15-30 clients per week. Use the calculator to find the right balance for your practice based on your specific goals and to prevent burnout."
        }
      },
      {
        "@type": "Question",
        "name": "What factors should I consider when planning my therapy caseload?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When planning your therapy caseload, consider: 1) Your monthly income goals, 2) Total weekly work hours you want to work, 3) Session length (typically 50-60 minutes), 4) Expected cancellation rate (often 10-15%), 5) Time needed for documentation and admin tasks per client, and 6) Personal sustainability and work-life balance."
        }
      },
      {
        "@type": "Question",
        "name": "How do I build a sustainable private therapy practice?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Building a sustainable private therapy practice requires balancing income goals with realistic work hours. Use tools like the Nesso Caseload Calculator to set appropriate session fees and client loads. Account for administrative time, cancellations, and personal boundaries to prevent burnout while meeting financial goals."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
