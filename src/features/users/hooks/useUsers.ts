'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/db/types/user';
import { userService } from '@/features/users/services/userService';
import type { UserQueryParams, UserRoleFilter, UserSortField } from '@/features/users/types';
import type { PaginatedResult } from '@/types/common';

interface UseUsersOptions {
    defaultSortBy?: UserSortField;
    defaultSortDirection?: 'asc' | 'desc';
    defaultPageSize?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
    const { defaultSortBy = 'createdAt', defaultSortDirection = 'desc', defaultPageSize = 10 } = options;

    const [data, setData] = useState<PaginatedResult<User>>({
        items: [],
        total: 0,
        page: 1,
        pageSize: defaultPageSize,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [role, setRole] = useState<UserRoleFilter>('ALL');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [sortBy, setSortBy] = useState<UserSortField>(defaultSortBy);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const query: UserQueryParams = {
                page,
                pageSize,
                search: debouncedSearch.trim() || undefined,
                role: role === 'ALL' ? null : role,
                sortBy,
                sortDirection,
            };
            const result = await userService.getUsers(query);
            setData(result);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, debouncedSearch, role, sortBy, sortDirection]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const handleSort = (columnId: string) => {
        const validFields: UserSortField[] = ['createdAt', 'name', 'username'];
        if (!validFields.includes(columnId as UserSortField)) return;
        const targetField = columnId as UserSortField;

        if (sortBy === targetField) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(targetField);
            setSortDirection('asc');
        }
        setPage(1);
    };

    return {
        users: data.items,
        isLoading,
        filter: {
            search,
            role,
            setSearch: (val: string) => {
                setSearch(val);
                setPage(1);
            },
            setRole: (selected: UserRoleFilter) => {
                setRole(selected);
                setPage(1);
            },
        },
        sort: {
            sortBy,
            sortDirection,
            onSort: handleSort,
        },
        pagination: {
            page,
            pageSize,
            total: data.total,
            totalPages: data.totalPages,
            onPageChange: setPage,
            onPageSizeChange: (newSize: number) => {
                setPageSize(newSize);
                setPage(1);
            },
        },
        refresh: fetchUsers,
    };
}

export type UsersState = ReturnType<typeof useUsers>;
