"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { GitHubButton } from "./GitHubButton";

interface WaitlistStats {
  totalCount: number;
  recentSignups: Array<{
    email: string;
    initials: string;
    location: string;
    device: string;
    time: string;
  }>;
  dailyStats: Array<{
    date: string;
    signups: number;
  }>;
  goal: number;
}

export function ComingSoonCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [waitlistStats, setWaitlistStats] = useState<WaitlistStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch real waitlist data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/waitlist");
        if (response.ok) {
          const data = await response.json();
          setWaitlistStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist stats:', error);
        // Fallback to mock data if API fails
        setWaitlistStats({
          totalCount: 0,
          recentSignups: [],
          dailyStats: [],
          goal: 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds to show live growth
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You're on the list! We'll notify you as soon as Torqvio is ready.");
        setEmail("");
        
        // Refresh stats after successful signup
        const statsResponse = await fetch("/api/waitlist");
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setWaitlistStats(data);
        }
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const waitlistCount = waitlistStats?.totalCount || 0;
  const goal = waitlistStats?.goal || 0;
  const progressPercentage = goal > 0 ? Math.min((waitlistCount / goal) * 100, 100) : 0;
  const recentSignups = waitlistStats?.recentSignups?.slice(0, 3) || [];

  // Format time relative to now
  const formatRelativeTime = (timeString: string) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? 's' : ''} ago`;
  };

  return (
    <section className="relative z-10 bg-bg2 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-6 text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.1]">
          Be the first to build
          <br />
          <span className="gradient-text">durable workflows.</span>
        </h2>
        
        <p className="mb-10 text-lg leading-relaxed text-txt2">
          Join our exclusive early access program and help shape the future of 
          reliable serverless execution. Get notified when we launch.
        </p>

        {/* Progress Indicator */}
        <div className="mb-8 rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple" />
              <span className="font-semibold">
                {isLoadingStats ? "Loading..." : "Join the beta waitlist"}
              </span>
            </div>
            <div className="text-sm text-txt3">
              Early access program
            </div>
          </div>
          
          {goal > 0 && (
            <>
              <div className="mb-4">
                <div className="h-3 rounded-full bg-border overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple to-purple-l transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-txt3">
                  {Math.round(progressPercentage)}% to goal • {goal - waitlistCount} spots remaining
                </div>
              </div>

              {/* Recent Activity */}
              <div className="text-left">
                <div className="mb-2 text-sm font-semibold text-txt3">Recent signups:</div>
                <div className="space-y-1">
                  {isLoadingStats ? (
                    <div className="text-sm text-txt2">Loading recent activity...</div>
                  ) : recentSignups.length > 0 ? (
                    recentSignups.map((signup, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-txt2">
                        <CheckCircle className="h-3 w-3 text-green" />
                        <span>{signup.initials} from {signup.location} joined {formatRelativeTime(signup.time)}</span>
                        {signup.device === 'Mobile' && <span className="text-xs text-txt3">📱</span>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-txt2">Be the first to join!</div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {goal === 0 && (
            <div className="text-center text-sm text-txt2">
              Join our early access program and help shape the future of durable workflows.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-border bg-surface px-5 py-3.5 text-base text-txt placeholder-txt3 transition-all focus:border-purple/50 focus:outline-none focus:ring-2 focus:ring-purple/20"
              disabled={status === "loading"}
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-purple px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-purple-l hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(108,92,231,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                "Get Early Access"
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                status === "success"
                  ? "bg-green/10 text-green border border-green/20"
                  : "bg-red/10 text-red border border-red/20"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        <div className="text-[13px] text-txt3">
          <span className="text-green">✓</span> No spam ever &nbsp;·&nbsp;
          <span className="text-green">✓</span> Unsubscribe anytime &nbsp;·&nbsp;
          <span className="text-green">✓</span> We respect your privacy
        </div>

        {/* GitHub Button with Metrics */}
        <div className="mt-8">
          <div className="mb-4 text-center">
            <p className="text-sm text-txt2 mb-4">
              Want to contribute? Check out our open-source project
            </p>
          </div>
          <GitHubButton />
        </div>

        {/* Enhanced Timeline */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-bold">What's next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green"></div>
              <span className="text-sm">Private beta testing (in progress)</span>
              <span className="ml-auto text-xs text-green font-semibold">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow animate-pulse"></div>
              <span className="text-sm">Early access program (Q2 2026)</span>
              <span className="ml-auto text-xs text-yellow font-semibold">Next</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple"></div>
              <span className="text-sm">Public launch (Q3 2026)</span>
              <span className="ml-auto text-xs text-txt3 font-semibold">Planned</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid gap-3 sm:grid-cols-3 text-left">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green" />
                <span className="text-xs text-txt2">Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple" />
                <span className="text-xs text-txt2">Early access</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-l" />
                <span className="text-xs text-txt2">Beta perks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
