# RenVault Deployment Infrastructure

Production deployment infrastructure for RenVault ecosystem using Kubernetes and Terraform.

## Components

### Kubernetes
- **namespace.yaml** - RenVault namespace configuration
- **gateway-deployment.yaml** - API gateway deployment with load balancer
- **services-deployment.yaml** - Microservices deployments

### Terraform
- **main.tf** - EKS cluster and AWS infrastructure
- **variables.tf** - Configurable deployment parameters

### Scripts
- **deploy.sh** - Automated deployment script

## Quick Deployment

```bash
# Deploy to existing Kubernetes cluster
chmod +x deployment/scripts/deploy.sh
./deployment/scripts/deploy.sh

# Or deploy individual components
kubectl apply -f deployment/kubernetes/
```

## AWS EKS Deployment

```bash
cd deployment/terraform
terraform init
terraform plan
terraform apply
```

## Architecture

```
Internet → Load Balancer → Gateway (3 replicas)
                            ↓
                         Internal Services
                         ├── Monitoring (2 replicas)
                         ├── Leaderboard (2 replicas)
                         ├── Notifications (2 replicas)
                         └── Backup (2 replicas)
```

## Configuration

- **Gateway**: 3 replicas with load balancer
- **Services**: 2 replicas each for high availability
- **Resources**: CPU and memory limits configured
- **Networking**: Internal service mesh communication