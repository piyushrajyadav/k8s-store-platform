import { useEffect, useState, useCallback } from 'react';
import type { Store } from './types/Store';
import { fetchStores, createStore, deleteStore } from './services/api';
import StoreTable from './components/StoreTable';
import CreateStoreModal from './components/CreateStoreModal';

export default function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStores = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchStores();
      setStores(data);
    } catch (err) {
      setError('Could not reach backend. Is it running on port 3000?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // Poll only if there are stores in 'Provisioning' status
  useEffect(() => {
    if (loading) return;

    // Check if any store is still provisioning
    const isProvisioning = stores.some(store => store.status === 'Provisioning');

    if (isProvisioning) {
      const timer = setTimeout(() => {
        loadStores();
      }, 5000); // Poll every 5 seconds
      return () => clearTimeout(timer);
    }
  }, [stores, loading, loadStores]);

  const handleCreate = async (name: string) => {
    try {
      setError(null);
      await createStore(name);
      await loadStores();
    } catch (err) {
      setError('Failed to create store');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store? All Kubernetes resources will be removed.')) return;
    try {
      setError(null);
      await deleteStore(id);
      await loadStores();
    } catch (err) {
      setError('Failed to delete store');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white">
              ☸
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Store Provisioning</h1>
              <p className="text-xs text-gray-500">Kubernetes WooCommerce Platform</p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Store
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Stores</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stores.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Ready</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {stores.filter((s) => s.status === 'Ready').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Provisioning</p>
            <p className="mt-1 text-2xl font-bold text-yellow-700">
              {stores.filter((s) => s.status === 'Provisioning').length}
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Store table */}
        <StoreTable stores={stores} onDelete={handleDelete} loading={loading} />
      </main>

      {/* Create modal */}
      <CreateStoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
