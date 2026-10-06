'use client';

import { Center, Group, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';
import classes from './index.module.css';
import type { TableHeadProps } from './types';

export function TableHead<T>({ columns, sortBy, sortDirection, onSort }: TableHeadProps<T>) {
    return (
        <Table.Thead>
            <Table.Tr>
                {columns.map((col) => {
                    const isSorted = sortBy === col.id;
                    const justify =
                        col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start';

                    return (
                        <Table.Th key={col.id} w={col.width} className={classes.th}>
                            {col.sortable && onSort ? (
                                <UnstyledButton onClick={() => onSort(col.id)} className={classes.sortButton}>
                                    <Group gap={4} wrap="nowrap" justify={justify}>
                                        <Text fw={500}>{col.label}</Text>
                                        <Center className={classes.sortIcon} data-sorted={isSorted || undefined}>
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
                                <Text fw={500} ta={col.align ?? 'left'}>
                                    {col.label}
                                </Text>
                            )}
                        </Table.Th>
                    );
                })}
            </Table.Tr>
        </Table.Thead>
    );
}
