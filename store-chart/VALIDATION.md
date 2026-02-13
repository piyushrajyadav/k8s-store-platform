# Helm Chart Validation Guide

Since Helm is not installed on this system, here's how to validate the chart when Helm is available:

## Validation Commands

### 1. Lint the Chart
```bash
cd c:\Users\piyus\Downloads\k8s-store-platform
helm lint store-chart
```

**Expected Output:**
```
==> Linting store-chart
[INFO] Chart.yaml: icon is recommended
1 chart(s) linted, 0 chart(s) failed
```

### 2. Render Templates (Dry Run)
```bash
helm template test-store store-chart \
  --set storeName=test \
  --set host=test.local \
  --set mysql.password=testpass123
```

**Expected Output:**
Should generate YAML manifests for:
- Secret (mysql credentials)
- PersistentVolumeClaim (mysql-pvc)
- StatefulSet (mysql)
- Service (mysql headless service)
- Deployment (wordpress)
- Service (wordpress)
- Ingress (wordpress ingress)

### 3. Validate Against Kubernetes API
```bash
helm template test-store store-chart \
  --set storeName=test \
  --set host=test.local \
  --set mysql.password=testpass123 | kubectl apply --dry-run=client -f -
```

### 4. Package the Chart
```bash
helm package store-chart
```

**Expected Output:**
```
Successfully packaged chart and saved it to: store-chart-1.0.0.tgz
```

## Manual Validation Checklist

✅ **Chart Structure**
- Chart.yaml exists with proper metadata
- values.yaml exists with all configuration options
- templates/ directory contains all required templates
- _helpers.tpl contains reusable template functions

✅ **Required Templates**
- secret.yaml (MySQL credentials)
- pvc.yaml (MySQL persistent storage)
- mysql-statefulset.yaml (MySQL database)
- wordpress-deployment.yaml (WordPress application)
- wordpress-service.yaml (WordPress service)
- ingress.yaml (External access)

✅ **Template Features**
- Proper use of Helm template functions
- Labels and selectors are consistent
- Resource names use fullname helper
- Values are properly referenced from values.yaml
- Health probes configured on WordPress
- Environment variables for MySQL connection
- Secrets properly referenced

✅ **Values Configuration**
- storeName: Configurable store identifier
- host: Configurable domain name
- mysql.password: Configurable database password
- Resource limits and requests defined
- Storage size configurable

## Installation Test

Once Helm and Kubernetes are available, test the chart:

```bash
# Create a test namespace
kubectl create namespace test-store

# Install the chart
helm install test-store ./store-chart \
  --namespace test-store \
  --set storeName=test \
  --set host=test.local \
  --set mysql.password=secure123

# Watch the rollout
kubectl get pods -n test-store -w

# Check all resources
kubectl get all,pvc,secret,ingress -n test-store

# Verify WordPress is accessible
kubectl port-forward -n test-store svc/test-store-store-chart-wordpress 8080:80

# Access http://localhost:8080 in browser

# Clean up
helm uninstall test-store -n test-store
kubectl delete namespace test-store
```

## Expected Kubernetes Resources

When the chart is installed with release name "my-store":

1. **Secret**: `my-store-store-chart-mysql-secret`
2. **PVC**: `my-store-store-chart-mysql-pvc`
3. **StatefulSet**: `my-store-store-chart-mysql`
4. **Service (MySQL)**: `my-store-store-chart-mysql` (Headless)
5. **Deployment**: `my-store-store-chart-wordpress`
6. **Service (WordPress)**: `my-store-store-chart-wordpress`
7. **Ingress**: `my-store-store-chart-ingress`

## Common Issues and Solutions

### Issue: Pods stuck in Pending
**Cause**: No storage provisioner available
**Solution**: Ensure your cluster has a default storage class or specify one in values.yaml

### Issue: WordPress can't connect to MySQL
**Cause**: MySQL not ready or incorrect credentials
**Solution**: 
- Check MySQL pod logs: `kubectl logs <mysql-pod>`
- Verify secret values: `kubectl get secret <secret-name> -o yaml`

### Issue: Ingress not working
**Cause**: No ingress controller installed
**Solution**: Install an ingress controller (e.g., nginx-ingress) or use port-forward for testing

## Chart Version Information

- **Chart Version**: 1.0.0
- **App Version**: 1.0
- **Kubernetes Version**: 1.19+
- **Helm Version**: 3.0+

## Files Created

```
store-chart/
├── Chart.yaml                          ✅ Chart metadata
├── values.yaml                         ✅ Default values
├── README.md                          ✅ Documentation
└── templates/
    ├── _helpers.tpl                   ✅ Helper functions
    ├── secret.yaml                    ✅ MySQL credentials
    ├── pvc.yaml                       ✅ Persistent storage
    ├── mysql-statefulset.yaml         ✅ MySQL database
    ├── wordpress-deployment.yaml      ✅ WordPress app
    ├── wordpress-service.yaml         ✅ WordPress service
    └── ingress.yaml                   ✅ External access
```

All files created successfully! ✅
