'use client';

import { Card } from '@mantine/core';
import { DataTable } from '@/components/common/DataTable';
import { useUserContext } from '../hooks/useUserContext';
import { createUserColumns } from './UserColumns';

export function UserTable() {
    const { users, isLoading, sort, pagination, currentUserId, openEditModal, handleDeleteUser } = useUserContext();

    const columns = createUserColumns({
        currentUserId,
        onEdit: openEditModal,
        onDelete: handleDeleteUser,
    });

    return (
        <Card withBorder p="md" shadow="none">
            <DataTable
                columns={columns}
                data={users}
                loading={isLoading}
                getRowKey={(user) => user.id}
                sortBy={sort.sortBy}
                sortDirection={sort.sortDirection}
                onSort={sort.onSort}
                minWidth={750}
                emptyText="Pengguna tidak ditemukan"
                pagination={pagination}
            />
        </Card>
    );
}
