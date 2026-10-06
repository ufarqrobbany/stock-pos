'use client';

import { Center, Loader, Table, Text } from '@mantine/core';
import { Fragment } from 'react';
import classes from './index.module.css';
import type { TableBodyProps } from './types';

export function TableBody<T>({
    columns,
    data,
    getRowKey,
    loading = false,
    emptyText = 'Data tidak ditemukan.',
    expandedRowIds,
    renderExpandedRow,
}: TableBodyProps<T>) {
    const colCount = columns.length;
    const isFeedbackState = loading || data.length === 0;

    return (
        <Table.Tbody>
            {isFeedbackState ? (
                <Table.Tr>
                    <Table.Td colSpan={colCount} py={loading ? 48 : 'xl'}>
                        <Center>
                            {loading ? <Loader size="sm" color="primary" /> : <Text c="neutral.4">{emptyText}</Text>}
                        </Center>
                    </Table.Td>
                </Table.Tr>
            ) : (
                data.map((row, i) => {
                    const rowKey = getRowKey(row);
                    const isExpanded = expandedRowIds?.has(rowKey) ?? false;

                    return (
                        <Fragment key={rowKey}>
                            <Table.Tr className={`${classes.bodyRow} ${i % 2 === 1 ? classes.stripedRow : ''}`}>
                                {columns.map((col) => {
                                    const cellValue = row[(col.key ?? col.id) as keyof T];
                                    return (
                                        <Table.Td key={col.id} ta={col.align ?? 'left'}>
                                            {col.render ? (
                                                col.render(row)
                                            ) : (
                                                <Text fz={15}>{cellValue != null ? String(cellValue) : '-'}</Text>
                                            )}
                                        </Table.Td>
                                    );
                                })}
                            </Table.Tr>

                            {isExpanded && renderExpandedRow && (
                                <Table.Tr className={classes.bodyRow}>
                                    <Table.Td colSpan={colCount}>{renderExpandedRow(row)}</Table.Td>
                                </Table.Tr>
                            )}
                        </Fragment>
                    );
                })
            )}
        </Table.Tbody>
    );
}
