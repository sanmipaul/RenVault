// Badge Generator
class BadgeGenerator {
  constructor() {
    this.templates = new Map();
    this.setupTemplates();
  }

  setupTemplates() {
    this.templates.set('first-deposit', {
      background: '#4CAF50',
      icon: '🎯',
      border: 'gold',
      animation: 'pulse'
    });

    this.templates.set('whale', {
      background: '#2196F3',
      icon: '🐋',
      border: 'platinum',
      animation: 'wave'
    });

    this.templates.set('diamond-hands', {
      background: '#9C27B0',
      icon: '💎',
      border: 'diamond',
      animation: 'sparkle'
    });

    this.templates.set('early-adopter', {
      background: '#FF9800',
      icon: '🚀',
      border: 'legendary',
      animation: 'glow'
    });
  }

  generateBadgeArt(achievementId, userAddress) {
    const template = this.templates.get(achievementId);
    if (!template) return null;

    return {
      svg: this.createSVG(template, achievementId),
      png: `badge_${achievementId}_${userAddress.slice(-8)}.png`,
      gif: `badge_${achievementId}_animated.gif`,
      metadata: {
        width: 400,
        height: 400,
        format: 'SVG',
        animated: true
      }
    };
  }

  createSVG(template, achievementId) {
    return `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${template.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000;stop-opacity:0.8" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="200" cy="200" r="180" fill="url(#bg)" stroke="${template.border}" stroke-width="8"/>
        <text x="200" y="220" text-anchor="middle" font-size="80" filter="url(#glow)">${template.icon}</text>
        <text x="200" y="320" text-anchor="middle" font-size="24" fill="white" font-family="Arial">RenVault</text>
        <text x="200" y="350" text-anchor="middle" font-size="16" fill="#ccc" font-family="Arial">${achievementId.toUpperCase()}</text>
        
        <animateTransform attributeName="transform" type="rotate" values="0 200 200;360 200 200" dur="10s" repeatCount="indefinite"/>
      </svg>
    `;
  }

  generateCollection(achievements) {
    const collection = {
      name: 'RenVault Achievement Badges',
      description: 'Exclusive NFT badges for RenVault protocol achievements',
      image: 'https://renvault.com/collection.png',
      external_link: 'https://renvault.com',
      seller_fee_basis_points: 250,
      fee_recipient: '0x...'
    };

    const items = achievements.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      image: `https://renvault.com/badges/${achievement.id}.png`,
      rarity: achievement.rarity,
      attributes: [
        { trait_type: 'Rarity', value: achievement.rarity },
        { trait_type: 'Points', value: achievement.points },
        { trait_type: 'Category', value: 'Achievement' }
      ]
    }));

    return { collection, items };
  }

  getRarityDistribution() {
    return {
      common: 60,    // 60% chance
      rare: 25,      // 25% chance
      epic: 12,      // 12% chance
      legendary: 3   // 3% chance
    };
  }
}

module.exports = { BadgeGenerator };