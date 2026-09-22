import { Group } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Katalog Produk',
};

export default function DashboardPage() {
    return <Group p="md">Katalog Produk</Group>;
}
