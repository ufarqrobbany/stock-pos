import { db } from '@/db';
import type {
    DashboardMetrics,
    LowStockRow,
    RecentTransactionRow,
    SalesChartItem,
    TopProductRow,
    TxChartItem,
} from '@/features/dashboard/types';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

function getDayRange(date: Date): { start: string; end: string } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getYearRange(year: number): { start: string; end: string } {
    return {
        start: new Date(year, 0, 1, 0, 0, 0, 0).toISOString(),
        end: new Date(year, 11, 31, 23, 59, 59, 999).toISOString(),
    };
}

async function sumByKey(
    start: string,
    end: string,
    getKey: (createdAt: string) => string
): Promise<Map<string, number>> {
    const txs = await db.salesTransactions
        .where('createdAt')
        .between(start, end, true, true)
        .and((t) => t.status === 'COMPLETED')
        .toArray();

    const map = new Map<string, number>();
    for (const tx of txs) {
        const key = getKey(tx.createdAt);
        map.set(key, (map.get(key) ?? 0) + tx.total);
    }
    return map;
}

async function countByKey(
    start: string,
    end: string,
    getKey: (createdAt: string) => string
): Promise<Map<string, number>> {
    const txs = await db.salesTransactions
        .where('createdAt')
        .between(start, end, true, true)
        .and((t) => t.status === 'COMPLETED')
        .toArray();

    const map = new Map<string, number>();
    for (const tx of txs) {
        const key = getKey(tx.createdAt);
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
}

export const dashboardRepository = {
    async getMetrics(): Promise<DashboardMetrics> {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const todayRange = getDayRange(today);
        const yesterdayRange = getDayRange(yesterday);

        const [todayTxs, yesterdayTxs] = await Promise.all([
            db.salesTransactions
                .where('createdAt')
                .between(todayRange.start, todayRange.end, true, true)
                .and((t) => t.status === 'COMPLETED')
                .toArray(),
            db.salesTransactions
                .where('createdAt')
                .between(yesterdayRange.start, yesterdayRange.end, true, true)
                .and((t) => t.status === 'COMPLETED')
                .toArray(),
        ]);

        const todayTxIds = todayTxs.map((t) => t.id);
        const todayItems =
            todayTxIds.length > 0
                ? await db.salesTransactionItems.where('transactionId').anyOf(todayTxIds).toArray()
                : [];

        return {
            salesToday: todayTxs.reduce((sum, t) => sum + t.total, 0),
            transactionsToday: todayTxs.length,
            unitsSoldToday: todayItems.reduce((sum, item) => sum + item.quantity, 0),
            salesYesterday: yesterdayTxs.reduce((sum, t) => sum + t.total, 0),
            transactionsYesterday: yesterdayTxs.length,
        };
    },

    async getSalesWeekly(): Promise<SalesChartItem[]> {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const map = await sumByKey(monday.toISOString(), sunday.toISOString(), (iso) => {
            const d = new Date(iso);
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        });

        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            return { label: dayNames[i]!, tanggal: fmtDate(d), penjualan: map.get(key) ?? 0 };
        });
    },

    async getSalesThisMonth(): Promise<SalesChartItem[]> {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const { start, end } = getMonthRange(year, month);

        const map = await sumByKey(start, end, (iso) => pad(new Date(iso).getDate()));

        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = i + 1;
            const d = new Date(year, month, date);
            return { label: pad(date), tanggal: fmtDate(d), penjualan: map.get(pad(date)) ?? 0 };
        });
    },

    async getSalesThisYear(): Promise<SalesChartItem[]> {
        const now = new Date();
        const year = now.getFullYear();
        const { start, end } = getYearRange(year);

        const map = await sumByKey(start, end, (iso) => pad(new Date(iso).getMonth() + 1));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return monthNames.map((name, mo) => {
            const first = new Date(year, mo, 1);
            const last = new Date(year, mo + 1, 0);
            return {
                label: name,
                tanggal: `${fmtDate(first)} – ${fmtDate(last)}`,
                penjualan: map.get(pad(mo + 1)) ?? 0,
            };
        });
    },

    async getTxWeekly(): Promise<TxChartItem[]> {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const map = await countByKey(monday.toISOString(), sunday.toISOString(), (iso) => {
            const d = new Date(iso);
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        });

        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            return { label: dayNames[i]!, tanggal: fmtDate(d), transaksi: map.get(key) ?? 0 };
        });
    },

    async getTxThisMonth(): Promise<TxChartItem[]> {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const { start, end } = getMonthRange(year, month);

        const map = await countByKey(start, end, (iso) => pad(new Date(iso).getDate()));

        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = i + 1;
            const d = new Date(year, month, date);
            return { label: pad(date), tanggal: fmtDate(d), transaksi: map.get(pad(date)) ?? 0 };
        });
    },

    async getTxThisYear(): Promise<TxChartItem[]> {
        const now = new Date();
        const year = now.getFullYear();
        const { start, end } = getYearRange(year);

        const map = await countByKey(start, end, (iso) => pad(new Date(iso).getMonth() + 1));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return monthNames.map((name, mo) => {
            const first = new Date(year, mo, 1);
            const last = new Date(year, mo + 1, 0);
            return {
                label: name,
                tanggal: `${fmtDate(first)} – ${fmtDate(last)}`,
                transaksi: map.get(pad(mo + 1)) ?? 0,
            };
        });
    },

    async getLowStock(): Promise<LowStockRow[]> {
        const [balances, products, variants] = await Promise.all([
            db.stockBalances.toArray(),
            db.products.toArray(),
            db.productVariants.toArray(),
        ]);

        const productMap = new Map(products.map((p) => [p.id, p]));
        const variantMap = new Map(variants.map((v) => [v.id, v]));

        const rows: LowStockRow[] = [];

        for (const balance of balances) {
            const product = productMap.get(balance.productId);
            if (!product || !product.isActive) continue;

            let threshold: number;
            let name: string;
            let sku: string;

            if (balance.variantId) {
                const variant = variantMap.get(balance.variantId);
                if (!variant || !variant.isActive) continue;
                threshold = variant.lowStockThreshold ?? 0;
                name = `${product.name} (${variant.variantName})`;
                sku = variant.sku;
            } else {
                threshold = product.lowStockThreshold ?? 0;
                name = product.name;
                sku = product.sku ?? '-';
            }

            if (balance.quantity <= threshold) {
                rows.push({
                    key: `${balance.productId}::${balance.variantId ?? 'none'}`,
                    productId: balance.productId,
                    variantId: balance.variantId,
                    name,
                    sku,
                    stock: balance.quantity,
                    threshold,
                });
            }
        }

        rows.sort((a, b) => a.stock - b.stock);
        return rows;
    },

    async getTopProducts(start: string, end: string, limit = 5): Promise<TopProductRow[]> {
        const txs = await db.salesTransactions
            .where('createdAt')
            .between(start, end, true, true)
            .and((t) => t.status === 'COMPLETED')
            .toArray();

        if (txs.length === 0) return [];

        const txIds = txs.map((t) => t.id);
        const items = await db.salesTransactionItems.where('transactionId').anyOf(txIds).toArray();

        const aggMap = new Map<
            string,
            {
                productId: string;
                variantId: string | null;
                productName: string;
                variantName: string | null;
                skuSnapshot: string;
                qty: number;
            }
        >();

        for (const item of items) {
            const key = `${item.productId}::${item.variantId ?? 'none'}`;
            const existing = aggMap.get(key);
            if (existing) {
                existing.qty += item.quantity;
            } else {
                aggMap.set(key, {
                    productId: item.productId,
                    variantId: item.variantId,
                    productName: item.productNameSnapshot,
                    variantName: item.variantNameSnapshot,
                    skuSnapshot: item.skuSnapshot,
                    qty: item.quantity,
                });
            }
        }

        const sorted = Array.from(aggMap.values())
            .sort((a, b) => b.qty - a.qty)
            .slice(0, limit);

        const productIds = [...new Set(sorted.map((s) => s.productId))];
        const [products, categories] = await Promise.all([
            db.products.where('id').anyOf(productIds).toArray(),
            db.categories.toArray(),
        ]);
        const productMap = new Map(products.map((p) => [p.id, p]));
        const categoryMap = new Map(categories.map((c) => [c.id, c]));

        return sorted.map((s, i) => {
            const product = productMap.get(s.productId);
            const category = product ? categoryMap.get(product.categoryId) : undefined;
            const name = s.variantName ? `${s.productName} (${s.variantName})` : s.productName;

            return {
                rank: i + 1,
                productId: s.productId,
                variantId: s.variantId,
                name,
                sku: s.skuSnapshot,
                category: category?.name ?? '-',
                qtySold: s.qty,
            };
        });
    },

    async getRecentTransactions(limit = 5): Promise<RecentTransactionRow[]> {
        const txs = await db.salesTransactions
            .orderBy('createdAt')
            .reverse()
            .filter((t) => t.status === 'COMPLETED')
            .limit(limit)
            .toArray();

        if (txs.length === 0) return [];

        const cashierIds = [...new Set(txs.map((t) => t.cashierId))];
        const cashiers = await db.users.where('id').anyOf(cashierIds).toArray();
        const cashierMap = new Map(cashiers.map((u) => [u.id, u.name]));

        return txs.map((tx) => ({
            id: tx.id,
            transactionNumber: tx.transactionNumber,
            cashierName: cashierMap.get(tx.cashierId) ?? 'Unknown',
            total: tx.total,
            paymentMethod: tx.paymentMethod,
            createdAt: tx.createdAt,
        }));
    },
};
