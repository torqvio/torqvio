import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — Torqvio',
  description: 'Terms of Service for Torqvio workflow automation platform.',
}

const EFFECTIVE_DATE = 'April 27, 2026'
const COMPANY = 'Torqvio'
const EMAIL = 'legal@torqvio.com'

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

export default function TermsPage() { 
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-10 border-t border-[#1c2333] pt-10">

          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using {COMPANY} ("the Service"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the Service.
            </p>
            <p>
              These Terms apply to all users, including individuals and organizations accessing the Service
              on behalf of a company. If you are using the Service on behalf of an organization, you
              represent that you have authority to bind that organization to these Terms.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              {COMPANY} is a workflow automation and durable execution platform that lets you build,
              deploy, and monitor automated workflows. The Service includes a web dashboard, API access,
              webhook ingestion, event streaming, scheduling, and related developer tools.
            </p>
          </Section>

          <Section title="3. Accounts">
            <Sub title="3.1 Registration">
              <p>
                You must register for an account to use the Service. You agree to provide accurate,
                current, and complete information and to keep it updated. You are responsible for all
                activity under your account.
              </p>
            </Sub>
            <Sub title="3.2 Security">
              <p>
                You are responsible for maintaining the security of your account credentials and API keys.
                Notify us immediately at {EMAIL} if you suspect unauthorized access. We are not liable for
                losses caused by unauthorized use of your account.
              </p>
            </Sub>
            <Sub title="3.3 Age">
              <p>You must be at least 18 years old to use the Service.</p>
            </Sub>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Violate any applicable law or regulation</li>
              <li>Send spam, malware, or other malicious content</li>
              <li>Attempt to gain unauthorized access to any system or network</li>
              <li>Conduct DDoS attacks or other disruptive activity</li>
              <li>Scrape or harvest data from the Service without permission</li>
              <li>Reverse engineer or attempt to extract source code from the Service</li>
              <li>Use the Service for cryptocurrency mining</li>
              <li>Resell or sublicense the Service without our written consent</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these restrictions
              without prior notice.
            </p>
          </Section>

          <Section title="5. Plans, Billing & Payment">
            <Sub title="5.1 Plans">
              <p>
                The Service is offered under free and paid plans. Plan limits and features are described
                on our{' '}
                <Link href="/pricing" className="text-purple-400 hover:text-purple-300 transition-colors">
                  pricing page
                </Link>
                . We may change plan features or pricing with 30 days' notice.
              </p>
            </Sub>
            <Sub title="5.2 Payment">
              <p>
                Paid plans are billed monthly or annually in advance. Payment is processed by Stripe.
                All fees are non-refundable except as required by law or stated otherwise in writing.
              </p>
            </Sub>
            <Sub title="5.3 Usage-Based Charges">
              <p>
                Growth Mode and Autopilot Mode plans may include usage-based or revenue-share components.
                Charges are calculated as described on the pricing page and in your account dashboard.
              </p>
            </Sub>
            <Sub title="5.4 Overdue Accounts">
              <p>
                If payment fails, we may suspend your account after 7 days' notice. Continued failure to
                pay may result in termination of your account and deletion of your data.
              </p>
            </Sub>
          </Section>

          <Section title="6. Intellectual Property">
            <Sub title="6.1 Your Content">
              <p>
                You retain ownership of all workflow definitions, data, and other content you create or
                upload to the Service ("Your Content"). By using the Service, you grant us a limited
                license to process Your Content solely to provide the Service.
              </p>
            </Sub>
            <Sub title="6.2 Our IP">
              <p>
                {COMPANY} and all associated software, documentation, and trademarks are owned by us or
                our licensors. Nothing in these Terms grants you ownership of any part of the Service.
              </p>
            </Sub>
          </Section>

          <Section title="7. Data Processing">
            <p>
              By using the Service, you acknowledge that we process data as described in our{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy Policy
              </Link>
              . If you process personal data through your workflows, you are responsible for ensuring you
              have a lawful basis to do so.
            </p>
          </Section>

          <Section title="8. Service Availability">
            <p>
              We aim to provide reliable, high-availability service, but we do not guarantee uninterrupted
              uptime. We may perform maintenance with or without notice. Scheduled maintenance will be
              communicated in advance where possible.
            </p>
            <p>
              We are not liable for service interruptions caused by factors outside our reasonable control,
              including third-party infrastructure failures, force majeure events, or network issues.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p className="uppercase tracking-wide text-xs text-gray-500">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. TO THE
              MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
              IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p className="uppercase tracking-wide text-xs text-gray-500">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()}'S TOTAL LIABILITY FOR ANY
              CLAIM ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER
              OF (A) THE AMOUNTS PAID BY YOU IN THE 12 MONTHS PRIOR TO THE CLAIM OR (B) €100.
              WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless {COMPANY} and its officers, directors,
              employees, and agents from any claims, damages, or expenses (including reasonable legal fees)
              arising from your use of the Service, violation of these Terms, or infringement of any
              third-party rights.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              Either party may terminate the agreement at any time. You may close your account from the
              Settings page. We may terminate or suspend your account for cause immediately, or for any
              other reason with 30 days' notice.
            </p>
            <p>
              Upon termination, your access to the Service will end. We will retain your data for 30 days
              after termination, after which it will be permanently deleted. You may request an export
              before termination.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email or in-app notice
              at least 14 days before material changes take effect. Continued use of the Service after
              changes take effect constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by the laws of the European Union and the country in which
              {COMPANY} is incorporated, without regard to conflict of law principles. Any disputes shall
              be resolved in the courts of that jurisdiction.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                {EMAIL}
              </a>
              .
            </p>
          </Section>

        </div>

        {/* footer links */}
        <div className="mt-16 pt-8 border-t border-[#1c2333] flex items-center justify-between text-xs text-gray-600">
          <span>© {new Date().getFullYear()} {COMPANY}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-gray-400 transition-colors">Pricing</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
