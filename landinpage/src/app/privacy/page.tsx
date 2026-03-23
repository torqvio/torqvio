import { Metadata } from "next";
import { Navigation } from "@/app/components/Navigation";
import { ComingSoonFooter } from "@/app/components/coming-soon/ComingSoonFooter";
import AnimatedBackground from "@/app/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Torqvio's privacy policy - How we collect, use, and protect your data.",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg text-txt relative">
      <AnimatedBackground />
      <Navigation />
      <main className="relative z-10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            
            <p className="text-sm text-txt3 mb-8">Last updated: March 23, 2026</p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                Torqvio ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our durable serverless workflow platform.
              </p>
              <p className="text-txt2 leading-relaxed">
                By using Torqvio, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">Account Information</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2 mb-6">
                <li>Email address and name</li>
                <li>Authentication credentials</li>
                <li>Organization information (if applicable)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Usage Data</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                We automatically collect information about your use of our services:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2 mb-6">
                <li>Workflow execution logs and metrics</li>
                <li>API usage statistics</li>
                <li>Performance and error data</li>
                <li>Feature usage patterns</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Technical Information</h3>
              <p className="text-txt2 leading-relaxed mb-4">
                We collect technical data to ensure service reliability:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>IP address and access logs</li>
                <li>Browser and device information</li>
                <li>System performance metrics</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-txt2 space-y-3">
                <li>Provide and maintain our services</li>
                <li>Process and execute your workflows</li>
                <li>Monitor service performance and reliability</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Improve our products and user experience</li>
                <li>Communicate about service updates and security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Encryption in transit and at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication systems</li>
                <li>Secure data centers with 24/7 monitoring</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                We retain your data only as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Fulfill legitimate business purposes</li>
              </ul>
              <p className="text-txt2 leading-relaxed mt-4">
                You can delete your account and associated data at any time from your account settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                We may share data with trusted third-party service providers:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Cloud infrastructure providers (AWS, GCP, Azure)</li>
                <li>Payment processors (Stripe)</li>
                <li>Analytics services (with anonymized data)</li>
                <li>Email delivery services</li>
              </ul>
              <p className="text-txt2 leading-relaxed mt-4">
                We ensure these providers maintain appropriate security measures and only use data for specified purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-txt2 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Request data processing limitations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
              <p className="text-txt2 leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and other legal mechanisms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-txt2 leading-relaxed">
                Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-txt2 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-txt2 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or your data rights, please contact us:
              </p>
              <div className="text-txt2 space-y-2">
                <p>Email: <a href="mailto:privacy@torqvio.com" className="text-purple hover:text-purple-l">privacy@torqvio.com</a></p>
                <p>Legal: <a href="mailto:legal@torqvio.com" className="text-purple hover:text-purple-l">legal@torqvio.com</a></p>
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
