export class ConnectionQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  async add(fn: () => Promise<any>): Promise<any> {
    if (this.queue.length >= this.maxSize) {
      throw new Error(
        `ConnectionQueue is full (max ${this.maxSize} pending operations). ` +
        'The consumer may be stalled or requests are arriving too fast.'
      );
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) await fn();
    }
    this.processing = false;
  }

  get pendingCount(): number {
    return this.queue.length;
  }
}
