import { Group } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function DashboardPage() {
    return <Group p="md">Dashboard</Group>;
}
