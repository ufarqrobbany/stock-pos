'use client';

import { Button, CloseButton, Flex, Group, ScrollArea, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { Category } from '@/db/types/product';

interface PosFilterProps {
    search: string;
    onSearchChange: (value: string) => void;
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export function PosFilter({ search, onSearchChange, categories, selectedCategory, onSelectCategory }: PosFilterProps) {
    return (
        <Flex direction="column" align="flex-start" gap="sm">
            <TextInput
                w={{ base: '100%', sm: 320 }}
                placeholder="Cari produk atau SKU..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                    search ? (
                        <CloseButton
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onSearchChange('')}
                            aria-label="Hapus pencarian"
                        />
                    ) : null
                }
                value={search}
                onChange={(e) => onSearchChange(e.currentTarget.value)}
            />

            <ScrollArea type="never" offsetScrollbars={false} w="100%">
                <Group gap="xs" wrap="nowrap">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <Button
                                key={cat.id}
                                size="xs"
                                variant={isSelected ? 'filled' : 'default'}
                                color={isSelected ? 'primary' : undefined}
                                radius="xl"
                                bd={isSelected ? 'none' : '1px solid var(--mantine-color-surface-2)'}
                                fw={isSelected ? 600 : 500}
                                onClick={() => onSelectCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        );
                    })}
                </Group>
            </ScrollArea>
        </Flex>
    );
}
