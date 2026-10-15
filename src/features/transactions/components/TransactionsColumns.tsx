import { Badge, Button, Text } from '@mantine/core';
import type { SalesTransaction } from '@/db/types/sales';

interface TransactionColumnProps {
    onViewItems: (transaction: SalesTransaction) => void;
}

export function createTransactionColumns({ onViewItems }: TransactionColumnProps) {
    return [
        {
            id: 'transactionNumber',
            label: 'No. Transaksi',
            render: (row: SalesTransaction) => <Text fw={600}>{row.transactionNumber}</Text>,
        },
        {
            id: 'createdAt',
            label: 'Waktu Transaksi',
            render: (row: SalesTransaction) => new Date(row.createdAt).toLocaleString('id-ID'),
        },
        {
            id: 'customerName',
            label: 'Pelanggan',
            render: (row: SalesTransaction) => row.customerName || 'Umum / Guest',
        },
        {
            id: 'totalProducts',
            label: 'Total Produk',
            render: (row: SalesTransaction) => (
                <Button variant="subtle" size="compact-sm" onClick={() => onViewItems(row)}>
                    Lihat Detail Produk
                </Button>
            ),
        },
        {
            id: 'paymentMethod',
            label: 'Metode Pembayaran',
            render: (row: SalesTransaction) => <Badge variant="outline">{row.paymentMethod}</Badge>,
        },
        {
            id: 'total',
            label: 'Total Belanja',
            render: (row: SalesTransaction) => `Rp${row.total.toLocaleString('id-ID')}`,
        },
        {
            id: 'status',
            label: 'Status',
            render: (row: SalesTransaction) => (
                <Badge color={row.status === 'COMPLETED' ? 'green' : 'red'} variant="light">
                    {row.status}
                </Badge>
            ),
        },
    ];
}
