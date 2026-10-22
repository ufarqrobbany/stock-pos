import { tool } from 'ai';
import { z } from 'zod';

export const chatbotTools = {
    getProducts: tool({
        description:
            'Mencari dan melihat daftar produk dalam inventaris toko. Bisa memfilter berdasarkan kata kunci nama/SKU atau kategori.',
        inputSchema: z.object({
            search: z.string().optional().describe('Kata kunci pencarian nama barang atau kode SKU'),
            categoryId: z.string().optional().describe('ID kategori produk jika ingin memfilter kategori tertentu'),
            limit: z.number().optional().describe('Jumlah maksimal data produk yang diambil (default: 10)'),
        }),
    }),

    getProductDetail: tool({
        description:
            'Melihat informasi lengkap satu produk tertentu termasuk daftar varian lengkap, harga per varian, dan stok masing-masing.',
        inputSchema: z.object({
            search: z.string().describe('Nama produk, ID produk, atau kode SKU yang ingin dilihat rinciannya'),
        }),
    }),

    getLowStockProducts: tool({
        description:
            'Melihat daftar produk atau varian yang stoknya menipis (di bawah batas minimum) atau sudah habis (stok 0).',
        inputSchema: z.object({
            limit: z.number().optional().describe('Batas jumlah produk stok menipis yang ditampilkan (default: 10)'),
        }),
    }),

    getSalesMetrics: tool({
        description:
            'Mendapatkan metrik ringkasan penjualan toko (omzet penjualan Rp, total transaksi kasir, dan unit barang terjual) untuk periode hari ini, kemarin, minggu ini, bulan ini, atau perbandingan langsung hari ini vs kemarin.',
        inputSchema: z.object({
            period: z
                .enum(['today', 'yesterday', 'week', 'month', 'comparison'])
                .optional()
                .describe(
                    'Periode data: today (hari ini), yesterday (kemarin), week (minggu ini), month (bulan ini), atau comparison (perbandingan hari ini vs kemarin)'
                ),
        }),
    }),

    getRecentTransactions: tool({
        description:
            'Melihat daftar transaksi penjualan kasir terbaru yang masuk di toko beserta waktu, kasir, dan total nominal.',
        inputSchema: z.object({
            limit: z.number().optional().describe('Batas jumlah transaksi terbaru yang ditampilkan (default: 5)'),
        }),
    }),

    getTransactionDetail: tool({
        description:
            'Melihat rincian struk belanja dari suatu transaksi tertentu, termasuk semua item barang yang dibeli, kuantitas, harga satuan, dan metode pembayaran.',
        inputSchema: z.object({
            transactionNumberOrId: z.string().describe('Nomor transaksi (contoh: TRX-...) atau ID transaksi unik'),
        }),
    }),

    getCategories: tool({
        description:
            'Melihat seluruh daftar kategori produk yang terdaftar di toko beserta jumlah produk di setiap kategori.',
        inputSchema: z.object({}),
    }),

    getCustomers: tool({
        description: 'Mencari atau melihat daftar data pelanggan toko yang terdaftar.',
        inputSchema: z.object({
            search: z.string().optional().describe('Nama atau nomor telepon pelanggan yang dicari'),
            limit: z.number().optional().describe('Batas jumlah data pelanggan (default: 5)'),
        }),
    }),

    getPeakSalesAnalytics: tool({
        description:
            'Menganalisis rekor penjualan tertinggi toko: mencari hari/tanggal dengan total omzet tertinggi, transaksi tunggal tertinggi, dan produk apa saja yang dibeli/terlaris pada hari puncak tersebut.',
        inputSchema: z.object({}),
    }),

    getTopProducts: tool({
        description:
            'Melihat daftar produk terlaris (paling banyak terjual / best seller) dan kontribusi omzetnya berdasarkan periode waktu (today, week, month, all).',
        inputSchema: z.object({
            period: z
                .enum(['today', 'week', 'month', 'all'])
                .optional()
                .describe('Periode data produk terlaris (default: all)'),
            limit: z.number().optional().describe('Batas jumlah produk terlaris yang ditampilkan (default: 5)'),
        }),
    }),

    getStockEntries: tool({
        description:
            'Melihat riwayat pencatatan barang masuk (Stock In / Restock) dari supplier beserta kuantitas, harga modal unit, supplier, dan waktu kedatangan barang.',
        inputSchema: z.object({
            search: z.string().optional().describe('Kata kunci pencarian nama produk atau supplier'),
            limit: z.number().optional().describe('Batas data stok masuk yang ditampilkan (default: 10)'),
        }),
    }),

    getStockAdjustments: tool({
        description:
            'Melihat riwayat penyesuaian stok atau stock opname (pencatatan barang rusak, kadaluarsa, hilang, atau selisih stok fisik).',
        inputSchema: z.object({
            search: z.string().optional().describe('Kata kunci pencarian nama produk atau alasan penyesuaian'),
            limit: z.number().optional().describe('Batas data penyesuaian stok yang ditampilkan (default: 10)'),
        }),
    }),

    getStockHistory: tool({
        description:
            'Melihat kartu stok dan jejak audit mutasi pergerakan stok untuk produk tertentu (apakah berkurang karena penjualan POS, bertambah karena restock, atau dikoreksi opname).',
        inputSchema: z.object({
            search: z.string().describe('Nama produk, ID produk, atau kode SKU untuk melacak kartu mutasi stoknya'),
            limit: z.number().optional().describe('Batas riwayat mutasi yang ditampilkan (default: 10)'),
        }),
    }),

    getStaffUsers: tool({
        description: 'Melihat daftar kasir atau staf toko yang terdaftar beserta perannya (ADMIN atau CASHIER).',
        inputSchema: z.object({
            role: z.enum(['ADMIN', 'CASHIER']).optional().describe('Filter peran pengguna'),
        }),
    }),
};
