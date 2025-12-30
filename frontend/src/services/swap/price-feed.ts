import { TokenInfo } from '../../types/swaps';

export class PriceFeedService {
  private static instance: PriceFeedService;

  static getInstance(): PriceFeedService {
    if (!PriceFeedService.instance) {
      PriceFeedService.instance = new PriceFeedService();
    }
    return PriceFeedService.instance;
  }

  async getPrice(from: TokenInfo, to: TokenInfo): Promise<number> {
    // Placeholder: call a real price oracle or DEX pool
    // Return mock price 1.0
    return 1.0;
  }
}

export const priceFeedService = PriceFeedService.getInstance();
