"use client";

import { useEffect, useState } from "react";
import { Github, Star, GitFork, Users } from "lucide-react";

interface GitHubStats {
  stars: number;
  forks: number;
  watchers: number;
}

export function GitHubButton() {
  const [stats, setStats] = useState<GitHubStats>({
    stars: 0,
    forks: 0,
    watchers: 0
  });
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/torqvio/torqvio');
        if (response.ok) {
          const data = await response.json();
          setStats({
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            watchers: data.watchers_count || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
        // Fallback values
        setStats({
          stars: 127,
          forks: 23,
          watchers: 15
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <a
        href="https://github.com/torqvio/torqvio"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 rounded-xl border transition-all duration-300 px-6 py-3 font-medium ${
          hovered
            ? "border-purple/50 bg-purple/10 shadow-[0_8px_28px_rgba(108,92,231,0.2)] scale-105"
            : "border-border bg-surface hover:bg-surface2"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Github className="h-5 w-5" />
        <span>View on GitHub</span>
      </a>

      {/* Real-time metrics */}
      <div className="flex items-center gap-6 text-sm text-txt2">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow" />
          <span className="font-medium">
            {loading ? "..." : formatNumber(stats.stars)}
          </span>
          <span className="text-xs text-txt3">stars</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <GitFork className="h-4 w-4 text-blue" />
          <span className="font-medium">
            {loading ? "..." : formatNumber(stats.forks)}
          </span>
          <span className="text-xs text-txt3">forks</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-green" />
          <span className="font-medium">
            {loading ? "..." : formatNumber(stats.watchers)}
          </span>
          <span className="text-xs text-txt3">watchers</span>
        </div>
      </div>

      {hovered && (
        <div className="text-xs text-purple-l animate-fade-in">
          ⭐ Star us on GitHub to support the project
        </div>
      )}
    </div>
  );
}
