'use client';

import { Button, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import type { StockAdjustmentType } from '@/db/types/stock';
import type { ProductListItem } from '@/features/products/productData';
import { productService } from '@/features/products/services/productService';

export interface StockOpnameFormValues {
    productId: string | null;
    type: StockAdjustmentType;
    quantityChange: number | string;
    reason: string;
}

interface StockOpnameFormProps {
    onSubmit: (values: StockOpnameFormValues) => Promise<void>;
    loading?: boolean;
    onCancel?: () => void;
}

const defaultValues: StockOpnameFormValues = {
    productId: null,
    type: 'CORRECTION',
    quantityChange: '',
    reason: '',
};

export function StockOpnameForm({ onSubmit, loading = false, onCancel }: StockOpnameFormProps) {
    const [products, setProducts] = useState<ProductListItem[]>([]);

    useEffect(() => {
        productService.loadProducts().then((res) => setProducts(res.items));
    }, []);

    const form = useForm<StockOpnameFormValues>({
        mode: 'controlled',
        initialValues: defaultValues,
        validate: {
            productId: (value) => (value ? null : 'Produk wajib dipilih.'),
            quantityChange: (value) =>
                typeof value === 'number' && value !== 0 ? null : 'Perubahan stok tidak boleh 0.',
            reason: (value) => (value.trim() ? null : 'Alasan / Catatan wajib diisi.'),
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

                <Select
                    label="Tipe Penyesuaian"
                    data={[
                        { value: 'DAMAGED', label: 'RUSAK' },
                        { value: 'LOST', label: 'HILANG' },
                        { value: 'CORRECTION', label: 'SELISIH HITUNG / KOREKSI' },
                        { value: 'OTHER', label: 'LAINNYA' },
                    ]}
                    key={form.key('type')}
                    {...form.getInputProps('type')}
                    required
                />

                <NumberInput
                    label="Jumlah Perubahan Stok"
                    placeholder="Contoh: -5 atau 2"
                    description="Gunakan minus (-) jika stok berkurang"
                    key={form.key('quantityChange')}
                    {...form.getInputProps('quantityChange')}
                    required
                />

                <TextInput
                    label="Alasan / Catatan"
                    placeholder="Contoh: Kemasan rusak / Hilang saat display toko"
                    key={form.key('reason')}
                    {...form.getInputProps('reason')}
                    required
                />

                <Group justify="flex-end" mt="md">
                    {onCancel && (
                        <Button type="button" variant="default" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" loading={loading} color="orange">
                        Simpan Stock Opname
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
