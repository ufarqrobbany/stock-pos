export interface DashboardMetrics {
    salesToday: number;
    transactionsToday: number;
    unitsSoldToday: number;
    salesYesterday: number;
    transactionsYesterday: number;
}

export interface SalesChartItem {
    label: string;
    tanggal: string;
    penjualan: number | null;
}

export interface TxChartItem {
    label: string;
    tanggal: string;
    transaksi: number;
}

export interface LowStockRow {
    key: string;
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    stock: number;
    threshold: number;
}

export interface RecentTransactionRow {
    id: string;
    transactionNumber: string;
    cashierName: string;
    total: number;
    paymentMethod: string;
    createdAt: string;
}
