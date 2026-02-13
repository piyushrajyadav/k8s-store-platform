import type { Store } from '../types/Store';

const API_BASE = '/stores';

export async function fetchStores(): Promise<Store[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch stores');
    return res.json();
}

export async function createStore(name: string): Promise<Store> {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create store');
    return res.json();
}

export async function deleteStore(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete store');
}
