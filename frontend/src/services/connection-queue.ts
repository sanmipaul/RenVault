export class ConnectionQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;

  async add(connectionFn: () => Promise<unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await connectionFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        try {
          await fn();
        } catch (error) {
          logger.error('Connection queue error:', error);
        }
      }
    }
    this.processing = false;
  }

  clear() {
    this.queue = [];
    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isProcessing(): boolean {
    return this.processing;
  }
}

export const connectionQueue = new ConnectionQueue();
