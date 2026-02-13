import { Router, Request, Response } from 'express';
import { StoreService } from '../services/StoreService';
import { ProvisioningService } from '../services/ProvisioningService';

const router = Router();
const storeService = new StoreService();
const provisioningService = new ProvisioningService();

/**
 * GET /stores
 * Retrieve all stores
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const stores = await storeService.getAllStores();
        res.json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

/**
 * GET /stores/:id
 * Retrieve a single store by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const store = await storeService.getStoreById(id);

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ error: 'Failed to fetch store' });
    }
});

/**
 * POST /stores
 * Create a new store and provision it on Kubernetes
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        // Validate
        if (!name) {
            return res.status(400).json({ error: 'Missing required field: name' });
        }

        // Generate namespace and release name from store name
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const namespace = `store-${sanitized}`;
        const releaseName = sanitized;
        const host = `${sanitized}.localhost`;

        // Save store with Provisioning status
        const newStore = await storeService.createStore({
            name,
            status: 'Provisioning',
            namespace,
            url: `http://${host}`,
        });

        // Return immediately, provision in background
        res.status(201).json(newStore);

        // Provision asynchronously
        (async () => {
            try {
                console.log(`🔧 Provisioning store "${name}" (ID: ${newStore.id})...`);

                // Create namespace
                await provisioningService.createNamespace(namespace);

                // Install Helm chart
                const mysqlPassword = `pass-${Date.now()}`;
                await provisioningService.installStore(namespace, releaseName, sanitized, host, mysqlPassword);

                // Update status to Ready
                await storeService.updateStoreStatus(newStore.id, 'Ready');
                console.log(`✅ Store "${name}" is now Ready`);
            } catch (error) {
                console.error(`❌ Provisioning failed for store "${name}":`, error);
                await storeService.updateStoreStatus(newStore.id, 'Failed');
            }
        })();
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
});

/**
 * DELETE /stores/:id
 * Delete a store and remove all Kubernetes resources
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`⬇️  Received delete request for store ID: ${id}`);

        const store = await storeService.getStoreById(id);

        if (!store) {
            console.warn(`⚠️  Store ID ${id} not found for deletion`);
            return res.status(404).json({ error: 'Store not found' });
        }

        // Delete Kubernetes resources
        const sanitized = store.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const releaseName = sanitized;

        try {
            console.log(`🔄 Attempting to clean up Kubernetes resources for "${store.name}"...`);
            await provisioningService.deleteStore(store.namespace, releaseName);
        } catch (error) {
            console.error(`⚠️  K8s cleanup warning for store "${store.name}":`, error);
            // Continue with local deletion even if K8s cleanup fails
        }

        // Remove from local storage
        console.log(`🗑️  Removing store "${store.name}" (ID: ${id}) from local database...`);
        await storeService.deleteStore(id);
        console.log(`✅ Store "${store.name}" successfully deleted`);

        res.json({ message: 'Store deleted successfully', id });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

export default router;
