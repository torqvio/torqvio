import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6C5CE7",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://torqvio.com"),
  title: {
    default: "Torqvio — Durable Serverless Workflows, Crons & Webhooks",
    template: "%s | Torqvio",
  },
  description:
    "Never lose a workflow again. Torqvio gives you durable serverless crons, webhooks, and multi-step workflows with automatic retries, real-time observability, and zero infrastructure. Free to start.",
  keywords: [
    "serverless workflows",
    "durable workflows",
    "serverless crons",
    "webhook processing",
    "workflow automation",
    "background jobs",
    "task orchestration",
    "retry logic",
    "workflow engine",
    "job queue",
    "cron jobs",
    "webhook delivery",
    "observable workflows",
    "circuit breakers",
    "exponential backoff",
    "serverless architecture",
    "cloud automation",
    "API reliability",
    "microservices orchestration",
    "event-driven architecture",
  ],
  authors: [{ name: "Torqvio", url: "https://torqvio.com" }],
  creator: "Torqvio",
  publisher: "Torqvio",
  category: "technology",
  classification: "Developer Tools",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Torqvio",
    title: "Torqvio — Durable Serverless Workflows, Crons & Webhooks",
    description:
      "Never lose a workflow again. Durable crons, webhooks, and multi-step workflows with automatic retries and real-time observability. Free to start.",
    url: "https://torqvio.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Torqvio — Durable Serverless Workflows",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@torqvio",
    creator: "@torqvio",
    title: "Torqvio — Durable Serverless Workflows, Crons & Webhooks",
    description:
      "Never lose a workflow again. Durable crons, webhooks, and multi-step workflows with automatic retries and real-time observability.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://torqvio.com",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://torqvio.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://torqvio.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Features",
          item: "https://torqvio.com#features",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Demo",
          item: "https://torqvio.com#demo",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "FAQ",
          item: "https://torqvio.com#faq",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://torqvio.com/#software",
      name: "Torqvio",
      description:
        "Durable serverless workflows, crons, and webhooks with automatic retries, real-time observability, and zero infrastructure management.",
      url: "https://torqvio.com",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cloud",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
        },
        { "@type": "Offer", name: "Pro" },
        { "@type": "Offer", name: "Enterprise" },
      ],
      featureList: [
        "Serverless durable crons with timezone support",
        "Serverless webhook processing with guaranteed delivery",
        "Multi-step serverless workflows with step-level resume",
        "Real-time observability dashboard",
        "Exponential backoff and circuit breakers",
        "HMAC-SHA256 webhook signing",
        "TypeScript, Python, and Go SDKs",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://torqvio.com/#org",
      name: "Torqvio",
      url: "https://torqvio.com",
      logo: "https://torqvio.com/favicon-purple.svg",
      sameAs: ["https://github.com/torqvio", "https://twitter.com/torqvio"],
      description: "Provider of durable serverless workflow automation platform",
    },
    {
      "@type": "WebSite",
      "@id": "https://torqvio.com/#website",
      url: "https://torqvio.com",
      name: "Torqvio",
      publisher: { "@id": "https://torqvio.com/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://torqvio.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://torqvio.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a durable workflow?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A durable workflow persists its execution state so it can survive crashes, restarts, and failures. If a durable workflow fails at step 3, it resumes from step 3 — not from the beginning. Torqvio makes all your workflows durable by default.",
          },
        },
        {
          "@type": "Question",
          name: "How is Torqvio different from a regular cron job?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Standard crons fire and forget — if the job crashes or the server restarts mid-run, the run is silently lost. Torqvio crons run inside a durable execution engine: every run is tracked, every failure is caught, and every retry is automatic with full logs.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if my server is down when a webhook arrives?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Torqvio queues the webhook and retries delivery with exponential backoff until your server is back up. You get guaranteed delivery with full delivery history — nothing is dropped.",
          },
        },
        {
          "@type": "Question",
          name: "Is Torqvio open source?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Torqvio has an open source core licensed under MIT. You can self-host the core or use the managed SaaS platform at torqvio.com.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a credit card to start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The free tier requires no credit card. You can start building immediately.",
          },
        },
      ],
    },
    {
      "@type": "TechArticle",
      "@id": "https://torqvio.com/#tech-article",
      headline: "Durable Serverless Workflows with Torqvio",
      description: "Learn how Torqvio provides durable execution for serverless workflows, crons, and webhooks with automatic retries and real-time observability.",
      author: {
        "@type": "Organization",
        name: "Torqvio",
        url: "https://torqvio.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Torqvio",
        logo: {
          "@type": "ImageObject",
          url: "https://torqvio.com/favicon-purple.svg",
        },
      },
      datePublished: "2026-03-23",
      dateModified: "2026-03-23",
      mainEntityOfPage: "https://torqvio.com",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
