import { db } from '@/db';
import type { CreateProductInput, CreateProductVariantInput } from '@/features/products/productData';
// import { loadProducts } from '@/features/products/productData';
import type { Result } from '@/types/common';
import type { Product, ProductVariant } from '../types/product';
import type { StockBalance } from '../types/stock';

export const productRepository = {
    // operasi PRODUCT
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

    // operasi VARIAN
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
