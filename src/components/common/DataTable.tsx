'use client';

import { Center, Group, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';
import { Fragment, type ReactNode } from 'react';

export interface Column<T> {
    id: string;
    label: string;
    width?: number | string;
    sortable?: boolean;
    render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    getRowKey: (row: T) => string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (columnId: string) => void;
    minWidth?: number;
    emptyText?: string;
    expandedRowIds?: Set<string>;
    renderExpandedRow?: (row: T) => ReactNode;
}

export function DataTable<T>({
    columns,
    data,
    getRowKey,
    sortBy,
    sortDirection,
    onSort,
    minWidth = 1050,
    emptyText = 'Data tidak ditemukan.',
    expandedRowIds,
    renderExpandedRow,
}: DataTableProps<T>) {
    return (
        <Table.ScrollContainer minWidth={minWidth}>
            <Table verticalSpacing="sm" horizontalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        {columns.map((column) => {
                            const isSorted = sortBy === column.id;

                            return (
                                <Table.Th key={column.id} style={{ width: column.width }}>
                                    {column.sortable && onSort ? (
                                        <UnstyledButton onClick={() => onSort(column.id)}>
                                            <Group gap={4} wrap="nowrap">
                                                <Text fw={700} size="sm">
                                                    {column.label}
                                                </Text>
                                                <Center>
                                                    {isSorted ? (
                                                        sortDirection === 'asc' ? (
                                                            <IconChevronUp size={14} />
                                                        ) : (
                                                            <IconChevronDown size={14} />
                                                        )
                                                    ) : (
                                                        <IconSelector size={14} />
                                                    )}
                                                </Center>
                                            </Group>
                                        </UnstyledButton>
                                    ) : (
                                        column.label
                                    )}
                                </Table.Th>
                            );
                        })}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.map((row) => {
                        const rowKey = getRowKey(row);
                        const isExpanded = expandedRowIds?.has(rowKey) ?? false;

                        return (
                            <Fragment key={rowKey}>
                                <Table.Tr>
                                    {columns.map((column) => (
                                        <Table.Td key={column.id}>{column.render(row)}</Table.Td>
                                    ))}
                                </Table.Tr>
                                {isExpanded && renderExpandedRow && (
                                    <Table.Tr>
                                        <Table.Td colSpan={columns.length}>
                                            {renderExpandedRow(row)}
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Fragment>
                        );
                    })}
                </Table.Tbody>
            </Table>

            {!data.length && (
                <Text ta="center" c="neutral.4" py="xl">
                    {emptyText}
                </Text>
            )}
        </Table.ScrollContainer>
    );
}
