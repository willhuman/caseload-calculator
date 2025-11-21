import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Therapist Caseload Calculator',
  description: 'Privacy policy for the Therapist Caseload Calculator - how we protect and handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F3' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-nesso-purple hover:text-nesso-purple/80 transition-colors font-medium"
          >
            ← Back to Calculator
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-nesso-navy mb-4">Privacy Policy</h1>
          <p className="text-lg text-nesso-ink/70">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-nesso-card rounded-2xl ring-1 ring-black/5 shadow-sm p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Introduction</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              Nesso (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Therapist Caseload Calculator (the &ldquo;Service&rdquo;).
            </p>
            <p className="text-nesso-ink leading-relaxed">
              This tool is designed to help mental health professionals plan sustainable caseloads and is not intended to replace professional judgment or clinical decision-making.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-nesso-navy mb-3">Information You Provide</h3>
            <ul className="list-disc list-inside text-nesso-ink space-y-2 mb-6">
              <li>Income goals and weekly hour targets you enter into the calculator</li>
              <li>Session parameters and documentation preferences</li>
            </ul>
            <p className="text-nesso-ink leading-relaxed mb-6 text-sm italic">
              Note: All calculation data is processed locally in your browser and is not transmitted to or stored on our servers.
            </p>

            <h3 className="text-lg font-medium text-nesso-navy mb-3">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>Usage analytics and interaction patterns (via privacy-focused analytics)</li>
              <li>Browser type, device information, and operating system</li>
              <li>IP address and general geographic location</li>
              <li>Pages visited and time spent using the Service</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>To provide and maintain the caseload calculation service</li>
              <li>To improve our Service and develop new features</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To ensure the security and integrity of our Service</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Data Storage and Security</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>All calculation data is processed locally in your browser and not transmitted to our servers</li>
              <li>Analytics data is collected through Vercel Web Analytics with privacy-focused practices</li>
              <li>We use industry-standard encryption for data transmission</li>
              <li>Access to analytics data is limited to authorized personnel only</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Information Sharing and Disclosure</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist in operating our Service (under strict confidentiality agreements)</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>In connection with a business transfer or merger (with prior notice)</li>
            </ul>
          </section>

          {/* Professional Context */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Professional Use Considerations</h2>
            <div className="bg-nesso-navy/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-nesso-navy mb-3">Important Note for Mental Health Professionals</h3>
              <p className="text-nesso-ink leading-relaxed mb-3">
                This calculator is a planning tool and should not be considered as providing professional advice. Users are responsible for:
              </p>
              <ul className="list-disc list-inside text-nesso-ink space-y-2">
                <li>Ensuring compliance with their professional licensing requirements</li>
                <li>Following applicable state and federal regulations</li>
                <li>Making independent professional judgments about their practice</li>
                <li>Protecting client confidentiality in their own practice management</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Your Privacy Rights</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data in a portable format</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience and gather analytics data. These help us:
            </p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze how you use our Service</li>
              <li>Improve functionality and performance</li>
              <li>Provide relevant content and features</li>
            </ul>
            <p className="text-nesso-ink leading-relaxed mt-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Children&apos;s Privacy</h2>
            <p className="text-nesso-ink leading-relaxed">
              Our Service is designed for professional use by licensed mental health practitioners and is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Changes to This Privacy Policy</h2>
            <p className="text-nesso-ink leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. Continued use of our Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Contact Information</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-nesso-navy/5 rounded-xl p-6">
              <p className="text-nesso-ink mb-2"><strong>Nesso Labs, Inc.</strong></p>
              <p className="text-nesso-ink mb-2"><strong>Email:</strong> hello@nessoapp.com</p>
              <p className="text-nesso-ink"><strong>Website:</strong> www.nessoapp.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
