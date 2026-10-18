'use client';

import { ActionIcon, Group, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Column } from '@/components/common/DataTable';
import type { Category } from '@/db/types/product';

interface CreateCategoryColumnsOptions {
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void | Promise<void>;
    getParentName: (parentId: string | null | undefined) => string;
}

export function createCategoryColumns({
    onEdit,
    onDelete,
    getParentName,
}: CreateCategoryColumnsOptions): Column<Category>[] {
    return [
        {
            id: 'name',
            label: 'Nama Kategori',
            render: (category: Category) => <Text size="sm">{category.name}</Text>,
        },
        {
            id: 'parent',
            label: 'Parent Kategori',
            render: (category: Category) => <Text size="sm">{getParentName(category.parentId)}</Text>,
        },
        {
            id: 'actions',
            label: 'Aksi',
            render: (category: Category) => (
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="neutral"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => onEdit(category)}
                    >
                        <IconEdit size={16} />
                    </ActionIcon>

                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Hapus ${category.name}`}
                        onClick={() => onDelete(category)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];
}
