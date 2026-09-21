import { db } from '@/db';
import type { Category, Product as DbProduct, Product, ProductVariant } from '@/db/types/product';
import type { StockBalance } from '@/db/types/stock';

// Daftar field yang boleh dipakai untuk sorting produk.
// Dipakai sebagai single source of truth untuk tipe dan validasi runtime.
export const PRODUCT_SORT_FIELDS = ['name', 'categoryName', 'skuCount', 'price', 'stock'] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

// Parameter query yang dikirim dari halaman ke data layer.
export interface ProductQuery {
    search?: string;
    categoryId?: string | null;
    sortBy?: ProductSortField;
    sortDirection?: 'asc' | 'desc';
}

// Model khusus untuk kebutuhan tabel katalog produk.
// Model ini menyatukan data dari products, categories, productVariants, dan stockBalances.
export interface ProductListItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    categoryId: string;
    categoryName: string;
    skuCount: number;
    price: number | null;
    stock: number;
    isActive: boolean;
    variants: ProductListVariant[];
}

export interface ProductListVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
}

export interface ProductListResult {
    data: ProductListItem[];
    total: number;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    categoryId: string;
    image?: string;
    hasVariants: boolean;
    sku?: string | null;
    sellingPrice?: number | null;
    lowStockThreshold?: number | null;
    isActive: boolean;
}

export interface CreateProductVariantInput {
    productId: string;
    variantName: string;
    sku: string;
    sellingPrice: number;
    lowStockThreshold: number;
    isActive: boolean;
}

export async function loadCategories(): Promise<Category[]> {
    return db.categories.toArray();
}

export async function createCategory(name: string, parentId: string | null): Promise<string> {
    const newId = crypto.randomUUID();
    await db.categories.add({
        id: newId,
        name: name.trim(),
        parentId: parentId || null,
    });
    return newId;
}

export async function updateCategory(
    id: string,
    name: string,
    parentId: string | null = null
): Promise<void> {
    await db.categories.update(id, {
        name: name.trim(),
        parentId: parentId || null,
    });
}

export async function deleteCategory(
    category: Category,
    allCategories: Category[]
): Promise<{ success: boolean; message?: string }> {
    const productCount = await db.products.where('categoryId').equals(category.id).count();
    if (productCount > 0) {
        return {
            success: false,
            message: 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.',
        };
    }

    const childCount = allCategories.filter((item) => item.parentId === category.id).length;
    if (childCount > 0) {
        return {
            success: false,
            message: 'Kategori tidak dapat dihapus karena memiliki subkategori.',
        };
    }

    await db.categories.delete(category.id);
    return { success: true };
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
    const now = new Date().toISOString();

    const product: Product = {
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        image: input.image || undefined,
        hasVariants: input.hasVariants,
        sku: input.sku,
        sellingPrice: input.sellingPrice,
        lowStockThreshold: input.lowStockThreshold,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
    };

    await db.products.add(product);

    return product;
}

export async function createProductVariants(
    inputs: CreateProductVariantInput[]
): Promise<ProductVariant[]> {
    const now = new Date().toISOString();

    const variants: ProductVariant[] = inputs.map((input) => ({
        id: crypto.randomUUID(),
        productId: input.productId,
        sku: input.sku,
        variantName: input.variantName,
        sellingPrice: input.sellingPrice,
        lowStockThreshold: input.lowStockThreshold,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now,
    }));

    await db.productVariants.bulkAdd(variants);

    return variants;
}

export async function createInitialStockBalances(
    productId: string,
    variantIds: (string | null)[]
): Promise<StockBalance[]> {
    const now = new Date().toISOString();

    const balances: StockBalance[] = variantIds.map((variantId) => ({
        id: crypto.randomUUID(),
        productId,
        variantId,
        quantity: 0,
        updatedAt: now,
    }));

    // Setiap produk atau varian mulai dengan saldo stok nol.
    await db.stockBalances.bulkAdd(balances);

    return balances;
}

export async function updateProductStatus(productId: string, isActive: boolean): Promise<void> {
    await db.products.update(productId, { isActive, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(productId: string): Promise<void> {
    // Produk yang sudah masuk proses stok atau transaksi tidak boleh dihapus, agar histori dan laporan tetap konsisten.
    const [stockEntryCount, adjustmentCount, historyCount, salesItemCount] = await Promise.all([
        db.stockEntries.where('productId').equals(productId).count(),
        db.stockAdjustments.where('productId').equals(productId).count(),
        db.stockHistories.where('productId').equals(productId).count(),
        db.salesTransactionItems.where('productId').equals(productId).count(),
    ]);

    if (stockEntryCount || adjustmentCount || historyCount || salesItemCount) {
        throw new Error(
            'Produk tidak dapat dihapus karena sudah digunakan dalam stok atau transaksi.'
        );
    }

    // Saldo awal dan varian ikut dibersihkan karena keduanya bergantung pada produk.
    await db.transaction('rw', [db.products, db.productVariants, db.stockBalances], async () => {
        await db.productVariants.where('productId').equals(productId).delete();
        await db.stockBalances.where('productId').equals(productId).delete();
        await db.products.delete(productId);
    });
}

export async function loadProductById(productId: string): Promise<Product | undefined> {
    return db.products.get(productId);
}

export async function loadVariantByProductId(productId: string): Promise<ProductVariant[]> {
    return db.productVariants.where('productId').equals(productId).toArray();
}

export async function updateProduct(productId: string, input: CreateProductInput): Promise<void> {
    await db.products.update(productId, {
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        image: input.image || undefined,
        hasVariants: input.hasVariants,
        sku: input.sku,
        sellingPrice: input.sellingPrice,
        lowStockThreshold: input.lowStockThreshold,
        isActive: input.isActive,
        updatedAt: new Date().toISOString(),
    });
}

export async function updateProductVariants(
    productId: string,
    variants: ProductVariant[]
): Promise<void> {
    const existingVariants = await loadVariantByProductId(productId);
    const existingIds = new Set(existingVariants.map((v) => v.id));
    const formIds = new Set(variants.map((v) => v.id));

    // Cari varian lama yang dihapus dari form UI
    const idsToDelete = existingVariants.filter((v) => !formIds.has(v.id)).map((v) => v.id);

    await db.transaction('rw', [db.productVariants, db.stockBalances], async () => {
        // Hapus varian dan stock balance-nya jika ada yang dibuang oleh user
        if (idsToDelete.length > 0) {
            await db.productVariants.bulkDelete(idsToDelete);
            await db.stockBalances.where('variantId').anyOf(idsToDelete).delete();
        }

        for (const item of variants) {
            const isExisting = existingIds.has(item.id);

            if (isExisting) {
                // Update varian yang sudah ada
                await db.productVariants.update(item.id, {
                    variantName: item.variantName,
                    sku: item.sku,
                    sellingPrice: typeof item.sellingPrice === 'number' ? item.sellingPrice : 0,
                    lowStockThreshold:
                        typeof item.lowStockThreshold === 'number' ? item.lowStockThreshold : 10,
                    isActive: item.isActive,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                // Insert varian baru yang ditambahkan di form edit
                const createdVariantId = await db.productVariants.add({
                    id: item.id || crypto.randomUUID(),
                    productId,
                    variantName: item.variantName,
                    sku: item.sku,
                    sellingPrice: typeof item.sellingPrice === 'number' ? item.sellingPrice : 0,
                    lowStockThreshold:
                        typeof item.lowStockThreshold === 'number' ? item.lowStockThreshold : 10,
                    isActive: item.isActive,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });

                // Buat saldo awal stok (0) untuk varian baru
                await db.stockBalances.add({
                    id: crypto.randomUUID(),
                    productId,
                    variantId: createdVariantId,
                    quantity: 0,
                    updatedAt: new Date().toISOString(),
                });
            }
        }
    });
}

function mapProductToListItem(
    product: DbProduct,
    categories: Category[],
    variants: ProductVariant[],
    stockBalances: StockBalance[]
): ProductListItem {
    const category = categories.find((item) => item.id === product.categoryId);
    const productVariants = variants.filter((variant) => variant.productId === product.id);
    const productStock = stockBalances
        .filter((balance) => balance.productId === product.id)
        .reduce((total, balance) => total + balance.quantity, 0);
    const variantPrices = productVariants.map((variant) => variant.sellingPrice);
    const productVariantItems = productVariants.map((variant) => ({
        id: variant.id,
        name: variant.variantName,
        sku: variant.sku,
        price: variant.sellingPrice,
        stock: stockBalances
            .filter((balance) => balance.variantId === variant.id)
            .reduce((total, balance) => total + balance.quantity, 0),
    }));

    return {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        imageUrl: product.image ?? null,
        categoryId: product.categoryId,
        categoryName: category?.name ?? 'Tanpa kategori',
        skuCount: product.hasVariants ? productVariants.length : product.sku ? 1 : 0,
        price: product.hasVariants
            ? variantPrices.length
                ? Math.min(...variantPrices)
                : null
            : (product.sellingPrice ?? null),
        stock: productStock,
        isActive: product.isActive,
        variants: productVariantItems,
    };
}

function compareValues(
    first: string | number | null,
    second: string | number | null,
    direction: 'asc' | 'desc'
): number {
    const multiplier = direction === 'desc' ? -1 : 1;

    if (first === second) return 0;
    if (first === null) return -1 * multiplier;
    if (second === null) return 1 * multiplier;

    if (typeof first === 'string' && typeof second === 'string') {
        return first.localeCompare(second, 'id') * multiplier;
    }

    return (first > second ? 1 : -1) * multiplier;
}

export async function loadProducts(query: ProductQuery = {}): Promise<ProductListResult> {
    // Semua tabel yang dibutuhkan dibaca bersamaan dari IndexedDB.
    const [products, categories, variants, stockBalances] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
        db.productVariants.toArray(),
        db.stockBalances.toArray(),
    ]);

    let result = products.map((product) =>
        mapProductToListItem(product, categories, variants, stockBalances)
    );

    // Search berdasarkan nama, deskripsi, kategori, dan SKU.
    const search = query.search?.trim().toLowerCase();
    if (search) {
        const productIdsBySku = new Set(
            variants
                .filter((variant) => variant.sku.toLowerCase().includes(search))
                .map((variant) => variant.productId)
        );

        result = result.filter(
            (product) =>
                product.name.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search) ||
                product.categoryName.toLowerCase().includes(search) ||
                productIdsBySku.has(product.id)
        );
    }

    // Filter kategori memakai categoryId dari schema database.
    if (query.categoryId) {
        result = result.filter((product) => product.categoryId === query.categoryId);
    }

    // Sorting tetap dilakukan di data layer agar tabel global dapat dipakai ulang.
    const sortBy = query.sortBy;
    if (sortBy) {
        const direction = query.sortDirection ?? 'asc';
        result.sort((first, second) => compareValues(first[sortBy], second[sortBy], direction));
    }

    return {
        data: result,
        total: result.length,
    };
}
