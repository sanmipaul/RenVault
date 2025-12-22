// Rewards API Server
const express = require('express');
const { AchievementTracker } = require('./achievementTracker');
const { NFTMinter } = require('./nftMinter');

class RewardsAPI {
  constructor(port = 3005) {
    this.app = express();
    this.port = port;
    this.tracker = new AchievementTracker();
    this.minter = new NFTMinter();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/api/achievements', (req, res) => {
      const stats = this.tracker.getAchievementStats();
      res.json({ achievements: stats });
    });

    this.app.get('/api/achievements/:userAddress', (req, res) => {
      const achievements = this.tracker.getUserAchievements(req.params.userAddress);
      const tokens = this.minter.getUserTokens(req.params.userAddress);
      res.json({ achievements, nfts: tokens });
    });

    this.app.post('/api/track-activity', async (req, res) => {
      try {
        const { userAddress, activity } = req.body;
        const newAchievements = this.tracker.trackUserActivity(userAddress, activity);
        
        const mintedNFTs = [];
        for (const achievement of newAchievements) {
          const nft = this.minter.mintAchievementBadge(userAddress, achievement.id, achievement);
          mintedNFTs.push(nft);
        }

        res.json({ 
          newAchievements: newAchievements.length,
          mintedNFTs,
          achievements: newAchievements
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/nft/:tokenId', (req, res) => {
      const metadata = this.minter.getTokenMetadata(parseInt(req.params.tokenId));
      if (!metadata) return res.status(404).json({ error: 'Token not found' });
      res.json(metadata);
    });

    this.app.post('/api/nft/transfer', (req, res) => {
      try {
        const { tokenId, fromAddress, toAddress } = req.body;
        const result = this.minter.transferToken(tokenId, fromAddress, toAddress);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/stats', (req, res) => {
      const mintingStats = this.minter.getMintingStats();
      const achievementStats = this.tracker.getAchievementStats();
      res.json({ minting: mintingStats, achievements: achievementStats });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Rewards API server running on port ${this.port}`);
    });
  }
}

module.exports = { RewardsAPI };