/**
 * Priority Scheduling Algorithm
 * Processes tasks based on priority (lower number = higher priority).
 */
class PriorityScheduling {
  constructor() {
    this.queue = [];
    this.completed = [];
    this.currentTime = 0;
  }

  addProcess(process) {
    this.queue.push({
      id: process.id,
      name: process.name,
      arrivalTime: process.arrivalTime || this.currentTime,
      burstTime: process.burstTime,
      priority: process.priority || 3,
      priorityLabel: process.priorityLabel || 'Regular',
      type: process.type || 'general',
      remainingTime: process.burstTime,
      startTime: null,
      completionTime: null,
      waitingTime: null,
      turnaroundTime: null,
    });
  }

  execute(preemptive = false) {
    if (preemptive) {
      return this.executePreemptive();
    }
    return this.executeNonPreemptive();
  }

  executeNonPreemptive() {
    const processes = [...this.queue].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const ready = [];
    this.completed = [];
    this.currentTime = 0;
    let remaining = [...processes];

    while (remaining.length > 0 || ready.length > 0) {
      const arrived = remaining.filter(p => p.arrivalTime <= this.currentTime);
      ready.push(...arrived);
      remaining = remaining.filter(p => p.arrivalTime > this.currentTime);

      if (ready.length === 0) {
        this.currentTime = remaining[0].arrivalTime;
        continue;
      }

      // Sort by priority (lower = higher priority)
      ready.sort((a, b) => a.priority - b.priority);
      const process = ready.shift();

      process.startTime = this.currentTime;
      process.completionTime = this.currentTime + process.burstTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;
      this.currentTime = process.completionTime;
      this.completed.push({ ...process });
    }

    return this.getResults();
  }

  executePreemptive() {
    const processes = this.queue.map(p => ({ ...p, remainingTime: p.burstTime }));
    this.completed = [];
    this.currentTime = 0;
    const n = processes.length;
    let completedCount = 0;

    while (completedCount < n) {
      const available = processes.filter(
        p => p.arrivalTime <= this.currentTime && p.remainingTime > 0
      );

      if (available.length === 0) {
        this.currentTime++;
        continue;
      }

      available.sort((a, b) => a.priority - b.priority);
      const current = available[0];

      if (current.startTime === null) {
        current.startTime = this.currentTime;
      }

      current.remainingTime--;
      this.currentTime++;

      if (current.remainingTime === 0) {
        current.completionTime = this.currentTime;
        current.turnaroundTime = current.completionTime - current.arrivalTime;
        current.waitingTime = current.turnaroundTime - current.burstTime;
        this.completed.push({ ...current });
        completedCount++;
      }
    }

    return this.getResults();
  }

  getResults() {
    const totalWaiting = this.completed.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaround = this.completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const count = this.completed.length || 1;

    return {
      algorithm: 'Priority',
      processes: this.completed,
      averageWaitingTime: (totalWaiting / count).toFixed(2),
      averageTurnaroundTime: (totalTurnaround / count).toFixed(2),
      totalTime: this.currentTime,
    };
  }

  reset() {
    this.queue = [];
    this.completed = [];
    this.currentTime = 0;
  }
}

module.exports = PriorityScheduling;
