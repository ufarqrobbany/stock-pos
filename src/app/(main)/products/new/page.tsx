'use client';

import { Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { ProductForm, type ProductFormValues } from '@/features/products/components/productForm';
import { categoryService } from '@/features/products/services/categoryService';
import { productService } from '@/features/products/services/productService';
import { generateSku } from '@/features/products/utils/skuUtils';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void categoryService.loadCategories().then(setCategories);
    }, []);

    const handleSubmit = async (values: ProductFormValues) => {
        setError('');
        setLoading(true);

        const success = await productService.createProductWithVariants(
            {
                name: values.name.trim(),
                description: values.description.trim(),
                categoryId: values.categoryId as string,
                image: values.image.trim() || undefined,
                hasVariants: values.hasVariants,
                sku: !values.hasVariants ? values.sku?.trim() || generateSku(values.name) : null,
                sellingPrice:
                    !values.hasVariants && typeof values.sellingPrice === 'number' ? values.sellingPrice : null,
                lowStockThreshold:
                    !values.hasVariants && typeof values.lowStockThreshold === 'number'
                        ? values.lowStockThreshold
                        : null,
                isActive: true,
            },
            values.hasVariants
                ? values.variants.map((v) => ({
                      variantName: v.variantName.trim(),
                      sku: v.sku.trim(),
                      sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : 0,
                      lowStockThreshold: typeof v.lowStockThreshold === 'number' ? v.lowStockThreshold : 10,
                      isActive: v.isActive,
                  }))
                : []
        );

        setLoading(false);
        if (success) {
            router.push('/products');
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
