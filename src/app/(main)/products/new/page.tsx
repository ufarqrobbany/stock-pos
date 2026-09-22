'use client';

import { Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { ProductForm, type ProductFormValues } from '@/features/products/components/productForm';
import {
    createInitialStockBalances,
    createProduct,
    createProductVariants,
    loadCategories,
} from '@/features/products/productData';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void loadCategories().then(setCategories);
    }, []);

    const handleSubmit = async (values: ProductFormValues) => {
        setError('');
        setLoading(true);

        try {
            const createdProduct = await createProduct({
                name: values.name.trim(),
                description: values.description.trim(),
                categoryId: values.categoryId as string,
                image: values.image.trim() || undefined,
                hasVariants: values.hasVariants,
                sku: !values.hasVariants && values.sku ? values.sku.trim() : null,
                sellingPrice:
                    !values.hasVariants && typeof values.sellingPrice === 'number' ? values.sellingPrice : null,
                lowStockThreshold:
                    !values.hasVariants && typeof values.lowStockThreshold === 'number'
                        ? values.lowStockThreshold
                        : null,
                isActive: true,
            });

            if (values.hasVariants) {
                const createVariants = await createProductVariants(
                    values.variants.map((v) => ({
                        productId: createdProduct.id,
                        variantName: v.variantName.trim(),
                        sku: v.sku.trim(),
                        sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : 0,
                        lowStockThreshold: typeof v.lowStockThreshold === 'number' ? v.lowStockThreshold : 10,
                        isActive: v.isActive,
                    }))
                );

                await createInitialStockBalances(
                    createdProduct.id,
                    createVariants.map((v) => v.id)
                );
            } else {
                await createInitialStockBalances(createdProduct.id, [null]);
            }

            router.push('/products');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="md" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div>
                <Title order={2}>Tambah Produk Baru</Title>
                <Text c="neutral.4" size="sm">
                    Lengkapi formulir di bawah ini untuk menambahkan produk ke katalog.
                </Text>
            </div>

            {error && (
                <Text c="red.7" size="sm">
                    {error}
                </Text>
            )}

            <ProductForm
                categories={categories}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Simpan Produk"
                onCancel={() => router.push('/products')}
            />
        </Stack>
    );
}
