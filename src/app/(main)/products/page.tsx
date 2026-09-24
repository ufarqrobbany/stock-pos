'use client';

import { ActionIcon, Badge, Button, Card, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Category } from '@/db/types/product';
import { createProductColumns } from '@/features/products/productColumns';
import {
    loadProducts,
    PRODUCT_SORT_FIELDS,
    type ProductListItem,
    type ProductSortField,
} from '@/features/products/productData';
import { categoryService } from '@/features/products/services/categoryService';
import { productService } from '@/features/products/services/productService';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<ProductSortField>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [total, setTotal] = useState(0);
    const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

    const refreshProductList = useCallback(async () => {
        const result = await loadProducts({ search, categoryId, sortBy, sortDirection });
        setProducts(result.data);
        setTotal(result.total);
    }, [search, categoryId, sortBy, sortDirection]);

    useEffect(() => {
        categoryService.loadCategories().then(setCategories);
    }, []);

    useEffect(() => {
        void refreshProductList();
    }, [refreshProductList]);

    const handleEdit = (productId: string) => {
        router.push(`/products/edit?id=${productId}`);
    };

    const handleStatusChange = async (product: ProductListItem, isActive: boolean) => {
        const success = await productService.updateProductStatus(product.id, isActive);
        if (success) {
            await refreshProductList();
        }
    };

    const handleDelete = async (product: ProductListItem) => {
        if (!window.confirm(`Hapus produk "${product.name}" secara permanen?`)) return;

        const success = await productService.deleteProduct(product.id);
        if (success) {
            await refreshProductList();
        }
    };

    const toggleExpandedProduct = (productId: string) => {
        setExpandedProductIds((current) => {
            const next = new Set(current);

            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }

            return next;
        });
    };

    const renderExpandedProduct = (product: ProductListItem) => (
        <Stack gap="xs" p="sm" bg="surface.0">
            <Text size="sm" fw={600}>
                Daftar Varian / SKU
            </Text>
            {product.variants.length ? (
                product.variants.map((variant) => (
                    <Group key={variant.id} justify="space-between">
                        <Text size="sm">
                            {variant.name} · {variant.sku}
                        </Text>
                        <Text size="sm">
                            Rp{variant.price.toLocaleString('id-ID')} · Stok {variant.stock}
                        </Text>
                    </Group>
                ))
            ) : (
                <Text size="sm" c="neutral.4">
                    Produk ini tidak memiliki varian terpisah.
                </Text>
            )}
        </Stack>
    );

    const productColumns = createProductColumns({
        onEdit: handleEdit,
        onStatusChange: handleStatusChange,
        onDelete: handleDelete,
        onToggleExpand: toggleExpandedProduct,
        isExpanded: (productId) => expandedProductIds.has(productId),
    });

    const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);

    const handleSort = (columnId: string) => {
        if (!PRODUCT_SORT_FIELDS.includes(columnId as ProductSortField)) return;

        if (sortBy === columnId) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(columnId as ProductSortField);
            setSortDirection('asc');
        }
    };

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Master Produk &amp; SKU</Title>
                    <Text c="neutral.4" size="sm">
                        Kelola data utama produk, foto, atribut varian, harga jual, dan batas stok minimum.
                    </Text>
                </div>
                <Link href="/products/new">
                    <Button color="primary" leftSection={<IconPlus size={16} />}>
                        Tambah Master Produk
                    </Button>
                </Link>
            </Group>

            <Card withBorder p="md" radius="sm">
                <Group justify="space-between" align="center" mb="md">
                    <Group align="center" gap="sm">
                        <TextInput
                            w={260}
                            placeholder="Cari nama produk atau kode SKU..."
                            leftSection={<IconSearch size={16} />}
                            rightSection={
                                search ? (
                                    <ActionIcon
                                        variant="subtle"
                                        color="neutral"
                                        size="sm"
                                        onClick={() => setSearch('')}
                                        aria-label="Hapus pencarian"
                                    >
                                        <IconX size={14} />
                                    </ActionIcon>
                                ) : null
                            }
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                        />
                        <Select
                            w={200}
                            placeholder="Semua Kategori"
                            clearable
                            data={categoryOptions}
                            value={categoryId}
                            onChange={setCategoryId}
                        />
                    </Group>
                    <Badge variant="light" color="primary">
                        {total} PRODUK DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={productColumns}
                    data={products}
                    getRowKey={(item) => item.id}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    minWidth={1050}
                    emptyText="Produk tidak ditemukan."
                    expandedRowIds={expandedProductIds}
                    renderExpandedRow={renderExpandedProduct}
                />
            </Card>
        </Stack>
    );
}
