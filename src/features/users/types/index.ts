import type { UserRole } from '@/db/types/user';

// TODO kenapa gini?
export const USER_SORT_FIELDS = ['createdAt', 'name', 'username'];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export type UserRoleFilter = UserRole | 'ALL';

export interface UserQueryParams {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: UserSortField;
    sortDirection?: 'asc' | 'desc';
    role?: UserRole | null;
}

export interface CreateUserInput {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    isActive?: boolean;
}

export interface UpdateUserInput {
    name?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
}
