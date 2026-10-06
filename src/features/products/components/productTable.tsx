'use client';

import { ActionIcon, Avatar, Badge, Card, Group, Pagination, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Category } from '@/db/types/product';
import { createProductColumns } from '@/features/products/productColumns';
import { PRODUCT_SORT_FIELDS, type ProductListItem, type ProductSortField } from '@/features/products/productData';
import { categoryService } from '@/features/products/services/categoryService';
import { productService } from '@/features/products/services/productService';

export function ProductTable() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<ProductSortField>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

    const refreshProductList = useCallback(async () => {
        const result = await productService.loadProducts({
            search,
            categoryId,
            sortBy,
            sortDirection,
            page,
            pageSize,
        });

        setProducts(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
    }, [search, categoryId, sortBy, sortDirection, page, pageSize]);

    useEffect(() => {
        categoryService.loadCategories().then(setCategories);
    }, []);

    useEffect(() => {
        void refreshProductList();
    }, [refreshProductList]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategoryChange = (value: string | null) => {
        setCategoryId(value);
        setPage(1);
    };

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
            {'image' in product && product.image && (
                <Group gap="xs" mb="xs">
                    <Text size="sm" fw={600}>
                        Foto Produk:
                    </Text>
                    <Avatar src={product.image as string} alt={product.name} radius="sm" size="lg" />
                </Group>
            )}

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
        <Card withBorder p="md">
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
                                    onClick={() => handleSearchChange('')}
                                    aria-label="Hapus pencarian"
                                >
                                    <IconX size={14} />
                                </ActionIcon>
                            ) : null
                        }
                        value={search}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    />
                    <Select
                        w={200}
                        placeholder="Semua Kategori"
                        clearable
                        data={categoryOptions}
                        value={categoryId}
                        onChange={handleCategoryChange}
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

            {/* pagination */}
            {total > 0 && (
                <Group justify="space-between" align="center" mt="md">
                    <Text size="sm" c="dimmed">
                        Menampilkan {products.length ? (page - 1) * pageSize + 1 : 0} -{' '}
                        {Math.min(page * pageSize, total)} dari {total} produk
                    </Text>
                    <Group gap="xs">
                        <Select
                            w={110}
                            size="xs"
                            value={String(pageSize)}
                            onChange={(val) => {
                                if (val) {
                                    setPageSize(Number(val));
                                    setPage(1);
                                }
                            }}
                            data={[
                                { value: '5', label: '5 / hal' },
                                { value: '10', label: '10 / hal' },
                                { value: '20', label: '20 / hal' },
                                { value: '50', label: '50 / hal' },
                            ]}
                        />
                        <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
                    </Group>
                </Group>
            )}
        </Card>
    );
}
