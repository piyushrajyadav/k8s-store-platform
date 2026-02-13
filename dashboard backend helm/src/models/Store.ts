/**
 * Store status enum
 */
export type StoreStatus = 'Provisioning' | 'Ready' | 'Failed';

/**
 * Store model interface
 */
export interface Store {
    id: string;
    name: string;
    status: StoreStatus;
    namespace: string;
    url: string;
    createdAt: string;
}

/**
 * Input for creating a new store (without id and createdAt)
 */
export interface CreateStoreInput {
    name: string;
    status: StoreStatus;
    namespace: string;
    url: string;
}
