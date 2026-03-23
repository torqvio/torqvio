"use client";

import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "https://docs.torqvio.com", label: "Docs" },
  { href: "https://github.com/torqvio/torqvio", label: "GitHub" },
];

export function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-bg/85 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-txt no-underline"
          aria-label="Torqvio home"
        >
          <Logo size={28} />
          Torqvio
        </Link>

        {/* Links */}
        <ul className="hidden items-center gap-7 md:flex" role="list">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-txt2 transition-colors hover:text-txt"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="https://app.torqvio.com/login"
            className="hidden rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-semibold text-txt2 transition-all hover:bg-surface hover:text-txt sm:block"
          >
            Sign in
          </Link>
          <Link
            href="https://app.torqvio.com/signup"
            className="rounded-lg bg-purple px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-l hover:shadow-[0_8px_24px_rgba(108,92,231,0.35)] hover:-translate-y-px"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
