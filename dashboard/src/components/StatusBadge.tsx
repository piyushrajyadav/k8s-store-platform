import type { StoreStatus } from '../types/Store';

const statusStyles: Record<StoreStatus, string> = {
    Provisioning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Ready: 'bg-green-100 text-green-800 border-green-300',
    Failed: 'bg-red-100 text-red-800 border-red-300',
};

const statusIcons: Record<StoreStatus, string> = {
    Provisioning: '⏳',
    Ready: '✅',
    Failed: '❌',
};

export default function StatusBadge({ status }: { status: StoreStatus }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
            <span>{statusIcons[status]}</span>
            {status}
        </span>
    );
}
