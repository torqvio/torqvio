"use client";

import { Github, Mail } from "lucide-react";

// Custom X logo component
const XLogo = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export function ComingSoonFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-bg px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="mb-2 text-lg font-bold">Torqvio</h3>
            <p className="text-sm text-txt2">
              The durable execution engine for serverless workflows.
            </p>
            <div className="mt-4 space-y-1 text-xs text-txt3">
              <div>Questions? <a href="mailto:support@torqvio.com" className="text-purple hover:text-purple-l transition-colors">support@torqvio.com</a></div>
              <div>General info? <a href="mailto:info@torqvio.com" className="text-purple hover:text-purple-l transition-colors">info@torqvio.com</a></div>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-txt3 uppercase tracking-wider">
              Product
            </h4>
            <div className="space-y-2">
              <div>
                <a href="#features" className="text-sm text-txt2 hover:text-purple transition-colors">
                  Features
                </a>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-txt3 uppercase tracking-wider">
              Company
            </h4>
            <div className="space-y-2">
              <div>
                <a href="/terms" className="text-sm text-txt2 hover:text-purple transition-colors">
                  Terms
                </a>
              </div>
              <div>
                <a href="/privacy" className="text-sm text-txt2 hover:text-purple transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
          
          {/* Connect */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-txt3 uppercase tracking-wider">
              Connect
            </h4>
            <div className="space-y-2">
              <div className="flex gap-3">
                <a 
                  href="https://x.com/torqvio" 
                  className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  <XLogo className="h-4 w-4" />
                </a>
                <a 
                  href="https://github.com/torqvio" 
                  className="rounded-lg border border-border bg-surface2 p-2 text-purple hover:bg-purple/10 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-txt3 mt-3">
                <div>Join our beta program</div>
                <a href="#cta" className="text-purple hover:text-purple-l transition-colors">
                  Get early access →
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-txt3">
            © 2026 Torqvio Inc. All rights reserved. | 
            <a href="/privacy" className="mx-1 hover:text-purple transition-colors">Privacy</a> | 
            <a href="/terms" className="mx-1 hover:text-purple transition-colors">Terms</a> | 
            <a href="mailto:legal@torqvio.com" className="mx-1 hover:text-purple transition-colors">legal@torqvio.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
