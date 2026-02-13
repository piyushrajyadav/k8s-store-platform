export type StoreStatus = 'Provisioning' | 'Ready' | 'Failed';

export interface Store {
    id: string;
    name: string;
    status: StoreStatus;
    namespace: string;
    url: string;
    createdAt: string;
}
