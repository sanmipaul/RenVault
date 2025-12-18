#!/bin/bash

set -e

echo "🚀 Starting RenVault deployment..."

# Build Docker images
echo "📦 Building Docker images..."
docker build -t renvault/gateway:latest ./gateway
docker build -t renvault/monitoring:latest ./monitoring
docker build -t renvault/leaderboard:latest ./leaderboard

# Apply Kubernetes configurations
echo "☸️ Applying Kubernetes configurations..."
kubectl apply -f deployment/kubernetes/namespace.yaml
kubectl apply -f deployment/kubernetes/gateway-deployment.yaml
kubectl apply -f deployment/kubernetes/services-deployment.yaml

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/gateway -n renvault
kubectl wait --for=condition=available --timeout=300s deployment/monitoring -n renvault

echo "✅ Deployment complete!"
kubectl get services -n renvault