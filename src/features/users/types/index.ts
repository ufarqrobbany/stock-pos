import type { UserRole } from '@/db/types/user';

export interface UserQueryParams {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: 'createdAt' | 'name' | 'username';
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
