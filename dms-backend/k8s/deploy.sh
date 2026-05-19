# DMS Kubernetes Deployment Script
# Run from the k8s/ directory

echo "Starting DMS Kubernetes deployment..."

# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Apply config and secrets
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# 3. Deploy infrastructure
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml
kubectl apply -f kafka.yaml

# 4. Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n dms --timeout=120s

# 5. Deploy backend
kubectl apply -f backend.yaml

# 6. Deploy API gateway
kubectl apply -f gateway.yaml

echo ""
echo "Deployment complete!"
echo "Gateway available at: http://localhost:30080"
echo ""
echo "Check status with:"
echo "  kubectl get pods -n dms"
echo "  kubectl get services -n dms"