'use client';

import { Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import type { ProductListItem } from '@/features/products/productData';
import { productService } from '@/features/products/services/productService';

export interface StockInFormValues {
    productId: string | null;
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
            quantity: (value) => (typeof value === 'number' && value > 0 ? null : 'Jumlah wajib diisi, minimal 1.'),
            unitCost: (value) => (typeof value === 'number' && value >= 0 ? null : 'Harga beli wajib diisi.'),
            supplier: (value) => (value.trim() ? null : 'Nama supplier wajib diisi.'),
        },
    });

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                <Select
                    label="Produk"
                    placeholder="Pilih produk"
                    data={products.map((p) => ({ value: p.id, label: p.name }))}
                    searchable
                    key={form.key('productId')}
                    {...form.getInputProps('productId')}
                    required
                />

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
