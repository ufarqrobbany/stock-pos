import type { ReactNode } from 'react';

export interface Column<T> {
    id: string;
    label: string;
    key?: keyof T;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
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
    pagination?: TablePaginationProps;
    loading?: boolean;
}

export interface TableHeadProps<T> {
    columns: Column<T>[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (columnId: string) => void;
}

export interface TableBodyProps<T> {
    columns: Column<T>[];
    data: T[];
    getRowKey: (row: T) => string;
    loading?: boolean;
    emptyText?: string;
    expandedRowIds?: Set<string>;
    renderExpandedRow?: (row: T) => ReactNode;
}

export interface TablePaginationProps {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: string[];
}
