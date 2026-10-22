import { db } from '@/db';
import { productRepository } from '@/db/repositories/productRepository';
import { stockAdjustmentRepository, stockEntryRepository } from '@/db/repositories/stockRepository';
import { dashboardService } from './dashboardService';

const JAKARTA_TZ = 'Asia/Jakarta';

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { timeZone: JAKARTA_TZ });
}

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString('id-ID', { timeZone: JAKARTA_TZ });
}

async function getProductNameMap(): Promise<Map<string, string>> {
    const products = await db.products.toArray();
    return new Map(products.map((p) => [p.id, p.name]));
}

export const dexieChatbotTools = {
    async getProducts(params: { search?: string; categoryId?: string; limit?: number }) {
        const res = await productRepository.loadProducts({ search: params.search, categoryId: params.categoryId });
        const items = res.success && res.data ? res.data.items : [];
        const limit = params.limit ?? 10;

        return {
            totalFound: items.length,
            products: items.slice(0, limit).map((p) => ({
                id: p.id,
                name: p.name,
                category: p.categoryName,
                price: p.price,
                stock: p.stock,
                lowStockThreshold: p.lowStockThreshold,
                hasVariants: p.variants.length > 0,
                variantsCount: p.variants.length,
                isActive: p.isActive,
            })),
        };
    },

    async getProductDetail(params: { search: string }) {
        const q = params.search.trim().toLowerCase();
        const res = await productRepository.loadProducts();
        if (!res.success || !res.data) {
            return { found: false, message: 'Gagal memuat produk dari database.' };
        }

        const p = res.data.items.find(
            (item) =>
                item.id === params.search ||
                item.name.toLowerCase().includes(q) ||
                item.variants.some((v) => v.sku.toLowerCase() === q || v.name.toLowerCase().includes(q))
        );

        if (!p) {
            return {
                found: false,
                message: `Produk dengan kata kunci "${params.search}" tidak ditemukan dalam database toko.`,
            };
        }

        return {
            found: true,
            id: p.id,
            name: p.name,
            description: p.description || '-',
            category: p.categoryName,
            price: p.price,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            status: p.stock <= 0 ? 'Habis' : p.stock <= p.lowStockThreshold ? 'Menipis' : 'Aman',
            variants: p.variants.map((v) => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                lowStockThreshold: v.lowStockThreshold,
            })),
        };
    },

    async getLowStockProducts(params: { limit?: number }) {
        const lowStock = await dashboardService.getLowStock();
        const limit = params.limit ?? 10;

        return {
            totalLowStock: lowStock.length,
            items: lowStock.slice(0, limit).map((item) => ({
                name: item.name,
                sku: item.sku,
                stock: item.stock,
                threshold: item.threshold,
                status: item.stock === 0 ? 'Habis (0)' : `Menipis (${item.stock}/${item.threshold})`,
            })),
        };
    },

    async getSalesMetrics(params: { period?: 'today' | 'yesterday' | 'week' | 'month' | 'comparison' }) {
        const period = params.period ?? 'today';
        const metrics = await dashboardService.getMetrics();

        if (period === 'comparison') {
            const revDiff = metrics.salesToday - metrics.salesYesterday;
            const growthPercent =
                metrics.salesYesterday > 0
                    ? Number(((revDiff / metrics.salesYesterday) * 100).toFixed(1))
                    : metrics.salesToday > 0
                      ? 100
                      : 0;
            const txDiff = metrics.transactionsToday - metrics.transactionsYesterday;

            return {
                period: 'Perbandingan Hari Ini vs Kemarin',
                today: {
                    salesRevenue: metrics.salesToday,
                    transactionsCount: metrics.transactionsToday,
                    unitsSold: metrics.unitsSoldToday,
                },
                yesterday: {
                    salesRevenue: metrics.salesYesterday,
                    transactionsCount: metrics.transactionsYesterday,
                },
                comparison: {
                    revenueDifference: revDiff,
                    growthPercentage: `${growthPercent > 0 ? '+' : ''}${growthPercent}%`,
                    transactionsDifference: txDiff,
                    conclusion:
                        revDiff > 0
                            ? 'Penjualan hari ini lebih bagus dibanding kemarin (omzet meningkat).'
                            : revDiff < 0
                              ? 'Penjualan kemarin lebih tinggi dibanding hari ini.'
                              : 'Omzet hari ini sama dengan kemarin.',
                },
            };
        }

        if (period === 'yesterday') {
            return {
                period: 'Kemarin',
                salesRevenue: metrics.salesYesterday,
                transactionsCount: metrics.transactionsYesterday,
            };
        }

        if (period === 'week') {
            const weekly = await dashboardService.getSalesWeekly();
            const totalWeek = weekly.reduce((sum, item) => sum + (item.penjualan ?? 0), 0);
            return {
                period: 'Minggu Ini',
                totalSalesRevenue: totalWeek,
                dailyBreakdown: weekly.map((w) => ({ label: w.label, penjualan: w.penjualan })),
            };
        }

        if (period === 'month') {
            const monthly = await dashboardService.getSalesThisMonth();
            const totalMonth = monthly.reduce((sum, item) => sum + (item.penjualan ?? 0), 0);
            return {
                period: 'Bulan Ini',
                totalSalesRevenue: totalMonth,
            };
        }

        return {
            period: 'Hari Ini',
            salesRevenue: metrics.salesToday,
            transactionsCount: metrics.transactionsToday,
            unitsSold: metrics.unitsSoldToday,
            salesYesterday: metrics.salesYesterday,
            transactionsYesterday: metrics.transactionsYesterday,
        };
    },

    async getRecentTransactions(params: { limit?: number }) {
        const txs = await dashboardService.getRecentTransactions(params.limit ?? 5);

        return {
            totalLoaded: txs.length,
            transactions: txs.map((t) => ({
                transactionNumber: t.transactionNumber,
                waktu: fmtDateTime(t.createdAt),
                cashierName: t.cashierName,
                paymentMethod: t.paymentMethod,
                total: t.total,
            })),
        };
    },

    async getTransactionDetail(params: { transactionNumberOrId: string }) {
        const query = params.transactionNumberOrId.trim();
        let tx =
            (await db.salesTransactions.where('transactionNumber').equals(query).first()) ||
            (await db.salesTransactions.get(query));

        if (!tx) {
            const all = await db.salesTransactions.toArray();
            tx = all.find((item) => item.transactionNumber.toLowerCase().includes(query.toLowerCase()));
        }

        if (!tx) {
            return { found: false, message: `Transaksi dengan nomor/ID "${query}" tidak ditemukan.` };
        }

        const [items, cashier] = await Promise.all([
            db.salesTransactionItems.where('transactionId').equals(tx.id).toArray(),
            db.users.get(tx.cashierId),
        ]);

        return {
            found: true,
            transactionNumber: tx.transactionNumber,
            createdAt: fmtDateTime(tx.createdAt),
            cashierName: cashier?.name || cashier?.username || 'Kasir',
            customerName: tx.customerName || 'Umum / Guest',
            paymentMethod: tx.paymentMethod,
            status: tx.status,
            total: tx.total,
            items: items.map((i) => ({
                productName: i.productNameSnapshot,
                variantName: i.variantNameSnapshot || '-',
                sku: i.skuSnapshot,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                subtotal: i.subtotal,
            })),
        };
    },

    async getCategories() {
        const [categories, products] = await Promise.all([db.categories.toArray(), db.products.toArray()]);
        const countMap = new Map<string, number>();

        for (const p of products) {
            countMap.set(p.categoryId, (countMap.get(p.categoryId) ?? 0) + 1);
        }

        return categories.map((c) => ({
            id: c.id,
            name: c.name,
            totalProducts: countMap.get(c.id) ?? 0,
        }));
    },

    async getCustomers(params: { search?: string; limit?: number }) {
        let customers = await db.customers.toArray();
        if (params.search) {
            const q = params.search.trim().toLowerCase();
            customers = customers.filter(
                (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.notes?.toLowerCase().includes(q)
            );
        }

        const limit = params.limit ?? 5;
        return {
            totalFound: customers.length,
            customers: customers.slice(0, limit).map((c) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                notes: c.notes || '-',
                registeredAt: fmtDate(c.createdAt),
            })),
        };
    },

    async getPeakSalesAnalytics() {
        const txs = await db.salesTransactions.where('status').equals('COMPLETED').toArray();

        if (txs.length === 0) {
            return { hasData: false, message: 'Belum ada transaksi penjualan yang tercatat di toko.' };
        }

        let highestTx = txs[0];
        const dailyMap = new Map<string, { totalRevenue: number; txCount: number; txIds: string[] }>();

        for (const tx of txs) {
            if (!highestTx || tx.total > highestTx.total) highestTx = tx;

            const dateKey = tx.createdAt.slice(0, 10);
            const current = dailyMap.get(dateKey) ?? { totalRevenue: 0, txCount: 0, txIds: [] };
            current.totalRevenue += tx.total;
            current.txCount += 1;
            current.txIds.push(tx.id);
            dailyMap.set(dateKey, current);
        }

        let peakDate = '';
        let peakRevenue = -1;
        let peakTxCount = 0;
        let peakTxIds: string[] = [];

        for (const [date, data] of dailyMap.entries()) {
            if (data.totalRevenue > peakRevenue) {
                peakRevenue = data.totalRevenue;
                peakDate = date;
                peakTxCount = data.txCount;
                peakTxIds = data.txIds;
            }
        }

        let peakDayTopProducts: Array<{ name: string; qty: number; revenue: number }> = [];
        if (peakTxIds.length > 0) {
            const peakItems = await db.salesTransactionItems.where('transactionId').anyOf(peakTxIds).toArray();
            const prodMap = new Map<string, { name: string; qty: number; revenue: number }>();
            for (const item of peakItems) {
                const key = `${item.productNameSnapshot}${item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ''}`;
                const existing = prodMap.get(key) ?? { name: key, qty: 0, revenue: 0 };
                existing.qty += item.quantity;
                existing.revenue += item.subtotal;
                prodMap.set(key, existing);
            }
            peakDayTopProducts = Array.from(prodMap.values())
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 5);
        }

        let highestTxItems: Array<{
            productName: string;
            variantName: string | null;
            quantity: number;
            unitPrice: number;
            subtotal: number;
        }> = [];
        let cashierName = 'Kasir';

        if (highestTx) {
            const [items, cashier] = await Promise.all([
                db.salesTransactionItems.where('transactionId').equals(highestTx.id).toArray(),
                db.users.get(highestTx.cashierId),
            ]);
            if (cashier) cashierName = cashier.name || cashier.username;
            highestTxItems = items.map((i) => ({
                productName: i.productNameSnapshot,
                variantName: i.variantNameSnapshot || null,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                subtotal: i.subtotal,
            }));
        }

        return {
            hasData: true,
            peakDay: {
                date: peakDate,
                dateFormatted: fmtDate(peakDate),
                totalRevenue: peakRevenue,
                transactionCount: peakTxCount,
                topProducts: peakDayTopProducts,
            },
            highestTransaction: highestTx
                ? {
                      transactionNumber: highestTx.transactionNumber,
                      dateFormatted: fmtDateTime(highestTx.createdAt),
                      total: highestTx.total,
                      cashierName,
                      customerName: highestTx.customerName || 'Umum / Guest',
                      items: highestTxItems,
                  }
                : null,
        };
    },

    async getTopProducts(params: { period?: 'today' | 'week' | 'month' | 'all'; limit?: number }) {
        const period = params.period ?? 'all';
        const limit = params.limit ?? 5;
        const now = new Date();

        let txs = await db.salesTransactions.where('status').equals('COMPLETED').toArray();

        if (period === 'today') {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            txs = txs.filter((t) => new Date(t.createdAt) >= start);
        } else if (period === 'week') {
            const start = new Date(now);
            start.setDate(now.getDate() - 7);
            txs = txs.filter((t) => new Date(t.createdAt) >= start);
        } else if (period === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            txs = txs.filter((t) => new Date(t.createdAt) >= start);
        }

        if (txs.length === 0) {
            return { totalFound: 0, period, message: `Belum ada penjualan untuk periode ${period}.`, items: [] };
        }

        const txIds = txs.map((t) => t.id);
        const items = await db.salesTransactionItems.where('transactionId').anyOf(txIds).toArray();
        const aggMap = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();

        for (const item of items) {
            const name = item.variantNameSnapshot
                ? `${item.productNameSnapshot} (${item.variantNameSnapshot})`
                : item.productNameSnapshot;
            const key = `${item.productId}::${item.variantId ?? 'none'}`;
            const existing = aggMap.get(key) ?? { name, sku: item.skuSnapshot, quantity: 0, revenue: 0 };
            existing.quantity += item.quantity;
            existing.revenue += item.subtotal;
            aggMap.set(key, existing);
        }

        return {
            totalFound: aggMap.size,
            period,
            items: Array.from(aggMap.values())
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, limit),
        };
    },

    async getStockEntries(params: { search?: string; limit?: number }) {
        const [res, prodMap] = await Promise.all([
            stockEntryRepository.getAll({ search: params.search, pageSize: params.limit ?? 10 }),
            getProductNameMap(),
        ]);
        const items = res.success && res.data ? res.data.items : [];

        return {
            totalFound: res.data?.total ?? items.length,
            entries: items.map((e) => ({
                refNo: e.refNo,
                productName: prodMap.get(e.productId) || 'Produk',
                quantity: e.quantity,
                unitCost: e.unitCost,
                totalCost: e.quantity * e.unitCost,
                supplier: e.supplier,
                receivedAt: fmtDateTime(e.receivedAt),
            })),
        };
    },

    async getStockAdjustments(params: { search?: string; limit?: number }) {
        const [res, prodMap] = await Promise.all([
            stockAdjustmentRepository.getAll({ search: params.search, pageSize: params.limit ?? 10 }),
            getProductNameMap(),
        ]);
        const items = res.success && res.data ? res.data.items : [];

        return {
            totalFound: res.data?.total ?? items.length,
            adjustments: items.map((a) => ({
                productName: prodMap.get(a.productId) || 'Produk',
                type: a.type,
                quantityChange: a.quantityChange,
                reason: a.reason,
                note: a.note || '-',
                createdAt: fmtDateTime(a.createdAt),
            })),
        };
    },

    async getStockHistory(params: { search: string; limit?: number }) {
        const q = params.search.trim().toLowerCase();
        const products = await db.products.toArray();
        const product = products.find((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));

        if (!product) {
            return {
                found: false,
                message: `Produk dengan kata kunci "${params.search}" tidak ditemukan dalam sistem.`,
            };
        }

        const histories = await db.stockHistories.where('productId').equals(product.id).reverse().sortBy('createdAt');

        const limit = params.limit ?? 10;
        return {
            found: true,
            productName: product.name,
            totalEntries: histories.length,
            history: histories.slice(0, limit).map((h) => ({
                changeType: h.referenceType,
                before: h.before,
                balance: h.balance,
                diff: h.balance - h.before,
                time: fmtDateTime(h.createdAt),
            })),
        };
    },

    async getStaffUsers(params?: { role?: 'ADMIN' | 'CASHIER' }) {
        let users = await db.users.toArray();
        if (params?.role) {
            users = users.filter((u) => u.role === params.role);
        }

        return {
            totalFound: users.length,
            staff: users.map((u) => ({
                id: u.id,
                name: u.name,
                username: u.username,
                role: u.role,
                isActive: u.isActive,
                joinedAt: fmtDate(u.createdAt),
            })),
        };
    },
};
