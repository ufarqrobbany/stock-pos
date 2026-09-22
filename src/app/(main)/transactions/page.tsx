import { Group } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Transaksi',
};

export default function DashboardPage() {
    return <Group p="md">Transaksi</Group>;
}
