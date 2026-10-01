'use client';

import { Card, Group } from '@mantine/core';
// import { IconSearch } from '@tabler/icons-react';
// import { useState } from 'react';
// import { DataTable } from '@/components/common/DataTable';
// import type { User } from '@/db/types/user';

export function UserTable() {
    // const [users] = useState<User[]>([]);
    // const [search, setSearch] = useState('');
    // const [roleFilter, setRoleFilter] = useState<string | null>(null);
    // const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'username'>('createdAt');
    // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    return (
        <Card withBorder p="md" radius="sm">
            <Group justify="space-between" align="center" mb="md" wrap="wrap" gap="sm">
                <Group align="center" gap="sm" wrap="wrap">
                    {/* <TextInput
                        w={260}
                        placeholder="Cari nama atau username..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />

                    <Select
                        w={180}
                        placeholder="Semua Peran"
                        clearable
                        data={}
                        value={roleFilter}
                        onChange={setRoleFilter}
                    /> */}
                </Group>
            </Group>

            {/* <DataTable
                columns={columns}
                data={}
                getRowKey={(user) => user.id}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                minWidth={750}
                emptyText="Pengguna tidak ditemukan."
            /> */}
        </Card>
    );
}
