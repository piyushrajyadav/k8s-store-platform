# WooCommerce Store Helm Chart

A Helm chart for deploying WooCommerce stores on Kubernetes with WordPress and MySQL.

## Overview

This chart deploys a complete WooCommerce e-commerce store with:
- WordPress (with WooCommerce support)
- MySQL database (StatefulSet with persistent storage)
- Ingress for external access
- Automated health checks

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure
- Ingress controller (e.g., nginx-ingress)

## Installation

### Basic Installation

```bash
helm install my-store ./store-chart \
  --set storeName=my-store \
  --set host=mystore.example.com \
  --set mysql.password=secure-password-here
```

### Installation with Custom Values

Create a `custom-values.yaml` file:

```yaml
storeName: "production-store"
host: "shop.example.com"

mysql:
  password: "very-secure-password"
  storage:
    size: 20Gi

wordpress:
  replicas: 2
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
```

Install with custom values:

```bash
helm install prod-store ./store-chart -f custom-values.yaml
```

## Configuration

### Key Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `storeName` | Unique identifier for the store | `my-store` |
| `host` | Domain name for the store | `mystore.example.com` |
| `mysql.password` | MySQL database password | `changeme` |
| `mysql.rootPassword` | MySQL root password | `changeme` |
| `mysql.storage.size` | MySQL persistent volume size | `10Gi` |
| `wordpress.replicas` | Number of WordPress replicas | `1` |
| `ingress.enabled` | Enable ingress resource | `true` |
| `ingress.className` | Ingress class name | `""` (default) |

### Full Configuration

See [values.yaml](./values.yaml) for all configurable parameters.

## Components

### MySQL StatefulSet
- Stable pod identity and persistent storage
- MySQL 8.0 image
- PersistentVolumeClaim for data persistence
- Resource limits configured

### WordPress Deployment
- WordPress with Apache and PHP
- Environment configured for MySQL connection
- **Readiness Probe**: HTTP check on `/wp-admin/install.php`
- **Liveness Probe**: TCP socket check on port 80
- Resource limits configured

### Services
- MySQL: Headless service for StatefulSet
- WordPress: ClusterIP service

### Ingress
- Routes external traffic to WordPress
- Host-based routing
- Optional TLS support

## Health Checks

### WordPress Readiness Probe
```yaml
httpGet:
  path: /wp-admin/install.php
  port: 80
initialDelaySeconds: 30
periodSeconds: 10
```

### WordPress Liveness Probe
```yaml
tcpSocket:
  port: 80
initialDelaySeconds: 60
periodSeconds: 20
```

## Usage Examples

### Deploy a Test Store

```bash
helm install test-store ./store-chart \
  --set storeName=test \
  --set host=test.local \
  --set mysql.password=testpass123
```

### Deploy with Specific Namespace

```bash
kubectl create namespace store-1
helm install store-1 ./store-chart \
  --namespace store-1 \
  --set storeName=store-1 \
  --set host=store1.example.com \
  --set mysql.password=secure-password
```

### Upgrade a Deployment

```bash
helm upgrade my-store ./store-chart \
  --set wordpress.replicas=3
```

### Uninstall

```bash
helm uninstall my-store
```

**Note**: This will delete all resources including the PersistentVolumeClaim and data.

## Accessing the Store

After installation:

1. Wait for pods to be ready:
   ```bash
   kubectl get pods -l store=<storeName>
   ```

2. Ensure ingress is configured:
   ```bash
   kubectl get ingress
   ```

3. Access via browser:
   ```
   http://<host>
   ```

4. Complete WordPress installation wizard

5. Install WooCommerce plugin from WordPress admin panel

## Namespace Isolation

For multi-tenant setups, deploy each store in its own namespace:

```bash
# Create namespace
kubectl create namespace store-<name>

# Install chart
helm install <release-name> ./store-chart \
  --namespace store-<name> \
  --set storeName=<name> \
  --set host=<domain>
```

## Troubleshooting

### Pods Not Starting

Check pod status:
```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Database Connection Issues

Verify MySQL is running:
```bash
kubectl get statefulset
kubectl logs <mysql-pod-name>
```

Check WordPress environment:
```bash
kubectl exec <wordpress-pod> -- env | grep WORDPRESS_DB
```

### Storage Issues

Check PVC status:
```bash
kubectl get pvc
kubectl describe pvc <pvc-name>
```

## Security Considerations

### Production Deployments

1. **Change default passwords**: Never use default passwords in production
   ```bash
   --set mysql.password=$(openssl rand -base64 32)
   ```

2. **Enable TLS**: Configure TLS for production domains
   ```yaml
   ingress:
     tls:
       enabled: true
   ```

3. **Resource Limits**: Set appropriate resource limits based on expected traffic

4. **Network Policies**: Consider implementing network policies for pod-to-pod communication

## Maintenance

### Backup MySQL Data

```bash
kubectl exec <mysql-pod> -- mysqldump -u wordpress -p<password> wordpress > backup.sql
```

### Restore MySQL Data

```bash
kubectl exec -i <mysql-pod> -- mysql -u wordpress -p<password> wordpress < backup.sql
```

## Chart Information

- **Version**: 1.0.0
- **App Version**: 1.0
- **Chart Type**: Application

## License

This Helm chart is provided as-is for the Store Provisioning Platform.
