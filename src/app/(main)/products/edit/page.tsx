'use client';

import { Stack, Text, Title } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { ProductForm, type ProductFormValues } from '@/features/products/components/productForm';
import {
    loadCategories,
    loadProductById,
    loadVariantByProductId,
    updateProduct,
    updateProductVariants,
} from '@/features/products/productData';

export default function EditProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');

    const [categories, setCategories] = useState<Category[]>([]);
    const [initialValues, setInitialValues] = useState<Partial<ProductFormValues>>({});
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function initData() {
            setError('');
            if (!productId) {
                setError('ID produk tidak ditemukan di URL.');
                setFetching(false);
                return;
            }

            try {
                setFetching(true);
                const [fetchedCategories, product] = await Promise.all([loadCategories(), loadProductById(productId)]);

                setCategories(fetchedCategories);

                if (!product) {
                    setError('Produk tidak ditemukan');
                    return;
                }

                let loadedVariants: ProductFormValues['variants'] = [];
                if (product.hasVariants) {
                    const existingVariants = await loadVariantByProductId(productId);
                    loadedVariants = existingVariants.map((v) => ({
                        id: v.id,
                        variantName: v.variantName,
                        sku: v.sku,
                        sellingPrice: v.sellingPrice,
                        lowStockThreshold: v.lowStockThreshold,
                        isActive: v.isActive,
                    }));
                }

                setInitialValues({
                    name: product.name,
                    description: product.description ?? '',
                    categoryId: product.categoryId,
                    image: product.image ?? '',
                    hasVariants: product.hasVariants,
                    sku: product.sku ?? '',
                    sellingPrice: product.sellingPrice ?? '',
                    lowStockThreshold: product.lowStockThreshold ?? 10,
                    variants: loadedVariants,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat data produk.');
            } finally {
                setFetching(false);
            }
        }

        void initData();
    }, [productId]);

    const handleSubmit = async (values: ProductFormValues) => {
        if (!productId) return setError('ID produk tidak valid.');
        setError('');
        setLoading(true);

        try {
            await updateProduct(productId, {
                name: values.name.trim(),
                description: values.description.trim() || undefined,
                categoryId: values.categoryId as string,
                image: values.image.trim() || undefined,
                hasVariants: values.hasVariants,
                isActive: true,
                sku: !values.hasVariants && values.sku ? values.sku.trim() : null,
                sellingPrice:
                    !values.hasVariants && typeof values.sellingPrice === 'number' ? values.sellingPrice : null,
                lowStockThreshold:
                    !values.hasVariants && typeof values.lowStockThreshold === 'number'
                        ? values.lowStockThreshold
                        : null,
            });

            if (values.hasVariants) {
                await updateProductVariants(
                    productId,
                    values.variants.map((v) => ({
                        id: v.id,
                        productId,
                        variantName: v.variantName.trim(),
                        sku: v.sku.trim(),
                        sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : 0,
                        lowStockThreshold: typeof v.lowStockThreshold === 'number' ? v.lowStockThreshold : 10,
                        isActive: v.isActive,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }))
                );
            }

            router.push('/products');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Text size="sm">Memuat data produk...</Text>;

    return (
        <Stack gap="md" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div>
                <Title order={2}>Edit Produk</Title>
                <Text c="neutral.4" size="sm">
                    Ubah detail informasi produk.
                </Text>
            </div>

            {error && (
                <Text c="red.7" size="sm">
                    {error}
                </Text>
            )}

            <ProductForm
                initialValues={initialValues}
                categories={categories}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Simpan Perubahan"
                onCancel={() => router.push('/products')}
            />
        </Stack>
    );
}
