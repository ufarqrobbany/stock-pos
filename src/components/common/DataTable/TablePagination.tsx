'use client';

import { Flex, Group, Pagination, Select, Text } from '@mantine/core';
import type { TablePaginationProps } from './types';

export function TablePagination({
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
}: TablePaginationProps) {
    const from = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, total);

    return (
        <Group justify="space-between" align="center" mt="md" wrap="wrap">
            <Text size="sm" c="dimmed">
                Menampilkan {from} - {to} dari {total} data
            </Text>
            <Pagination total={totalPages} value={page} onChange={onPageChange} size="sm" />
            {onPageSizeChange && (
                <Flex align="center" gap="sm">
                    <Text size="sm" c="dimmed">
                        Tampilkan
                    </Text>
                    <Select
                        w={60}
                        size="xs"
                        value={String(pageSize)}
                        onChange={(val) => val && onPageSizeChange(Number(val))}
                        data={(pageSizeOptions ?? ['5', '10', '25']).map((size) => ({
                            value: size,
                            label: size,
                        }))}
                    />
                    <Text size="sm" c="dimmed">
                        per halaman
                    </Text>
                </Flex>
            )}
        </Group>
    );
}
