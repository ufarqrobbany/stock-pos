import { Group } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Point of Sale',
};

export default function DashboardPage() {
    return <Group p="md">Point of Sale</Group>;
}
