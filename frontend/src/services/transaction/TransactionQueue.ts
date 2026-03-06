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

  contains(id: string): boolean {
    return this.queue.some(item => item.id === id);
  }

  remove(id: string): boolean {
    const index = this.queue.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.queue.splice(index, 1);
    return true;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
