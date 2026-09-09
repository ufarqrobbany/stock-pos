'use client';

import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Group,
    Image,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconChevronRight,
    IconEdit,
    IconPhoto,
    IconPlus,
    IconSearch,
    IconTrash,
    IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../../../features/products/productData';
import { loadProducts } from '../../../features/products/productData';

const TABLE_HEADERS = [
    { id: 'expand', label: '', width: 42 },
    { id: 'photo', label: 'Foto', width: 58 },
    { id: 'product', label: 'Produk & Deskripsi', width: '35%' },
    { id: 'category', label: 'Kategori', width: 145 },
    { id: 'sku', label: 'Varian / SKU', width: 110 },
    { id: 'price', label: 'Rentang Harga', width: 130 },
    { id: 'stock', label: 'Total Stok', width: 95 },
    { id: 'status', label: 'Status', width: 80 },
    { id: 'actions', label: 'Aksi', width: 70 },
] as const;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        loadProducts().then((loadedProducts) => {
            if (isMounted) {
                setProducts(loadedProducts);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const categories = useMemo(
        () =>
            Array.from(new Set(products.map((product) => product.category))).map((name) => ({
                value: name,
                label: name,
            })),
        [products]
    );

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLowerCase();

        return products.filter((product) => {
            const matchesSearch = `${product.name} ${product.description}`
                .toLowerCase()
                .includes(normalizedSearch);
            const matchesCategory = category === null || product.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [category, products, search]);

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Master Produk &amp; SKU</Title>
                    <Text c="neutral.4" size="sm">
                        Kelola data utama produk, foto, atribut varian, harga jual, dan batas stok
                        minimum.
                    </Text>
                </div>
                <Button color="primary" leftSection={<IconPlus size={16} />}>
                    Tambah Master Produk
                </Button>
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
                            onChange={(event) => setSearch(event.currentTarget.value)}
                        />
                        <Select
                            w={200}
                            placeholder="Semua Kategori"
                            clearable
                            data={categories}
                            value={category}
                            onChange={(value) => setCategory(value)}
                        />
                    </Group>
                    <Badge variant="light" color="primary">
                        {filteredProducts.length} PRODUK DITEMUKAN
                    </Badge>
                </Group>

                <Table.ScrollContainer minWidth={1050}>
                    <Table verticalSpacing="sm" horizontalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                {TABLE_HEADERS.map((header) => (
                                    <Table.Th key={header.id} style={{ width: header.width }}>
                                        {header.label}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredProducts.map((product) => (
                                <ProductRow key={product.id} product={product} />
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>

                {!filteredProducts.length && (
                    <Text ta="center" c="neutral.4" py="xl">
                        Produk tidak ditemukan.
                    </Text>
                )}
            </Card>
        </Stack>
    );
}

function ProductRow({ product }: { product: Product }) {
    const isLowStock = product.stock < 10;

    return (
        <Table.Tr>
            <Table.Td>
                <ActionIcon variant="subtle" color="neutral" size="sm" aria-label="Lihat detail">
                    <IconChevronRight size={16} />
                </ActionIcon>
            </Table.Td>
            <Table.Td>
                {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} w={40} h={40} radius="sm" />
                ) : (
                    <Box
                        w={40}
                        h={40}
                        bg="neutral.0"
                        style={{ display: 'grid', placeItems: 'center', borderRadius: 6 }}
                    >
                        <IconPhoto size={20} color="var(--mantine-color-neutral-4)" />
                    </Box>
                )}
            </Table.Td>
            <Table.Td>
                <Text fw={600} size="sm" lineClamp={1}>
                    {product.name}
                </Text>
                <Text size="xs" c="neutral.4" lineClamp={1}>
                    {product.description}
                </Text>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="neutral" size="sm">
                    {product.category}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge variant="light" color="surface" size="sm">
                    {product.skuCount} SKU
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {product.price}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap={4} wrap="nowrap">
                    <Text size="sm" fw={600} c={isLowStock ? 'red.6' : 'neutral.7'}>
                        {product.stock}
                    </Text>
                    {isLowStock && (
                        <Tooltip label="Stok rendah">
                            <IconAlertTriangle size={15} color="var(--mantine-color-red-6)" />
                        </Tooltip>
                    )}
                </Group>
            </Table.Td>
            <Table.Td>
                <Switch
                    size="sm"
                    color="primary"
                    checked={product.isActive}
                    readOnly
                    aria-label={`Status ${product.name}`}
                />
            </Table.Td>
            <Table.Td>
                <Group gap={2} wrap="nowrap">
                    <Tooltip label="Edit produk">
                        <ActionIcon
                            variant="subtle"
                            color="neutral"
                            size="sm"
                            aria-label="Edit produk"
                        >
                            <IconEdit size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Nonaktifkan produk">
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            aria-label="Nonaktifkan produk"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    );
}
