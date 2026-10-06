'use client';

import { Table } from '@mantine/core';
import { TableBody } from './TableBody';
import { TableHead } from './TableHead';
import { TablePagination } from './TablePagination';
import type { DataTableProps } from './types';

export function DataTable<T>({
    columns,
    data,
    getRowKey,
    sortBy,
    sortDirection,
    onSort,
    minWidth = 1050,
    emptyText,
    expandedRowIds,
    renderExpandedRow,
    pagination,
    loading = false,
}: DataTableProps<T>) {
    return (
        <div>
            <Table.ScrollContainer minWidth={minWidth}>
                <Table verticalSpacing="sm" horizontalSpacing="sm" withRowBorders={false}>
                    <TableHead columns={columns} sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
                    <TableBody
                        columns={columns}
                        data={data}
                        getRowKey={getRowKey}
                        loading={loading}
                        emptyText={emptyText}
                        expandedRowIds={expandedRowIds}
                        renderExpandedRow={renderExpandedRow}
                    />
                </Table>
            </Table.ScrollContainer>

            {pagination && pagination.total > 0 && <TablePagination {...pagination} />}
        </div>
    );
}
