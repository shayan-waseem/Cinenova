/**
 * FCFS (First Come First Serve) Scheduling Algorithm
 * Processes tasks in the order they arrive.
 */
class FCFS {
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
      priority: process.priority || 'Regular',
      type: process.type || 'general',
      startTime: null,
      completionTime: null,
      waitingTime: null,
      turnaroundTime: null,
    });
  }

  execute() {
    // Sort by arrival time
    this.queue.sort((a, b) => a.arrivalTime - b.arrivalTime);
    this.currentTime = 0;
    this.completed = [];

    for (const process of this.queue) {
      if (this.currentTime < process.arrivalTime) {
        this.currentTime = process.arrivalTime;
      }
      process.startTime = this.currentTime;
      process.completionTime = this.currentTime + process.burstTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;
      this.currentTime = process.completionTime;
      this.completed.push({ ...process });
    }

    return this.getResults();
  }

  getResults() {
    const totalWaiting = this.completed.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaround = this.completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const count = this.completed.length || 1;

    return {
      algorithm: 'FCFS',
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

module.exports = FCFS;
