'use client';

import { ActionIcon, Avatar, Badge, Group, Switch, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Column } from '@/components/common/DataTable';
import type { ProductListItem } from './productData';

interface CreateProductColumnsOptions {
    onEdit: (productId: string) => void;
    onStatusChange: (product: ProductListItem, isActive: boolean) => void;
    onDelete: (product: ProductListItem) => void;
    onToggleExpand: (productId: string) => void;
    isExpanded: (productId: string) => boolean;
}

export function createProductColumns({
    onEdit,
    onStatusChange,
    onDelete,
    onToggleExpand,
    isExpanded,
}: CreateProductColumnsOptions): Column<ProductListItem>[] {
    return [
        {
            id: 'name',
            label: 'Nama Produk',
            sortable: true,
            render: (product) => (
                <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        color="neutral"
                        size="sm"
                        aria-label={isExpanded(product.id) ? 'Tutup varian' : 'Buka varian'}
                        onClick={() => onToggleExpand(product.id)}
                    >
                        {isExpanded(product.id) ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </ActionIcon>

                    {/* Thumbnail Foto Produk */}
                    <Avatar
                        src={product.image || product.imageUrl || product.image}
                        alt={product.name}
                        radius="md"
                        size="md"
                    />

                    <div>
                        <Text fw={600} size="sm">
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
            sortable: true,
            render: (product) => <Text size="sm">{product.categoryName}</Text>,
        },
        {
            id: 'skuCount',
            label: 'Jumlah SKU',
            sortable: true,
            render: (product) => (
                <Badge variant="light" color="primary">
                    {product.skuCount} SKU
                </Badge>
            ),
        },
        {
            id: 'price',
            label: 'Harga',
            sortable: true,
            render: (product) =>
                product.price === null ? (
                    <Text size="sm" c="neutral.4">
                        -
                    </Text>
                ) : (
                    <Text size="sm">Rp{product.price.toLocaleString('id-ID')}</Text>
                ),
        },
        {
            id: 'stock',
            label: 'Stok',
            sortable: true,
            render: (product) => <Text size="sm">{product.stock}</Text>,
        },
        {
            id: 'isActive',
            label: 'Status',
            render: (product) => (
                <Switch
                    checked={product.isActive}
                    onChange={(event) => onStatusChange(product, event.currentTarget.checked)}
                    aria-label={`Ubah status ${product.name}`}
                />
            ),
        },
        {
            id: 'actions',
            label: 'Aksi',
            render: (product) => (
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="neutral"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit(product.id)}
                    >
                        <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Hapus ${product.name}`}
                        onClick={() => onDelete(product)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];
}
