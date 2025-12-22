// NFT Minter
class NFTMinter {
  constructor() {
    this.mintedTokens = new Map();
    this.tokenCounter = 0;
    this.metadata = new Map();
  }

  mintAchievementBadge(userAddress, achievementId, achievementData) {
    const tokenId = ++this.tokenCounter;
    const metadata = this.generateMetadata(achievementId, achievementData);
    
    const token = {
      id: tokenId,
      owner: userAddress,
      achievementId,
      mintedAt: Date.now(),
      metadata
    };

    this.mintedTokens.set(tokenId, token);
    this.metadata.set(tokenId, metadata);

    return {
      success: true,
      tokenId,
      metadata,
      transactionId: this.generateTxId()
    };
  }

  generateMetadata(achievementId, achievementData) {
    const baseUri = 'https://renvault.com/nft/';
    
    return {
      name: `RenVault ${achievementData.name}`,
      description: achievementData.description,
      image: `${baseUri}${achievementId}.png`,
      attributes: [
        { trait_type: 'Rarity', value: achievementData.rarity },
        { trait_type: 'Points', value: achievementData.points },
        { trait_type: 'Category', value: 'Achievement' },
        { trait_type: 'Protocol', value: 'RenVault' }
      ],
      external_url: `${baseUri}${achievementId}`,
      animation_url: `${baseUri}${achievementId}.gif`
    };
  }

  getTokenMetadata(tokenId) {
    return this.metadata.get(tokenId);
  }

  getTokenOwner(tokenId) {
    const token = this.mintedTokens.get(tokenId);
    return token ? token.owner : null;
  }

  getUserTokens(userAddress) {
    return Array.from(this.mintedTokens.values())
      .filter(token => token.owner === userAddress);
  }

  transferToken(tokenId, fromAddress, toAddress) {
    const token = this.mintedTokens.get(tokenId);
    if (!token || token.owner !== fromAddress) {
      return { success: false, error: 'Invalid transfer' };
    }

    token.owner = toAddress;
    this.mintedTokens.set(tokenId, token);

    return {
      success: true,
      tokenId,
      from: fromAddress,
      to: toAddress,
      transactionId: this.generateTxId()
    };
  }

  getMintingStats() {
    const stats = {
      totalMinted: this.tokenCounter,
      uniqueHolders: new Set(Array.from(this.mintedTokens.values()).map(t => t.owner)).size,
      achievementBreakdown: {}
    };

    for (const token of this.mintedTokens.values()) {
      stats.achievementBreakdown[token.achievementId] = 
        (stats.achievementBreakdown[token.achievementId] || 0) + 1;
    }

    return stats;
  }

  generateTxId() {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }
}

module.exports = { NFTMinter };