'use client';

import { CloseButton, Flex, Group, Select, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useProductContext } from '../context/ProductContext';

export function ProductFilter() {
    const { search, setSearch, categoryId, setCategoryId, categories } = useProductContext();

    const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);

    return (
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
            <TextInput
                w={360}
                placeholder="Cari nama produk atau kode SKU..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                    search ? (
                        <CloseButton size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => setSearch('')} />
                    ) : null
                }
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <Flex direction="row" align="center" gap="sm">
                <Text size="sm" fw={500}>
                    Kategori
                </Text>
                <Select
                    w={180}
                    placeholder="Semua Kategori"
                    clearable
                    data={categoryOptions}
                    value={categoryId}
                    onChange={setCategoryId}
                />
            </Flex>
        </Group>
    );
}
