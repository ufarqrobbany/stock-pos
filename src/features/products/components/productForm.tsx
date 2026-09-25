'use client';

import { Button, Card, Group, NumberInput, Select, Stack, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { Category } from '@/db/types/product';
import { ProductVariantForm, type VariantFormItem } from '@/features/products/components/productVariantForm';

export interface ProductFormValues {
    name: string;
    description: string;
    categoryId: string | null;
    image: string;
    hasVariants: boolean;
    sku: string;
    sellingPrice: number | string;
    lowStockThreshold: number | string;
    variants: VariantFormItem[];
}

interface ProductFormProps {
    initialValues?: Partial<ProductFormValues>;
    categories: Category[];
    onSubmit: (values: ProductFormValues) => Promise<void>;
    loading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const defaultValues: ProductFormValues = {
    name: '',
    description: '',
    categoryId: null,
    image: '',
    hasVariants: false,
    sku: '',
    sellingPrice: '',
    lowStockThreshold: 10,
    variants: [],
};

export function ProductForm({
    initialValues,
    categories,
    onSubmit,
    loading = false,
    submitLabel = 'Simpan Produk',
    onCancel,
}: ProductFormProps) {
    const form = useForm<ProductFormValues>({
        mode: 'controlled',
        initialValues: defaultValues,
        validate: {
            name: (value) => (value.trim() ? null : 'Nama produk wajib diisi.'),
            categoryId: (value) => (value ? null : 'Kategori produk wajib dipilih.'),
            sellingPrice: (value, values) =>
                !values.hasVariants && (value === '' || value === undefined) ? 'Harga jual wajib diisi.' : null,
            variants: (values, formValues) => {
                if (formValues.hasVariants && values.length === 0) {
                    return 'Tambahkan minimal satu varian produk.';
                }
                return null;
            },
        },
    });

    const { initialize } = form;

    // Reset/isi form nilai awal secara aman ketika initialValues berubah
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            initialize({ ...defaultValues, ...initialValues });
        }
    }, [initialValues, initialize]);

    const handleHasVariantsChange = (checked: boolean) => {
        form.setFieldValue('hasVariants', checked);
        if (checked && form.values.variants.length === 0) {
            form.setFieldValue('variants', [
                {
                    id: crypto.randomUUID(),
                    variantName: '',
                    sku: '',
                    sellingPrice: '',
                    lowStockThreshold: 10,
                    isActive: true,
                },
            ]);
        }
    };

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack gap="lg">
                {/* Informasi Dasar Produk */}
                <Card withBorder p="md">
                    <Stack gap="sm">
                        <TextInput
                            label="Nama Produk"
                            placeholder="Contoh: Kemeja Polos"
                            key={form.key('name')}
                            {...form.getInputProps('name')}
                            required
                        />
                        <Select
                            label="Kategori"
                            placeholder="Pilih kategori"
                            data={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                            }))}
                            searchable
                            key={form.key('categoryId')}
                            {...form.getInputProps('categoryId')}
                            required
                        />
                        <Textarea
                            label="Deskripsi"
                            placeholder="Penjelasan singkat mengenai produk"
                            minRows={3}
                            key={form.key('description')}
                            {...form.getInputProps('description')}
                        />
                        <TextInput
                            label="URL Gambar (Opsional)"
                            placeholder="https://..."
                            key={form.key('image')}
                            {...form.getInputProps('image')}
                        />
                    </Stack>
                </Card>

                {/* Pengaturan Varian */}
                <Card withBorder p="md">
                    <Stack gap="md">
                        <Switch
                            label="Produk ini memiliki varian? (Misal: ukuran, warna)"
                            checked={form.values.hasVariants}
                            onChange={(e) => handleHasVariantsChange(e.currentTarget.checked)}
                        />

                        {form.values.hasVariants ? (
                            <Stack gap="xs">
                                <ProductVariantForm
                                    variants={form.values.variants}
                                    onChange={(v) => form.setFieldValue('variants', v)}
                                />
                                {form.errors.variants && (
                                    <Text size="xs" c="red.7">
                                        {form.errors.variants}
                                    </Text>
                                )}
                            </Stack>
                        ) : (
                            <Stack gap="sm">
                                <TextInput
                                    label="SKU"
                                    placeholder="Kode SKU Produk"
                                    key={form.key('sku')}
                                    {...form.getInputProps('sku')}
                                />
                                <Group grow>
                                    <NumberInput
                                        label="Harga Jual"
                                        placeholder="0"
                                        min={0}
                                        key={form.key('sellingPrice')}
                                        {...form.getInputProps('sellingPrice')}
                                        required
                                    />
                                    <NumberInput
                                        label="Batas Stok Minimum"
                                        placeholder="10"
                                        min={0}
                                        key={form.key('lowStockThreshold')}
                                        {...form.getInputProps('lowStockThreshold')}
                                    />
                                </Group>
                            </Stack>
                        )}
                    </Stack>
                </Card>

                <Group justify="flex-end">
                    {onCancel && (
                        <Button variant="default" type="button" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" loading={loading}>
                        {submitLabel}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
