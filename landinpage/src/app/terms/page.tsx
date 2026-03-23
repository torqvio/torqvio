import { Metadata } from "next";
import { Navigation } from "@/app/components/Navigation";
import { ComingSoonFooter } from "@/app/components/coming-soon/ComingSoonFooter";
import AnimatedBackground from "@/app/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Torqvio's terms of service - Legal terms for using our durable serverless workflow platform.",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg text-txt relative">
      <AnimatedBackground />
      <Navigation />
      <main className="relative z-10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            
            <p className="text-sm text-txt3 mb-8">Last updated: March 23, 2026</p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                By accessing and using Torqvio ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-txt2 leading-relaxed">
                These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                Torqvio provides a durable serverless workflow platform that includes:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Durable serverless cron jobs</li>
                <li>Webhook processing and delivery</li>
                <li>Multi-step workflow orchestration</li>
                <li>Real-time observability and monitoring</li>
                <li>Automatic retry and error handling</li>
                <li>API access and SDKs</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
              
              <h3 className="text-xl font-medium mb-3">Registration</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2 mb-6">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Account Security</h3>
              <p className="text-txt2 leading-relaxed">
                You are responsible for maintaining the security of your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Send unsolicited communications or spam</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Overload or interfere with our infrastructure</li>
                <li>Use the Service for illegal or unethical purposes</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Data and Content</h2>
              
              <h3 className="text-xl font-medium mb-3">Your Data</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                You retain ownership of all data you submit to the Service. You grant us a limited, non-exclusive license to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2 mb-6">
                <li>Process and execute your workflows</li>
                <li>Store data necessary for service delivery</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Generate aggregated, anonymized statistics</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Data Processing</h3>
              <p className="text-txt2 leading-relaxed">
                We process your workflow data to provide the Service, including executing workflows, storing logs, and providing analytics. We implement appropriate security measures to protect your data.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Service Availability and Performance</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                We strive to provide reliable service, but we do not guarantee:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2 mb-6">
                <li>Uninterrupted or error-free operation</li>
                <li>Specific performance levels or response times</li>
                <li>Availability of all features at all times</li>
              </ul>
              <p className="text-txt2 leading-relaxed">
                We may temporarily suspend the Service for maintenance, upgrades, or other operational reasons. We will provide reasonable notice when possible.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Pricing and Payment</h2>
              
              <h3 className="text-xl font-medium mb-3">Free Tier</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                Torqvio offers a free tier with limited usage. Free tier usage is subject to fair use policies and may be restricted if abused.
              </p>

              <h3 className="text-xl font-medium mb-3">Paid Plans</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                Paid plans are billed monthly or annually in advance. You agree to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Provide accurate payment information</li>
                <li>Pay all charges incurred under your account</li>
                <li>Review and accept any price changes</li>
                <li>Maintain active payment methods for subscription services</li>
              </ul>
              <p className="text-txt2 leading-relaxed mt-4">
                All fees are non-refundable except as required by law.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              
              <h3 className="text-xl font-medium mb-3">Our Intellectual Property</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by Torqvio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3">Your Intellectual Property</h3>
              <p className="text-txt2 leading-relaxed">
                You retain all rights to your data and workflows. You grant us no rights to your intellectual property except as necessary to provide the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
              <p className="text-txt2 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, if you breach the Terms.
              </p>
              <p className="text-txt2 leading-relaxed mb-4">
                Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
              </p>
              <p className="text-txt2 leading-relaxed">
                You may delete your account at any time through your account settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                To the maximum extent permitted by law, Torqvio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              <p className="text-txt2 leading-relaxed">
                Our total liability to you for any cause of action shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p className="text-txt2 leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included on this Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-txt2 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Torqvio Inc. is incorporated, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-txt2 leading-relaxed">
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our site prior to the effective date of the changes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="text-txt2 space-y-2">
                <p>Email: <a href="mailto:legal@torqvio.com" className="text-purple hover:text-purple-l">legal@torqvio.com</a></p>
                <p>Support: <a href="mailto:support@torqvio.com" className="text-purple hover:text-purple-l">support@torqvio.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="relative z-10">
        <ComingSoonFooter />
      </footer>
    </div>
  );
}
