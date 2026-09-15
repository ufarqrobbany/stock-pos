import { Group } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Pengguna',
};

export default function UsersPage() {
    return <Group p="md">Manajemen Pengguna</Group>;
}
