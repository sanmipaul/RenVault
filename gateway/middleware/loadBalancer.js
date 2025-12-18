class LoadBalancer {
  constructor() {
    this.services = new Map();
    this.currentIndex = new Map();
  }

  addService(name, instances) {
    this.services.set(name, instances);
    this.currentIndex.set(name, 0);
  }

  getNextInstance(serviceName) {
    const instances = this.services.get(serviceName);
    if (!instances || instances.length === 0) {
      return null;
    }

    const currentIdx = this.currentIndex.get(serviceName);
    const instance = instances[currentIdx];
    
    this.currentIndex.set(serviceName, (currentIdx + 1) % instances.length);
    
    return instance;
  }

  getServiceHealth(serviceName) {
    const instances = this.services.get(serviceName);
    return {
      service: serviceName,
      instances: instances ? instances.length : 0,
      available: instances && instances.length > 0
    };
  }
}

module.exports = LoadBalancer;