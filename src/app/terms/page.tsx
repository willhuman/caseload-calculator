import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Nesso Caseload Calculator',
  description: 'Terms of service for the Nesso Therapist Caseload Calculator - usage guidelines and legal terms.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-nesso-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-nesso-navy mb-4">Terms of Service</h1>
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

          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Agreement to Terms</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              By accessing and using the Nesso Therapist Caseload Calculator (the &ldquo;Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p className="text-nesso-ink leading-relaxed">
              If you do not agree to these Terms of Service, you must not access or use our Service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Description of Service</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              Nesso provides a web-based caseload planning calculator designed to help mental health professionals estimate sustainable caseloads based on their income goals, available hours, and session parameters.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-amber-800 mb-3">⚠️ Important Professional Disclaimer</h3>
              <p className="text-amber-700 leading-relaxed">
                This tool provides estimates and planning assistance only. It is not intended to replace professional judgment, clinical decision-making, or compliance with licensing board requirements. Users are solely responsible for their professional practice decisions.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Acceptable Use</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Enter false, misleading, or inappropriate information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Distribute malware or engage in any disruptive activities</li>
              <li>Violate any applicable local, state, national, or international law</li>
              <li>Use the Service to make decisions without proper professional oversight</li>
              <li>Share login credentials or account access with unauthorized parties</li>
            </ul>
          </section>

          {/* Professional Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Professional Responsibilities</h2>
            <div className="bg-nesso-navy/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-nesso-navy mb-3">Healthcare Professional Users</h3>
              <p className="text-nesso-ink leading-relaxed mb-4">
                If you are a licensed mental health professional, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-nesso-ink space-y-2">
                <li>You will comply with all applicable professional licensing requirements</li>
                <li>You will follow ethical guidelines established by your professional organizations</li>
                <li>You will maintain appropriate professional liability insurance</li>
                <li>You will protect client confidentiality and privacy in your practice</li>
                <li>You will use independent professional judgment in all clinical decisions</li>
                <li>You will stay current with continuing education requirements</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Intellectual Property Rights</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Nesso and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-nesso-ink leading-relaxed">
              You may not modify, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services obtained from the Service.
            </p>
          </section>

          {/* User Data and Content */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">User Data and Content</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              You retain ownership of any data you input into our Service. All calculations are processed locally in your browser. By using our Service, you grant us permission to:
            </p>
            <ul className="list-disc list-inside text-nesso-ink space-y-2 mb-4">
              <li>Collect anonymized usage analytics to improve the Service</li>
              <li>Use aggregated, anonymous data for service improvement</li>
            </ul>
            <p className="text-nesso-ink leading-relaxed">
              You are responsible for the accuracy and legality of any information you provide.
            </p>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Privacy and Data Protection</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              Your privacy is important to us. Our collection and use of personal information in connection with the Service is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <a
              href="/privacy"
              className="text-nesso-purple hover:text-nesso-purple/80 transition-colors font-medium"
            >
              Read our Privacy Policy →
            </a>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Disclaimers and Limitations</h2>

            <h3 className="text-lg font-medium text-nesso-navy mb-3">Service Availability</h3>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We strive to provide reliable service but cannot guarantee uninterrupted access. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.
            </p>

            <h3 className="text-lg font-medium text-nesso-navy mb-3">Calculation Accuracy</h3>
            <p className="text-nesso-ink leading-relaxed mb-4">
              While we strive for accuracy in our calculations, we do not guarantee that all results are error-free or complete. Users should verify all calculations and consult with appropriate professionals.
            </p>

            <h3 className="text-lg font-medium text-nesso-navy mb-3">Professional Advice Disclaimer</h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700 leading-relaxed font-medium">
                This Service does not provide professional, legal, financial, or clinical advice. It is a planning tool only. Always consult with qualified professionals for specific guidance related to your practice.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Limitation of Liability</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              To the maximum extent permitted by law, Nesso shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <p className="text-nesso-ink leading-relaxed">
              In no event shall Nesso&apos;s total liability to you for all damages exceed the amount you paid for the Service in the twelve months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Indemnification</h2>
            <p className="text-nesso-ink leading-relaxed">
              You agree to defend, indemnify, and hold harmless Nesso and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Termination</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
            </p>
            <p className="text-nesso-ink leading-relaxed">
              Upon termination, your right to use the Service will cease immediately. All provisions that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Governing Law</h2>
            <p className="text-nesso-ink leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the jurisdiction where Nesso is headquartered, without regard to conflict of law provisions. Any legal actions related to these Terms will be subject to the exclusive jurisdiction of the courts in that jurisdiction.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Changes to Terms</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&apos; notice prior to any new terms taking effect.
            </p>
            <p className="text-nesso-ink leading-relaxed">
              Your continued use of the Service after we post any modifications to the Terms constitutes acceptance of those changes.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Severability</h2>
            <p className="text-nesso-ink leading-relaxed">
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible, and the remaining provisions will continue in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Entire Agreement</h2>
            <p className="text-nesso-ink leading-relaxed">
              These Terms constitute the entire agreement between you and Nesso regarding our Service and supersede all prior and contemporaneous written or oral agreements between you and Nesso.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-nesso-navy mb-4">Contact Information</h2>
            <p className="text-nesso-ink leading-relaxed mb-4">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="bg-nesso-navy/5 rounded-xl p-6">
              <p className="text-nesso-ink mb-2"><strong>Nesso Labs, Inc.</strong></p>
              <p className="text-nesso-ink mb-2"><strong>Email:</strong> hello@nessoapp.com</p>
              <p className="text-nesso-ink"><strong>Website:</strong> www.nessoapp.com</p>
            </div>
          </section>
        </div>

        {/* Back to Calculator Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-nesso-purple hover:text-nesso-purple/80 transition-colors font-medium"
          >
            ← Back to Caseload Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
