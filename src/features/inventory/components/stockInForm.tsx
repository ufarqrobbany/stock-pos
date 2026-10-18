'use client';

import { Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { productService } from '@/features/products/services/productService';
import type { ProductListItem, ProductListVariant } from '@/features/products/types';

export interface StockInFormValues {
    productId: string | null;
    variantId: string | null;
    quantity: number | string;
    unitCost: number | string;
    supplier: string;
    source: string;
    receivedAt: string;
}

interface StockInFormProps {
    onSubmit: (values: StockInFormValues) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
}

const defaultValues: StockInFormValues = {
    productId: null,
    variantId: null,
    quantity: '',
    unitCost: '',
    supplier: '',
    source: 'PURCHASE',
    receivedAt: new Date().toISOString().slice(0, 10),
};

export function StockInForm({ onSubmit, loading = false, onCancel }: StockInFormProps) {
    const [products, setProducts] = useState<ProductListItem[]>([]);

    useEffect(() => {
        productService.loadProducts().then((res) => setProducts(res.items));
    }, []);

    const form = useForm<StockInFormValues>({
        mode: 'controlled',
        initialValues: defaultValues,
        validate: {
            productId: (value) => (value ? null : 'Produk wajib dipilih.'),
            variantId: (value, values) => {
                const selectedProduct = products.find((p) => p.id === values.productId);
                const hasVariants = (selectedProduct?.variants?.length ?? 0) > 0;
                if (hasVariants && !value) {
                    return 'Varian wajib dipilih untuk produk ini.';
                }
                return null;
            },
            quantity: (value) => (typeof value === 'number' && value > 0 ? null : 'Jumlah wajib diisi, minimal 1.'),
            unitCost: (value) => (typeof value === 'number' && value >= 0 ? null : 'Harga beli wajib diisi.'),
            supplier: (value) => (value.trim() ? null : 'Nama supplier wajib diisi.'),
        },
    });

    const selectedProduct = products.find((p) => p.id === form.values.productId);
    const variants = selectedProduct?.variants ?? [];
    const hasVariants = variants.length > 0;

    const handleProductChange = (productId: string | null) => {
        form.setFieldValue('productId', productId);
        form.setFieldValue('variantId', null); // reset pilihan varian tiap ganti produk
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                <Select
                    label="Produk"
                    placeholder="Pilih produk"
                    data={products.map((p) => ({ value: p.id, label: p.name }))}
                    searchable
                    value={form.values.productId}
                    onChange={handleProductChange}
                    error={form.errors.productId}
                    required
                />

                {hasVariants && (
                    <Select
                        label="Varian"
                        placeholder="Pilih varian"
                        data={variants.map((v: ProductListVariant) => ({
                            value: v.id,
                            label: `${v.name} · ${v.sku}`,
                        }))}
                        searchable
                        key={form.key('variantId')}
                        {...form.getInputProps('variantId')}
                        required
                    />
                )}

                <Group grow>
                    <NumberInput
                        label="Jumlah"
                        placeholder="0"
                        min={1}
                        key={form.key('quantity')}
                        {...form.getInputProps('quantity')}
                        required
                    />
                    <NumberInput
                        label="Harga Beli / Unit"
                        placeholder="0"
                        min={0}
                        key={form.key('unitCost')}
                        {...form.getInputProps('unitCost')}
                        required
                    />
                </Group>

                <TextInput
                    label="Supplier"
                    placeholder="PT ..."
                    key={form.key('supplier')}
                    {...form.getInputProps('supplier')}
                    required
                />

                <TextInput
                    label="Tanggal Masuk"
                    type="date"
                    key={form.key('receivedAt')}
                    {...form.getInputProps('receivedAt')}
                    required
                />

                <Group justify="flex-end">
                    {onCancel && (
                        <Button type="button" variant="default" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" loading={loading}>
                        Simpan Stok Masuk
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
