'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { ProductProvider } from '@/features/products/context/ProductContext';
import { ProductFilter } from './ProductFilter';
import { ProductTable } from './productTable';

export function ProductManagementView() {
    return (
        <ProductProvider>
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="center">
                    <div>
                        <Title order={2}>Master Produk &amp; SKU</Title>
                        <Text c="neutral.4" size="sm">
                            Kelola data utama produk, foto, atribut varian, harga jual, dan batas stok minimum.
                        </Text>
                    </div>
                    <Link href="/products/new">
                        <Button leftSection={<IconPlus size={16} />}>Tambah Master Produk</Button>
                    </Link>
                </Group>
                <ProductFilter />
                <ProductTable />
            </Stack>
        </ProductProvider>
    );
}
