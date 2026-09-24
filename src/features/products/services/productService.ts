import { productRepository } from '@/db/repositories/productRepository';
import type { ProductVariant } from '@/db/types/product';
import type { CreateProductInput, CreateProductVariantInput } from '@/features/products/productData';
import { notifyError, notifySuccess } from '@/utils/notifications';

export const productService = {
    async createProductWithVariants(
        productInput: CreateProductInput,
        variantInput: Omit<CreateProductVariantInput, 'productId'>[]
    ): Promise<boolean> {
        const productRes = await productRepository.createProduct(productInput);
        if (!productRes.success || !productRes.data) {
            notifyError({ title: 'Gagal', message: productRes.message });
            return false;
        }

        const productId = productRes.data.id;

        if (productInput.hasVariants && variantInput.length > 0) {
            const formattedVariants = variantInput.map((v) => ({ ...v, productId }));
            const variantRes = await productRepository.createProductVariants(formattedVariants);

            if (variantRes.success && variantRes.data) {
                const variantIds = variantRes.data.map((v) => v.id);
                await productRepository.createInitialStockBalances(productId, variantIds);
            }
        } else {
            await productRepository.createInitialStockBalances(productId, [null]);
        }

        notifySuccess({ title: 'Berhasil', message: 'Berhasil menambahkan produk.' });
        return true;
    },

    async updateProductWithVariants(
        productId: string,
        productInput: CreateProductInput,
        variants: ProductVariant[]
    ): Promise<boolean> {
        const productRes = await productRepository.updateProduct(productId, productInput);
        if (!productRes.success) {
            notifyError({ title: 'Gagal update produk.', message: productRes.message });
            return false;
        }

        if (productInput.hasVariants) {
            const variantRes = await productRepository.updateProductVariants(productId, variants);
            if (!variantRes.success) {
                notifyError({ title: 'Gagal update varian.', message: variantRes.message });
                return false;
            }
        }

        notifySuccess({ title: 'Berhasil', message: 'Data produk berhasil diperbarui.' });
        return true;
    },

    async deleteProduct(productId: string): Promise<boolean> {
        const result = await productRepository.deleteProduct(productId);
        if (!result.success) {
            notifyError({ title: 'Gagal menghapus produk.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Produk berhasil dihapus.', message: result.message });
        return true;
    },

    async updateProductStatus(productId: string, isActive: boolean): Promise<boolean> {
        const result = await productRepository.updateProductStatus(productId, isActive);
        if (!result.success) {
            notifyError({ title: 'Gagal Update Status', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil', message: result.message });
        return true;
    },
};
