import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Torqvio',
  description: 'Privacy Policy for Torqvio workflow automation platform.',
}

const EFFECTIVE_DATE = 'April 27, 2026'
const COMPANY = 'Torqvio'
const EMAIL = 'privacy@torqvio.com'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-gray-400 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      <div className="text-gray-500 text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function DataRow({ category, data, purpose, retention }: {
  category: string; data: string; purpose: string; retention: string
}) {
  return (
    <tr className="border-b border-[#1c2333] last:border-0">
      <td className="py-3 pr-4 text-gray-300 font-medium align-top text-xs">{category}</td>
      <td className="py-3 pr-4 text-gray-500 align-top text-xs">{data}</td>
      <td className="py-3 pr-4 text-gray-500 align-top text-xs">{purpose}</td>
      <td className="py-3 text-gray-500 align-top text-xs">{retention}</td>
    </tr>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* back */}
        <Link
          href="/login?tab=register"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-10 border-t border-[#1c2333] pt-10">

          <Section title="Overview">
            <p>
              {COMPANY} ("we", "us", "our") is committed to protecting your personal data. This Privacy
              Policy explains what information we collect, how we use it, and your rights in relation to
              it. We comply with the EU General Data Protection Regulation (GDPR) and other applicable
              privacy laws.
            </p>
            <p>
              If you have questions, contact our privacy team at{' '}
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                {EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="1. Data We Collect">
            <p>We collect the following categories of personal data:</p>

            <div className="rounded-xl border border-[#1c2333] overflow-hidden mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1c2333] bg-[#0d1117]">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wider">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2333] px-4">
                  <tr className="border-b border-[#1c2333] last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Account</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Name, email, password hash</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Authentication, account management</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Until account deleted + 30d</td>
                  </tr>
                  <tr className="border-b border-[#1c2333] last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Usage</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Workflow runs, execution counts, API calls</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Billing, plan limits, analytics</td>
                    <td className="px-4 py-3 text-gray-500 align-top">13 months</td>
                  </tr>
                  <tr className="border-b border-[#1c2333] last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Logs</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Execution logs, error traces, step output</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Debugging, observability</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Per plan (7–unlimited days)</td>
                  </tr>
                  <tr className="border-b border-[#1c2333] last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Billing</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Payment method (tokenized), invoices</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Subscription management</td>
                    <td className="px-4 py-3 text-gray-500 align-top">7 years (legal obligation)</td>
                  </tr>
                  <tr className="border-b border-[#1c2333] last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Technical</td>
                    <td className="px-4 py-3 text-gray-500 align-top">IP address, browser, session tokens</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Security, fraud prevention</td>
                    <td className="px-4 py-3 text-gray-500 align-top">90 days</td>
                  </tr>
                  <tr className="last:border-0">
                    <td className="px-4 py-3 text-gray-300 font-medium align-top">Communications</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Support emails, feedback</td>
                    <td className="px-4 py-3 text-gray-500 align-top">Customer support</td>
                    <td className="px-4 py-3 text-gray-500 align-top">3 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-gray-600 text-xs mt-2">
              We do not collect your workflow payload data unless it is explicitly sent to our logging
              infrastructure. You control what data passes through your workflows.
            </p>
          </Section>

          <Section title="2. Legal Basis for Processing (GDPR)">
            <p>We process your personal data under the following legal bases:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500">
              <li><span className="text-gray-400 font-medium">Contract performance</span> — to provide the Service you signed up for</li>
              <li><span className="text-gray-400 font-medium">Legitimate interests</span> — to improve the Service, detect fraud, and ensure security</li>
              <li><span className="text-gray-400 font-medium">Legal obligation</span> — to comply with financial and regulatory requirements</li>
              <li><span className="text-gray-400 font-medium">Consent</span> — for optional marketing communications (you can withdraw at any time)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc list-inside space-y-1.5 text-gray-500">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process payments and manage your subscription</li>
              <li>Send service-critical notifications (security alerts, billing, downtime)</li>
              <li>Respond to support requests</li>
              <li>Detect and prevent fraud, abuse, or unauthorized access</li>
              <li>Comply with legal obligations</li>
              <li>With your consent: send product updates and newsletters</li>
            </ul>
            <p>We do not sell your personal data. Ever.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We share data with the following categories of third-party processors:</p>
            <div className="rounded-xl border border-[#1c2333] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1c2333] bg-[#0d1117]">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Provider</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Purpose</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2333]">
                  {[
                    ['Stripe', 'Payment processing', 'USA / EU'],
                    ['AWS / GCP', 'Cloud infrastructure & storage', 'EU (primary)'],
                    ['Postmark', 'Transactional email', 'USA (SCCs)'],
                    ['Sentry', 'Error monitoring', 'USA (SCCs)'],
                  ].map(([provider, purpose, location]) => (
                    <tr key={provider} className="last:border-0">
                      <td className="px-4 py-3 text-gray-300 font-medium">{provider}</td>
                      <td className="px-4 py-3 text-gray-500">{purpose}</td>
                      <td className="px-4 py-3 text-gray-500">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 text-xs">
              SCCs = Standard Contractual Clauses (EU-approved transfer mechanism).
            </p>
          </Section>

          <Section title="5. Cookies">
            <Sub title="5.1 What we use">
              <p>
                We use only essential cookies required to operate the Service (session token, CSRF
                protection). We do not use third-party advertising cookies or cross-site tracking.
              </p>
            </Sub>
            <Sub title="5.2 What we don't use">
              <p>
                No Google Analytics, no Facebook Pixel, no ad retargeting. Our analytics are
                privacy-preserving and server-side only.
              </p>
            </Sub>
          </Section>

          <Section title="6. Data Security">
            <p>We protect your data using industry-standard measures including:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500">
              <li>Encryption in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Hashed passwords (bcrypt)</li>
              <li>API keys stored as hashed tokens, never in plaintext</li>
              <li>Role-based access controls for our internal team</li>
              <li>Regular security audits</li>
            </ul>
            <p>
              If we become aware of a security breach that affects your data, we will notify you within
              72 hours as required by GDPR.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Under GDPR and applicable privacy laws, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500">
              <li><span className="text-gray-400 font-medium">Access</span> — request a copy of the personal data we hold about you</li>
              <li><span className="text-gray-400 font-medium">Rectification</span> — correct inaccurate or incomplete data</li>
              <li><span className="text-gray-400 font-medium">Erasure</span> — request deletion of your data ("right to be forgotten")</li>
              <li><span className="text-gray-400 font-medium">Portability</span> — receive your data in a machine-readable format</li>
              <li><span className="text-gray-400 font-medium">Restriction</span> — ask us to restrict processing in certain circumstances</li>
              <li><span className="text-gray-400 font-medium">Object</span> — object to processing based on legitimate interests</li>
              <li><span className="text-gray-400 font-medium">Withdraw consent</span> — for any processing based on consent (e.g. marketing emails)</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                {EMAIL}
              </a>
              . We will respond within 30 days. You also have the right to lodge a complaint with your
              local data protection authority.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain personal data only for as long as necessary to fulfil the purposes outlined in
              this policy, or as required by law. When you delete your account, we permanently delete
              your data within 30 days, except where retention is legally required (e.g. financial
              records).
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              The Service is not directed at children under 18. We do not knowingly collect personal
              data from anyone under 18. If you believe we have inadvertently collected such data,
              contact us immediately and we will delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you by email or in-app
              notice at least 14 days before material changes take effect. The effective date at the top
              of this page always reflects when the current version was published.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For privacy questions, data requests, or to report a concern:
            </p>
            <div className="rounded-xl border border-[#1c2333] bg-[#0d1117] px-4 py-4 text-sm text-gray-400 space-y-1">
              <p className="font-medium text-white">{COMPANY} Privacy Team</p>
              <p>
                Email:{' '}
                <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                  {EMAIL}
                </a>
              </p>
            </div>
          </Section>

        </div>

        {/* footer links */}
        <div className="mt-16 pt-8 border-t border-[#1c2333] flex items-center justify-between text-xs text-gray-600">
          <span>© {new Date().getFullYear()} {COMPANY}</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-gray-400 transition-colors">Pricing</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
