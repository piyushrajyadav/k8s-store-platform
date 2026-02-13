import type { Store } from '../types/Store';
import StatusBadge from './StatusBadge';

interface Props {
    stores: Store[];
    onDelete: (id: string) => void;
    loading: boolean;
}

export default function StoreTable({ stores, onDelete, loading }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400">
                <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading stores…
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm font-medium">No stores yet</p>
                <p className="text-xs">Create your first store to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">ID</th>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Name</th>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Namespace</th>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">URL</th>
                        <th className="px-5 py-3 text-left font-semibold text-gray-600">Created</th>
                        <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {stores.map((store) => (
                        <tr key={store.id} className="transition hover:bg-gray-50/60">
                            <td className="whitespace-nowrap px-5 py-3 font-mono text-gray-500">{store.id}</td>
                            <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">{store.name}</td>
                            <td className="whitespace-nowrap px-5 py-3">
                                <StatusBadge status={store.status} />
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-gray-500">{store.namespace}</td>
                            <td className="whitespace-nowrap px-5 py-3">
                                <a
                                    href={store.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                >
                                    {store.url}
                                </a>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                                {new Date(store.createdAt).toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right">
                                <button
                                    onClick={() => onDelete(store.id)}
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
