/**
 * Round Robin Scheduling Algorithm
 * Processes tasks in a cyclic manner with a fixed time quantum.
 */
class RoundRobin {
  constructor(quantum = 3) {
    this.quantum = quantum;
    this.queue = [];
    this.completed = [];
    this.timeline = [];
    this.currentTime = 0;
  }

  addProcess(process) {
    this.queue.push({
      id: process.id,
      name: process.name,
      arrivalTime: process.arrivalTime || 0,
      burstTime: process.burstTime,
      priority: process.priority || 'Regular',
      type: process.type || 'general',
      remainingTime: process.burstTime,
      startTime: null,
      completionTime: null,
      waitingTime: null,
      turnaroundTime: null,
    });
  }

  execute() {
    const processes = this.queue.map(p => ({ ...p }));
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    this.completed = [];
    this.timeline = [];
    this.currentTime = 0;

    const readyQueue = [];
    let remaining = [...processes];
    let completedCount = 0;
    const n = processes.length;

    // Add initial processes
    const initial = remaining.filter(p => p.arrivalTime <= this.currentTime);
    readyQueue.push(...initial);
    remaining = remaining.filter(p => p.arrivalTime > this.currentTime);

    while (completedCount < n) {
      if (readyQueue.length === 0) {
        if (remaining.length > 0) {
          this.currentTime = remaining[0].arrivalTime;
          const arrived = remaining.filter(p => p.arrivalTime <= this.currentTime);
          readyQueue.push(...arrived);
          remaining = remaining.filter(p => p.arrivalTime > this.currentTime);
        }
        continue;
      }

      const process = readyQueue.shift();

      if (process.startTime === null) {
        process.startTime = this.currentTime;
      }

      const execTime = Math.min(this.quantum, process.remainingTime);
      this.timeline.push({
        processId: process.id,
        processName: process.name,
        startTime: this.currentTime,
        endTime: this.currentTime + execTime,
        duration: execTime,
      });

      this.currentTime += execTime;
      process.remainingTime -= execTime;

      // Add any newly arrived processes before re-adding current
      const newArrivals = remaining.filter(p => p.arrivalTime <= this.currentTime);
      readyQueue.push(...newArrivals);
      remaining = remaining.filter(p => p.arrivalTime > this.currentTime);

      if (process.remainingTime === 0) {
        process.completionTime = this.currentTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        this.completed.push({ ...process });
        completedCount++;
      } else {
        readyQueue.push(process);
      }
    }

    return this.getResults();
  }

  getResults() {
    const totalWaiting = this.completed.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaround = this.completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const count = this.completed.length || 1;

    return {
      algorithm: 'Round Robin',
      quantum: this.quantum,
      processes: this.completed,
      timeline: this.timeline,
      averageWaitingTime: (totalWaiting / count).toFixed(2),
      averageTurnaroundTime: (totalTurnaround / count).toFixed(2),
      totalTime: this.currentTime,
    };
  }

  reset() {
    this.queue = [];
    this.completed = [];
    this.timeline = [];
    this.currentTime = 0;
  }
}

module.exports = RoundRobin;
