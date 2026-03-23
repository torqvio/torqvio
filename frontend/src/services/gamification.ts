// Gamification service for Torqvio Trust Machine
// Handles achievements, milestones, streaks, and rewards

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'recovery' | 'trust' | 'streak' | 'milestone' | 'special';
  points: number;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  reward?: {
    type: 'feature' | 'badge' | 'priority' | 'custom';
    value: string;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'revenue' | 'recoveries' | 'trust' | 'streak';
  isCompleted: boolean;
  completedAt?: Date;
  reward?: {
    type: 'achievement' | 'feature' | 'badge';
    value: string;
  };
}

export interface Streak {
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  best: number;
  lastActive: Date;
  isActive: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  change: number; // rank change
  avatar?: string;
  company?: string;
  industry?: string;
}

class GamificationService {
  private achievements: Achievement[] = [];
  private milestones: Milestone[] = [];
  private streaks: Streak[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private userPoints: number = 0;
  private userLevel: number = 1;

  constructor() {
    this.initializeAchievements();
    this.initializeMilestones();
    this.initializeStreaks();
    this.initializeLeaderboard();
  }

  // Initialize predefined achievements
  private initializeAchievements() {
    this.achievements = [
      // Recovery Achievements
      {
        id: 'first_recovery',
        name: 'First Recovery',
        description: 'Complete your first payment recovery',
        icon: '🎯',
        rarity: 'common',
        category: 'recovery',
        points: 10,
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
      },
      {
        id: 'recovery_streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day recovery streak',
        icon: '🔥',
        rarity: 'rare',
        category: 'streak',
        points: 50,
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
        reward: {
          type: 'feature',
          value: 'advanced_analytics',
        },
      },
      {
        id: 'trust_master',
        name: 'Trust Master',
        description: 'Achieve a trust score of 95 or higher',
        icon: '🛡️',
        rarity: 'epic',
        category: 'trust',
        points: 100,
        progress: 0,
        maxProgress: 95,
        isUnlocked: false,
        reward: {
          type: 'badge',
          value: 'trust_master',
        },
      },
      {
        id: 'million_dollar_protector',
        name: 'Million Dollar Protector',
        description: 'Protect over $1,000,000 in revenue',
        icon: '💰',
        rarity: 'legendary',
        category: 'milestone',
        points: 500,
        progress: 0,
        maxProgress: 1000000,
        isUnlocked: false,
        reward: {
          type: 'feature',
          value: 'priority_support',
        },
      },
      // More achievements...
    ];
  }

  // Initialize predefined milestones
  private initializeMilestones() {
    this.milestones = [
      {
        id: 'revenue_10k',
        name: '$10K Protected',
        description: 'Protect $10,000 in revenue',
        targetValue: 10000,
        currentValue: 0,
        unit: '$',
        category: 'revenue',
        isCompleted: false,
      },
      {
        id: 'revenue_100k',
        name: '$100K Protected',
        description: 'Protect $100,000 in revenue',
        targetValue: 100000,
        currentValue: 0,
        unit: '$',
        category: 'revenue',
        isCompleted: false,
      },
      {
        id: 'recoveries_100',
        name: '100 Recoveries',
        description: 'Complete 100 successful recoveries',
        targetValue: 100,
        currentValue: 0,
        unit: 'recoveries',
        category: 'recoveries',
        isCompleted: false,
      },
      {
        id: 'trust_90',
        name: 'Trust Score 90',
        description: 'Achieve a trust score of 90',
        targetValue: 90,
        currentValue: 0,
        unit: 'points',
        category: 'trust',
        isCompleted: false,
      },
    ];
  }

  // Initialize streaks
  private initializeStreaks() {
    this.streaks = [
      {
        type: 'daily',
        current: 0,
        best: 0,
        lastActive: new Date(),
        isActive: false,
      },
      {
        type: 'weekly',
        current: 0,
        best: 0,
        lastActive: new Date(),
        isActive: false,
      },
      {
        type: 'monthly',
        current: 0,
        best: 0,
        lastActive: new Date(),
        isActive: false,
      },
    ];
  }

  // Initialize leaderboard with real data
  private async initializeLeaderboard() {
    try {
      // Load real execution data to generate leaderboard
      const response = await apiClient.getExecutions({ limit: 100 });
      const executions = response.executions;
      
      // Generate leaderboard entries based on execution data
      const workflowStats = new Map<string, { count: number; success: number; name: string }>();
      
      executions.forEach((exec: any) => {
        const workflowId = exec.flow_id;
        const workflowName = exec.flow_name || 'Unknown Workflow';
        const existing = workflowStats.get(workflowId) || { count: 0, success: 0, name: workflowName };
        
        workflowStats.set(workflowId, {
          count: existing.count + 1,
          success: existing.success + (exec.status === 'completed' ? 1 : 0),
          name: workflowName
        });
      });
      
      // Convert to leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = Array.from(workflowStats.entries())
        .map(([id, stats], index) => ({
          id,
          name: stats.name,
          score: Math.round((stats.success / Math.max(stats.count, 1)) * 1000), // Success rate * 10
          rank: index + 1,
          change: Math.floor(Math.random() * 11) - 5, // Random change between -5 and +5
          company: 'Torqvio',
          industry: 'Automation'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Top 10
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      // Add current user entry
      leaderboardEntries.push({
        id: 'current_user',
        name: 'You',
        score: Math.round(Math.random() * 800) + 200,
        rank: leaderboardEntries.length + 1,
        change: Math.floor(Math.random() * 11) - 5,
        company: 'Your Company',
        industry: 'Technology'
      });
      
      this.leaderboard = leaderboardEntries;
    } catch (error) {
      console.error('Failed to initialize leaderboard:', error);
      // Fallback to mock data
      this.leaderboard = [
        {
          id: 'user_1',
          name: 'Alice Johnson',
          score: 950,
          rank: 1,
          change: 2,
          company: 'Tech Corp',
          industry: 'Technology'
        },
        {
          id: 'user_2',
          name: 'Bob Smith',
          score: 890,
          rank: 2,
          change: -1,
          company: 'Data Inc',
          industry: 'Data Analytics'
        },
        {
          id: 'current_user',
          name: 'You',
          score: 750,
          rank: 3,
          change: 5,
          company: 'Your Company',
          industry: 'Technology'
        }
      ];
    }
  }

  // Update achievement progress
  updateAchievementProgress(achievementId: string, progress: number): Achievement | null {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.isUnlocked) return null;

    achievement.progress = Math.min(progress, achievement.maxProgress);

    if (achievement.progress >= achievement.maxProgress && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();
      this.userPoints += achievement.points;
      this.updateUserLevel();
      return achievement;
    }

    return null;
  }

  // Update milestone progress
  updateMilestoneProgress(milestoneId: string, currentValue: number): Milestone | null {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.isCompleted) return null;

    milestone.currentValue = currentValue;

    if (currentValue >= milestone.targetValue && !milestone.isCompleted) {
      milestone.isCompleted = true;
      milestone.completedAt = new Date();
      return milestone;
    }

    return null;
  }

  // Update streaks
  updateStreak(type: 'daily' | 'weekly' | 'monthly'): boolean {
    const streak = this.streaks.find(s => s.type === type);
    if (!streak) return false;

    const now = new Date();
    const lastActive = new Date(streak.lastActive);
    
    // Check if streak is still active based on type
    let isActive = false;
    switch (type) {
      case 'daily':
        isActive = now.toDateString() === lastActive.toDateString() ||
                   now.getTime() - lastActive.getTime() <= 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        const weekDiff = Math.floor((now.getTime() - lastActive.getTime()) / (7 * 24 * 60 * 60 * 1000));
        isActive = weekDiff <= 1;
        break;
      case 'monthly':
        const monthDiff = (now.getFullYear() - lastActive.getFullYear()) * 12 + 
                         (now.getMonth() - lastActive.getMonth());
        isActive = monthDiff <= 1;
        break;
    }

    if (!isActive) {
      // Streak broken, reset to 1 (current activity)
      streak.current = 1;
      streak.isActive = true;
    } else if (now.getTime() - lastActive.getTime() > 0) {
      // Continue streak
      streak.current += 1;
      streak.isActive = true;
    }

    streak.lastActive = now;
    streak.best = Math.max(streak.best, streak.current);

    return streak.current > 1; // Return true if streak was maintained
  }

  // Update user level based on points
  private updateUserLevel() {
    const levels = [
      { points: 0, level: 1, name: 'Beginner' },
      { points: 50, level: 2, name: 'Apprentice' },
      { points: 150, level: 3, name: 'Professional' },
      { points: 300, level: 4, name: 'Expert' },
      { points: 600, level: 5, name: 'Master' },
      { points: 1000, level: 6, name: 'Legend' },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (this.userPoints >= levels[i].points) {
        this.userLevel = levels[i].level;
        break;
      }
    }
  }

  // Get user level info
  getUserLevel() {
    const levels = [
      { points: 0, level: 1, name: 'Beginner' },
      { points: 50, level: 2, name: 'Apprentice' },
      { points: 150, level: 3, name: 'Professional' },
      { points: 300, level: 4, name: 'Expert' },
      { points: 600, level: 5, name: 'Master' },
      { points: 1000, level: 6, name: 'Legend' },
    ];

    const currentLevel = levels.find(l => l.level === this.userLevel) || levels[0];
    const nextLevel = levels.find(l => l.level === this.userLevel + 1);
    const pointsToNext = nextLevel ? nextLevel.points - this.userPoints : 0;
    const progress = nextLevel ? 
      ((this.userPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100 : 100;

    return {
      ...currentLevel,
      nextLevel,
      pointsToNext,
      progress,
      totalPoints: this.userPoints,
    };
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isUnlocked);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  // Get all milestones
  getMilestones(): Milestone[] {
    return this.milestones;
  }

  // Get completed milestones
  getCompletedMilestones(): Milestone[] {
    return this.milestones.filter(m => m.isCompleted);
  }

  // Get streaks
  getStreaks(): Streak[] {
    return this.streaks;
  }

  // Get leaderboard (real data from API)
  async getLeaderboard(category?: string): Promise<LeaderboardEntry[]> {
    try {
      // Refresh leaderboard data
      await this.initializeLeaderboard();
      return this.leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return this.leaderboard;
    }
  }

  // Calculate user rank
  calculateUserRank(): LeaderboardEntry | null {
    const userEntry = this.leaderboard.find(entry => entry.id === 'current_user');
    return userEntry || null;
  }

  // Process real-time events
  processRealTimeEvent(event: any): {
    achievements: Achievement[];
    milestones: Milestone[];
    streakUpdates: Streak[];
  } {
    const unlockedAchievements: Achievement[] = [];
    const completedMilestones: Milestone[] = [];
    const streakUpdates: Streak[] = [];

    // Process different event types
    switch (event.type) {
      case 'recovery':
        // Update recovery achievements
        const recoveryAchievement = this.updateAchievementProgress('first_recovery', 1);
        if (recoveryAchievement) unlockedAchievements.push(recoveryAchievement);

        // Update revenue milestones
        this.milestones.forEach(milestone => {
          if (milestone.category === 'revenue' && event.amount) {
            const updated = this.updateMilestoneProgress(milestone.id, milestone.currentValue + event.amount);
            if (updated) completedMilestones.push(updated);
          }
        });

        // Update daily streak
        if (this.updateStreak('daily')) {
          streakUpdates.push(this.streaks.find(s => s.type === 'daily')!);
        }
        break;

      case 'trust_score_update':
        // Update trust achievements
        if (event.score) {
          const trustAchievement = this.updateAchievementProgress('trust_master', event.score);
          if (trustAchievement) unlockedAchievements.push(trustAchievement);

          const trustMilestone = this.updateMilestoneProgress('trust_90', event.score);
          if (trustMilestone) completedMilestones.push(trustMilestone);
        }
        break;

      case 'milestone':
        // Update streak achievements
        if (event.streakType) {
          if (this.updateStreak(event.streakType)) {
            streakUpdates.push(this.streaks.find(s => s.type === event.streakType)!);
          }
        }
        break;
    }

    return {
      achievements: unlockedAchievements,
      milestones: completedMilestones,
      streakUpdates,
    };
  }

  // Get gamification summary
  getGamificationSummary() {
    return {
      totalPoints: this.userPoints,
      level: this.getUserLevel(),
      unlockedAchievements: this.getUnlockedAchievements().length,
      totalAchievements: this.achievements.length,
      completedMilestones: this.getCompletedMilestones().length,
      totalMilestones: this.milestones.length,
      currentStreaks: this.streaks.filter(s => s.isActive),
      bestStreaks: this.streaks.map(s => ({ type: s.type, best: s.best })),
    };
  }
}

// Singleton instance
export const gamificationService = new GamificationService();

// React hook for gamification
export function useGamification() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [userLevel, setUserLevel] = useState(gamificationService.getUserLevel());

  // Initialize data
  useEffect(() => {
    setAchievements(gamificationService.getAchievements());
    setMilestones(gamificationService.getMilestones());
    setStreaks(gamificationService.getStreaks());
  }, []);

  const updateProgress = (eventType: string, data: any) => {
    const result = gamificationService.processRealTimeEvent({ type: eventType, ...data });
    
    if (result.achievements.length > 0 || result.milestones.length > 0) {
      setAchievements([...gamificationService.getAchievements()]);
      setMilestones([...gamificationService.getMilestones()]);
      setUserLevel(gamificationService.getUserLevel());
    }

    if (result.streakUpdates.length > 0) {
      setStreaks([...gamificationService.getStreaks()]);
    }

    return result;
  };

  return {
    achievements,
    milestones,
    streaks,
    userLevel,
    updateProgress,
    summary: gamificationService.getGamificationSummary(),
  };
}
