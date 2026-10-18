'use client';

import { ActionIcon, Avatar, Badge, Group, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Column } from '@/components/common/DataTable/types';
import type { ProductListItem } from '../types';

interface ProductColumnsParams {
    onEdit: (productId: string) => void;
    onDelete: (product: ProductListItem) => void;
    onToggleExpand: (productId: string) => void;
    isExpanded: (productId: string) => boolean;
}

export function createProductColumns({
    onEdit,
    onDelete,
    onToggleExpand,
    isExpanded,
}: ProductColumnsParams): Column<ProductListItem>[] {
    return [
        {
            id: 'name',
            label: 'Nama Produk',
            sortable: true,
            render: (product) => (
                <Group gap="xs" wrap="nowrap">
                    <ActionIcon variant="subtle" size="sm" onClick={() => onToggleExpand(product.id)}>
                        {isExpanded(product.id) ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </ActionIcon>

                    <Avatar src={product.imageUrl} alt={product.name} radius="md" size="lg" />

                    <div>
                        <Text fw={600} fz={15}>
                            {product.name}
                        </Text>
                        {product.description && (
                            <Text size="xs" c="neutral.4" lineClamp={1}>
                                {product.description}
                            </Text>
                        )}
                    </div>
                </Group>
            ),
        },
        {
            id: 'categoryName',
            label: 'Kategori',
        },
        {
            id: 'price',
            label: 'Harga',
            sortable: true,
            render: (product) => <Text size="sm">Rp{product?.price?.toLocaleString('id-ID')}</Text>, // TODO: rentang harga varian
        },
        {
            id: 'stock',
            label: 'Stok',
            sortable: true,
            render: (product) => <Text size="sm">{product?.stock ?? '-'}</Text>, // TODO: stok varian dan stok habis/minimum
        },
        {
            id: 'isActive',
            label: 'Status',
            render: (product) => (
                <Badge size="sm" color={product.isActive ? 'var(--mantine-color-green-9)' : 'gray'}>
                    {product.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            label: 'Aksi',
            align: 'center',
            render: (product) => (
                <Group gap={6} justify="center" wrap="nowrap">
                    <ActionIcon variant="subtle" onClick={() => onEdit(product.id)}>
                        <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => onDelete(product)}>
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];
}
