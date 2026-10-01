export interface Result<T> {
    success: boolean;
    data?: T | null;
    message?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
