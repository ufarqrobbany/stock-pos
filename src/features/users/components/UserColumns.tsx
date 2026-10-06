'use client';

import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Column } from '@/components/common/DataTable/types';
import type { User } from '@/db/types/user';
import { formatDate } from '@/utils/date';

interface UserColumnsParams {
    currentUserId?: string;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
}

export function createUserColumns({ currentUserId, onEdit, onDelete }: UserColumnsParams): Column<User>[] {
    return [
        {
            id: 'name',
            label: 'Nama Lengkap',
            sortable: true,
        },
        {
            id: 'username',
            label: 'Username',
            sortable: true,
        },
        {
            id: 'role',
            label: 'Role',
            render: (user) => (
                <Text tt="capitalize" size="sm">
                    {user.role.toLowerCase()}
                </Text>
            ),
        },
        {
            id: 'isActive',
            label: 'Status',
            render: (user) => (
                <Badge size="sm" color={user.isActive ? 'var(--mantine-color-green-9)' : 'gray'}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            id: 'createdAt',
            label: 'Terdaftar Pada',
            sortable: true,
            width: 160,
            render: (user) => formatDate(user.createdAt),
        },
        {
            id: 'actions',
            label: 'Aksi',
            align: 'center',
            render: (user) => {
                const isSelf = user.id === currentUserId;

                return (
                    <Group gap={6} justify="center" wrap="nowrap">
                        {onEdit && (
                            <ActionIcon variant="subtle" onClick={() => onEdit(user)}>
                                <IconEdit size={16} />
                            </ActionIcon>
                        )}
                        {onDelete && !isSelf && (
                            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(user)}>
                                <IconTrash size={16} />
                            </ActionIcon>
                        )}
                    </Group>
                );
            },
        },
    ];
}
