'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { useTransactions } from '../hooks/useTransactions';

type TransactionContextType = ReturnType<typeof useTransactions>;

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const transactionState = useTransactions();

    return <TransactionContext.Provider value={transactionState}>{children}</TransactionContext.Provider>;
}

export function useTransactionContext() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactionContext must be used within a TransactionProvider');
    }
    return context;
}
