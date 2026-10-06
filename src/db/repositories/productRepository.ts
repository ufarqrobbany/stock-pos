import { db } from '@/db';
import type { Category, Product, ProductVariant } from '@/db/types/product';
import type { StockBalance } from '@/db/types/stock';
import type {
    CreateProductInput,
    CreateProductVariantInput,
    ProductListItem,
    ProductListResult,
    ProductQuery,
} from '@/features/products/types';
import type { Result } from '@/types/common';

function mapProductToListItem(
    product: Product,
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

export const productRepository = {
    async loadProducts(query: ProductQuery = {}): Promise<Result<ProductListResult>> {
        const [products, categories, variants, stockBalances] = await Promise.all([
            db.products.toArray(),
            db.categories.toArray(),
            db.productVariants.toArray(),
            db.stockBalances.toArray(),
        ]);

        let result = products.map((product) => mapProductToListItem(product, categories, variants, stockBalances));

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

        if (query.categoryId) {
            result = result.filter((product) => product.categoryId === query.categoryId);
        }

        const sortBy = query.sortBy;
        if (sortBy) {
            const direction = query.sortDirection ?? 'asc';
            result.sort((first, second) => compareValues(first[sortBy], second[sortBy], direction));
        }

        const total = result.length;
        const page = query.page && query.page > 0 ? query.page : 1;
        const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 10;
        const totalPages = Math.ceil(total / pageSize) || 1;

        const startIndex = (page - 1) * pageSize;
        const items = result.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            data: {
                items,
                total,
                page,
                pageSize,
                totalPages,
            },
        };
    },

    async createProduct(input: CreateProductInput): Promise<Result<Product>> {
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

        return {
            success: true,
            data: product,
            message: 'Berhasil menambahkan produk',
        };
    },

    async updateProduct(id: string, input: Partial<CreateProductInput>): Promise<Result<void>> {
        await db.products.update(id, {
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
        return { success: true, data: null, message: 'Berhasil memperbarui produk' };
    },

    async loadProductById(id: string): Promise<Result<Product | undefined>> {
        const product = await db.products.get(id);
        return { success: true, data: product || null };
    },

    async updateProductStatus(id: string, isActive: boolean): Promise<Result<void>> {
        await db.products.update(id, { isActive, updatedAt: new Date().toISOString() });
        return { success: true, data: null, message: 'Status produk berhasil diperbarui' };
    },

    async deleteProduct(productId: string): Promise<Result<void>> {
        const [stockEntryCount, adjustmentCount, historyCount, salesItemCount] = await Promise.all([
            db.stockEntries.where('productId').equals(productId).count(),
            db.stockAdjustments.where('productId').equals(productId).count(),
            db.stockHistories.where('productId').equals(productId).count(),
            db.salesTransactionItems.where('productId').equals(productId).count(),
        ]);

        if (stockEntryCount || adjustmentCount || historyCount || salesItemCount) {
            return {
                success: false,
                data: null,
                message: 'Produk tidak dapat dihapus karena sudah digunakan dalam stok atau transaksi.',
            };
        }

        await db.transaction('rw', [db.products, db.productVariants, db.stockBalances], async () => {
            await db.productVariants.where('productId').equals(productId).delete();
            await db.stockBalances.where('productId').equals(productId).delete();
            await db.products.delete(productId);
        });

        return { success: true, data: null, message: 'Produk berhasil di hapus.' };
    },

    async createProductVariants(inputs: CreateProductVariantInput[]): Promise<Result<ProductVariant[]>> {
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
        return { success: true, data: variants };
    },

    async createInitialStockBalances(
        productId: string,
        variantIds: (string | null)[]
    ): Promise<Result<StockBalance[]>> {
        const now = new Date().toISOString();
        const balances: StockBalance[] = variantIds.map((variantId) => ({
            id: crypto.randomUUID(),
            productId,
            variantId,
            quantity: 0,
            updatedAt: now,
        }));

        await db.stockBalances.bulkAdd(balances);
        return { success: true, data: balances };
    },

    async loadVariantByProductId(productId: string): Promise<Result<ProductVariant[]>> {
        const variants = await db.productVariants.where('productId').equals(productId).toArray();
        return { success: true, data: variants };
    },

    async updateProductVariants(productId: string, variants: ProductVariant[]): Promise<Result<void>> {
        const existingRes = await this.loadVariantByProductId(productId);
        const existingVariants = existingRes.data || [];

        const existingIds = new Set(existingVariants.map((v) => v.id));
        const formIds = new Set(variants.map((v) => v.id));

        const idsToDelete = existingVariants.filter((v) => !formIds.has(v.id)).map((v) => v.id);

        await db.transaction('rw', [db.productVariants, db.stockBalances], async () => {
            if (idsToDelete.length > 0) {
                await db.productVariants.bulkDelete(idsToDelete);
                await db.stockBalances.where('variantId').anyOf(idsToDelete).delete();
            }

            for (const item of variants) {
                const isExisting = existingIds.has(item.id);

                if (isExisting) {
                    await db.productVariants.update(item.id, {
                        variantName: item.variantName,
                        sku: item.sku,
                        sellingPrice: typeof item.sellingPrice === 'number' ? item.sellingPrice : 0,
                        lowStockThreshold: typeof item.lowStockThreshold === 'number' ? item.lowStockThreshold : 10,
                        isActive: item.isActive,
                        updatedAt: new Date().toISOString(),
                    });
                } else {
                    const createdVariantId = await db.productVariants.add({
                        id: item.id || crypto.randomUUID(),
                        productId,
                        variantName: item.variantName,
                        sku: item.sku,
                        sellingPrice: typeof item.sellingPrice === 'number' ? item.sellingPrice : 0,
                        lowStockThreshold: typeof item.lowStockThreshold === 'number' ? item.lowStockThreshold : 10,
                        isActive: item.isActive,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });

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

        return { success: true, data: null, message: 'Varian product berhasil diperbarui.' };
    },
};
