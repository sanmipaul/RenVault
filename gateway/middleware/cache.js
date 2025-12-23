class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  middleware() {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `${req.method}:${req.originalUrl}`;
      const cached = this.get(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      const originalSend = res.json;
      res.json = (data) => {
        this.set(cacheKey, data, 60); // Cache for 1 minute
        res.setHeader('X-Cache', 'MISS');
        originalSend.call(res, data);
      };

      next();
    };
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }
}

module.exports = CacheManager;