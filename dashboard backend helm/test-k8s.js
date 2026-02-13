
const k8s = require('@kubernetes/client-node');

async function testConnection() {
    try {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
        console.log('Attempting to list namespaces...');
        const res = await k8sApi.listNamespace();
        console.log('Successfully connected to Kubernetes cluster.');
        console.log('Namespaces:', res.body.items.map(n => n.metadata.name).join(', '));
    } catch (err) {
        console.error('Failed to connect:', err);
    }
}

testConnection();
