import fs from 'fs/promises';
import path from 'path';
import { Store, CreateStoreInput } from '../models/Store';

/**
 * Service layer for store operations
 * Handles persistent storage using JSON file
 */
export class StoreService {
    private dataPath: string;

    constructor() {
        this.dataPath = path.join(__dirname, '../../data/stores.json');
    }

    /**
     * Read all stores from JSON file
     */
    async getAllStores(): Promise<Store[]> {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data) as Store[];
        } catch (error) {
            // If file doesn't exist or is empty, return empty array
            return [];
        }
    }

    /**
     * Get a single store by ID
     */
    async getStoreById(id: string): Promise<Store | null> {
        const stores = await this.getAllStores();
        return stores.find(store => store.id === id) || null;
    }

    /**
     * Create a new store
     */
    async createStore(input: CreateStoreInput): Promise<Store> {
        const stores = await this.getAllStores();

        // Generate unique ID (simple incrementing number)
        const newId = stores.length > 0
            ? (Math.max(...stores.map(s => parseInt(s.id))) + 1).toString()
            : '1';

        const newStore: Store = {
            id: newId,
            ...input,
            createdAt: new Date().toISOString()
        };

        stores.push(newStore);
        await this.saveStores(stores);

        return newStore;
    }

    /**
     * Delete a store by ID
     */
    async deleteStore(id: string): Promise<boolean> {
        const stores = await this.getAllStores();
        const initialLength = stores.length;
        const filteredStores = stores.filter(store => store.id !== id);

        if (filteredStores.length === initialLength) {
            return false; // Store not found
        }

        await this.saveStores(filteredStores);
        return true;
    }

    /**
     * Update a store's status
     */
    async updateStoreStatus(id: string, status: Store['status']): Promise<Store | null> {
        const stores = await this.getAllStores();
        const store = stores.find(s => s.id === id);

        if (!store) return null;

        store.status = status;
        await this.saveStores(stores);
        return store;
    }

    /**
     * Save stores array to JSON file
     */
    private async saveStores(stores: Store[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(stores, null, 2), 'utf-8');
    }
}
