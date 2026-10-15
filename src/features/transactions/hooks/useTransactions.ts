import { useCallback, useEffect, useState } from 'react';
import type { SalesTransaction } from '@/db/types/sales';
import { transactionService } from '../services/transactionService';

export function useTransactions() {
    const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        const result = await transactionService.getTransactions({
            page,
            pageSize,
            search,
        });

        setTransactions(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setIsLoading(false);
    }, [page, pageSize, search]);

    useEffect(() => {
        void fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        isLoading,
        search,
        setSearch: (val: string) => {
            setSearch(val);
            setPage(1);
        },
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            onPageChange: setPage,
        },
    };
}
