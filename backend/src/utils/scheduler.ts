export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // cron expression
  callback: () => Promise<void>;
  enabled: boolean;
}

export class Scheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
    if (task.enabled) {
      this.scheduleTask(task);
    }
  }

  removeTask(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
    this.tasks.delete(taskId);
  }

  enableTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && !task.enabled) {
      task.enabled = true;
      this.scheduleTask(task);
    }
  }

  disableTask(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = false;
    }
  }

  private scheduleTask(task: ScheduledTask): void {
    // Simple implementation - in production would use proper cron parsing
    const interval = setInterval(async () => {
      if (task.enabled) {
        try {
          await task.callback();
        } catch (error) {
          console.error(`Error executing scheduled task ${task.name}:`, error);
        }
      }
    }, 60000); // Run every minute as placeholder

    this.intervals.set(task.id, interval);
  }

  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  shutdown(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.tasks.clear();
  }
}
