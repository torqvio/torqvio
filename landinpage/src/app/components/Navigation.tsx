"use client";

import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { LogoFull } from "./Logo";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/50" role="navigation" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center" aria-label="Torqvio Home">
              <LogoFull iconSize={32} />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-txt2 hover:text-purple px-3 py-2 text-sm font-medium transition-colors"
                  aria-label={`Navigate to ${item.name}`}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#cta"
                className="bg-purple text-white hover:bg-purple-l px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                aria-label="Get started with Torqvio"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-txt2 hover:text-purple p-2 rounded-md transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-txt2 hover:text-purple block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label={`Navigate to ${item.name}`}
              >
                {item.name}
              </a>
            ))}
            <a
              href="#cta"
              className="bg-purple text-white hover:bg-purple-l block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Get started with Torqvio"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
