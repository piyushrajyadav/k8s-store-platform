import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as k8s from '@kubernetes/client-node';

const execAsync = promisify(exec);



export class ProvisioningService {
    private k8sApi: k8s.CoreV1Api | null = null;
    private chartPath: string;
    private initialized = false;
    private mockMode = false;

    constructor() {
        this.chartPath = path.resolve(__dirname, '../../../store-chart');
    }

    /**
     * Lazy init — load K8s client on first use
     */
    private async ensureK8sClient(): Promise<boolean> {
        if (this.initialized) return !this.mockMode;
        this.initialized = true;

        try {
            const kc = new k8s.KubeConfig();
            console.log('🔄 Loading K8s config...');
            kc.loadFromDefault();
            this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
            console.log('✅ K8s config loaded based on current context');

            // Test connection with timeout
            console.log('🔄 Testing K8s connection (5s timeout)...');
            await Promise.race([
                this.k8sApi.listNamespace(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
            ]);

            console.log('✅ Kubernetes client initialized and connected');
            return true;
        } catch (error) {
            console.error('❌ K8s Connection Error:', error);
            console.warn('⚠️  Could not connect to Kubernetes cluster (timeout or error).');
            console.warn('🔄 Switching to MOCK MODE for development.');
            this.mockMode = true;
            return false;
        }
    }

    /**
     * Create a Kubernetes namespace for a store
     */
    async createNamespace(namespace: string): Promise<void> {
        await this.ensureK8sClient();

        if (this.mockMode) {
            console.log(`[MOCK] Creating namespace "${namespace}"...`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            console.log(`[MOCK] ✅ Namespace "${namespace}" created`);
            return;
        }

        // ... (rest of code relies on k8sApi being present if not in mock mode)
        if (!this.k8sApi) throw new Error('K8s client not available');

        const nsBody = { metadata: { name: namespace } };

        try {
            await this.k8sApi.createNamespace(nsBody);
            console.log(`✅ Namespace "${namespace}" created`);
        } catch (error: any) {
            if (error?.response?.statusCode === 409) {
                console.log(`ℹ️  Namespace "${namespace}" already exists`);
                return;
            }
            console.error(`❌ Failed to create namespace "${namespace}":`, error?.body?.message || error);
            throw new Error(`Failed to create namespace: ${error?.body?.message || error}`);
        }
    }

    /**
     * Install a WooCommerce store using Helm
     */
    async installStore(
        namespace: string,
        releaseName: string,
        storeName: string,
        host: string,
        mysqlPassword: string
    ): Promise<void> {
        await this.ensureK8sClient();

        if (this.mockMode) {
            console.log(`[MOCK] Installing store "${releaseName}" in namespace "${namespace}"...`);
            console.log(`[MOCK] Host: ${host}, MySQL Password: ${mysqlPassword}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate Helm install time
            console.log(`[MOCK] ✅ Store "${releaseName}" installed successfully`);
            return;
        }

        const cmd = [
            'helm', 'install', releaseName, `"${this.chartPath}"`,
            '--namespace', namespace,
            '-f', `"${path.join(this.chartPath, 'values-local.yaml')}"`,
            '--set', `storeName=${storeName}`,
            '--set', `host=${host}`,
            '--set', `mysql.password=${mysqlPassword}`,
            '--set', `mysql.rootPassword=${mysqlPassword}`,
            '--wait',
            '--timeout', '5m',
        ].join(' ');

        try {
            console.log(`🚀 Installing store "${releaseName}" in namespace "${namespace}"...`);
            const { stdout, stderr } = await execAsync(cmd);
            if (stdout) console.log('Helm install output:', stdout);
            if (stderr) console.warn('Helm install warnings:', stderr);
            console.log(`✅ Store "${releaseName}" installed successfully`);
        } catch (error: any) {
            console.error(`❌ Helm install failed for "${releaseName}":`, error?.stderr || error?.message);
            throw new Error(`Helm install failed: ${error?.stderr || error?.message}`);
        }
    }

    /**
     * Delete a store by uninstalling the Helm release and removing the namespace
     */
    async deleteStore(namespace: string, releaseName: string): Promise<void> {
        await this.ensureK8sClient();

        console.log(`🗑️  [Delete] Starting cleanup for store "${releaseName}" in namespace "${namespace}"`);

        if (this.mockMode) {
            console.log(`[MOCK] Step 1: Uninstalling Helm release "${releaseName}"...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`[MOCK] ✅ Helm release "${releaseName}" uninstalled`);

            console.log(`[MOCK] Step 2: Deleting namespace "${namespace}"...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`[MOCK] ✅ Namespace "${namespace}" deleted`);
            return;
        }

        // Step 1: Uninstall the Helm release
        try {
            console.log(`Step 1: Uninstalling Helm release "${releaseName}"...`);
            const cmd = `helm uninstall ${releaseName} --namespace ${namespace}`;
            const { stdout, stderr } = await execAsync(cmd);
            if (stdout) console.log('Helm uninstall output:', stdout);
            if (stderr) console.warn('Helm uninstall warnings:', stderr);
            console.log(`✅ Helm release "${releaseName}" uninstalled`);
        } catch (error: any) {
            console.error(`⚠️  Helm uninstall warning for "${releaseName}":`, error?.stderr || error?.message);
        }

        // Step 2: Delete the namespace
        if (!this.k8sApi) {
            console.warn('⚠️  Kubernetes client not available — skipping namespace deletion');
            return;
        }

        try {
            console.log(`Step 2: Deleting namespace "${namespace}"...`);
            await this.k8sApi.deleteNamespace(namespace);
            console.log(`✅ Namespace "${namespace}" deleted`);
        } catch (error: any) {
            console.error(`❌ Failed to delete namespace "${namespace}":`, error?.body?.message || error);
            throw new Error(`Failed to delete namespace: ${error?.body?.message || error}`);
        }
    }

    /**
     * Check if a namespace exists
     */
    async namespaceExists(namespace: string): Promise<boolean> {
        await this.ensureK8sClient();
        if (this.mockMode) return false; // Mock never has namespaces initially

        if (!this.k8sApi) return false;
        try {
            await this.k8sApi.readNamespace(namespace);
            return true;
        } catch {
            return false;
        }
    }
}
