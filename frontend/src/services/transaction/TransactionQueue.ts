import { TransactionDetails } from '../../services/transaction/TransactionService';

interface QueuedTransaction {
  id: string;
  details: TransactionDetails;
  timestamp: number;
  priority: number;
}

export class TransactionQueue {
  private queue: QueuedTransaction[] = [];

  enqueue(id: string, details: TransactionDetails, priority: number = 0): void {
    this.queue.push({ id, details, timestamp: Date.now(), priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): QueuedTransaction | undefined {
    return this.queue.shift();
  }

  peek(): QueuedTransaction | undefined {
    return this.queue[0];
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
