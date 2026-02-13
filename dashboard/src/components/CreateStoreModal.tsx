import { useState } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

export default function CreateStoreModal({ open, onClose, onCreate }: Props) {
    const [name, setName] = useState('');

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim());
        setName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Create New Store</h2>

                <form onSubmit={handleSubmit}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Store Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. my-awesome-store"
                        autoFocus
                        className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Create Store
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
