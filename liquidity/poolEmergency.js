class PoolEmergency {
  constructor() {
    this.paused = new Map();
    this.admins = new Set();
  }

  addAdmin(address) {
    this.admins.add(address);
  }

  isAdmin(address) {
    return this.admins.has(address);
  }

  pausePool(poolId, admin) {
    if (!this.isAdmin(admin)) {
      throw new Error('Unauthorized');
    }
    this.paused.set(poolId, {
      paused: true,
      timestamp: Date.now(),
      admin
    });
  }

  unpausePool(poolId, admin) {
    if (!this.isAdmin(admin)) {
      throw new Error('Unauthorized');
    }
    this.paused.delete(poolId);
  }

  isPaused(poolId) {
    const status = this.paused.get(poolId);
    return status ? status.paused : false;
  }

  checkPoolAccess(poolId) {
    if (this.isPaused(poolId)) {
      throw new Error('Pool is paused');
    }
  }

  getPauseInfo(poolId) {
    return this.paused.get(poolId);
  }

  getAllPausedPools() {
    return Array.from(this.paused.entries()).map(([poolId, info]) => ({
      poolId,
      ...info
    }));
  }
}

module.exports = PoolEmergency;
