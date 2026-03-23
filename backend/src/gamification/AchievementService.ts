export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'revenue' | 'reliability' | 'analytics';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface TenantStats {
  totalRecoveries: number;
  totalRecovered: number;
  uptimeDays: number;
  failuresPrevented: number;
}

export interface AchievementUnlock {
  id: string;
  achievement: Achievement;
  unlockedAt: Date;
}

export interface LeaderboardCategory {
  type: 'recovery_rate' | 'total_recovered' | 'predictions_accuracy';
}

export interface LeaderboardEntry {
  tenantId: string;
  companyName: string;
  recoveryRate?: number;
  totalRecovered?: number;
  accuracyRate?: number;
  totalAttempts?: number;
  totalPredictions?: number;
  isCurrentUser: boolean;
}

export interface Leaderboard {
  category: LeaderboardCategory['type'];
  period: string;
  entries: LeaderboardEntry[];
  userRank: number;
  totalParticipants: number;
}

export class AchievementService {
  private achievements: Map<string, Achievement> = new Map([
    ['first_recovery', {
      id: 'first_recovery',
      name: 'First Recovery',
      description: 'Recover your first failed payment',
      icon: '🎯',
      category: 'milestone',
      points: 10,
      rarity: 'common'
    }],
    ['recovery_10k', {
      id: 'recovery_10k',
      name: '$10K Recovered',
      description: 'Recover $10,000 in total revenue',
      icon: '💰',
      category: 'revenue',
      points: 100,
      rarity: 'rare'
    }],
    ['perfect_month', {
      id: 'perfect_month',
      name: 'Perfect Month',
      description: 'Achieve 100% uptime for 30 days',
      icon: '⭐',
      category: 'reliability',
      points: 50,
      rarity: 'epic'
    }],
    ['prediction_master', {
      id: 'prediction_master',
      name: 'Prediction Master',
      description: 'Prevent 10 failures using predictive analytics',
      icon: '🔮',
      category: 'analytics',
      points: 75,
      rarity: 'rare'
    }]
  ]);

  async checkAchievements(tenantId: string, event: AchievementEvent): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const tenantStats = await this.getTenantStats(tenantId);

    for (const [achievementId, achievement] of this.achievements) {
      if (await this.hasAchievement(tenantId, achievementId)) {
        continue; // Already earned
      }

      if (await this.checkAchievementCriteria(achievementId, tenantStats, event)) {
        await this.awardAchievement(tenantId, achievementId);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  private async checkAchievementCriteria(
    achievementId: string, 
    stats: TenantStats, 
    event: AchievementEvent
  ): Promise<boolean> {
    switch (achievementId) {
      case 'first_recovery':
        return stats.totalRecoveries >= 1;
      
      case 'recovery_10k':
        return stats.totalRecovered >= 10000;
      
      case 'perfect_month':
        return stats.uptimeDays >= 30;
      
      case 'prediction_master':
        return stats.failuresPrevented >= 10;
      
      default:
        return false;
    }
  }

  async getLeaderboard(category: LeaderboardCategory['type'], period: string): Promise<Leaderboard> {
    const entries = await this.getLeaderboardEntries(category, period);
    
    return {
      category,
      period,
      entries,
      userRank: this.findUserRank(entries, this.getCurrentTenant()),
      totalParticipants: entries.length
    };
  }

  private async getLeaderboardEntries(category: LeaderboardCategory['type'], period: string): Promise<LeaderboardEntry[]> {
    const timeRange = this.getTimeRange(period);
    
    // Mock implementation - would query actual database
    const mockEntries: LeaderboardEntry[] = [
      {
        tenantId: 'tenant-1',
        companyName: 'Acme Corp',
        recoveryRate: 96.5,
        totalRecovered: 125000,
        accuracyRate: 89.2,
        totalAttempts: 145,
        totalPredictions: 89,
        isCurrentUser: false
      },
      {
        tenantId: 'tenant-2',
        companyName: 'Beta Inc',
        recoveryRate: 94.2,
        totalRecovered: 98000,
        accuracyRate: 91.5,
        totalAttempts: 132,
        totalPredictions: 76,
        isCurrentUser: false
      },
      {
        tenantId: 'tenant-3',
        companyName: 'Gamma LLC',
        recoveryRate: 92.8,
        totalRecovered: 87000,
        accuracyRate: 87.3,
        totalAttempts: 118,
        totalPredictions: 92,
        isCurrentUser: true
      }
    ];

    // Sort based on category
    return mockEntries.sort((a, b) => {
      switch (category) {
        case 'recovery_rate':
          return (b.recoveryRate || 0) - (a.recoveryRate || 0);
        case 'total_recovered':
          return (b.totalRecovered || 0) - (a.totalRecovered || 0);
        case 'predictions_accuracy':
          return (b.accuracyRate || 0) - (a.accuracyRate || 0);
        default:
          return 0;
      }
    });
  }

  private getTimeRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  private findUserRank(entries: LeaderboardEntry[], userTenantId: string): number {
    const userEntry = entries.find(entry => entry.isCurrentUser);
    return userEntry ? entries.indexOf(userEntry) + 1 : -1;
  }

  private getCurrentTenant(): string {
    // Mock implementation - would get from context
    return 'tenant-3';
  }

  private async getTenantStats(tenantId: string): Promise<TenantStats> {
    // Mock implementation - would query database
    return {
      totalRecoveries: 45,
      totalRecovered: 125000,
      uptimeDays: 35,
      failuresPrevented: 12
    };
  }

  private async hasAchievement(tenantId: string, achievementId: string): Promise<boolean> {
    // Mock implementation - would query database
    return false;
  }

  private async awardAchievement(tenantId: string, achievementId: string): Promise<void> {
    // Mock implementation - would save to database
    console.log(`Awarding achievement ${achievementId} to tenant ${tenantId}`);
  }

  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  async getAchievementsForTenant(tenantId: string): Promise<AchievementUnlock[]> {
    // Mock implementation - would query database
    return [
      {
        id: 'unlock-1',
        achievement: this.achievements.get('first_recovery')!,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        id: 'unlock-2',
        achievement: this.achievements.get('recovery_10k')!,
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];
  }
}
