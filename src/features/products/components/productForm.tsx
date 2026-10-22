'use client';

import {
    ActionIcon,
    Button,
    Card,
    Group,
    Image,
    Input,
    LoadingOverlay,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import { ProductVariantForm, type VariantFormItem } from '@/features/products/components/productVariantForm';
import { generateSku } from '../utils/skuUtils';

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
    const [uploading, setUploading] = useState(false);

    const form = useForm<ProductFormValues>({
        mode: 'controlled',
        initialValues: defaultValues,
        validate: {
            name: (value) => (value.trim() ? null : 'Nama produk wajib diisi.'),
            categoryId: (value) => (value ? null : 'Kategori produk wajib dipilih.'),
            sellingPrice: (value, values) =>
                !values.hasVariants && (value === '' || value === undefined) ? 'Harga jual wajib diisi.' : null,
            sku: (value, values) => (!values.hasVariants && !value?.trim() ? 'SKU produk wajib diisi.' : null),
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

    const deleteOldImage = async (imageUrl: string) => {
        if (!imageUrl) return;
        try {
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
        } catch (err) {
            console.error('Gagal menghapus gambar lama:', err);
        }
    };

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;

        const oldImage = form.values.image;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();

                // 1. Hapus gambar lama dari server/folder public jika ada
                if (oldImage && oldImage !== data.url) {
                    await deleteOldImage(oldImage);
                }

                // 2. Set gambar baru ke form
                form.setFieldValue('image', data.url);
            }
        } catch (error) {
            console.error('Gagal mengunggah file:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        const currentImage = form.values.image;

        // Hapus file fisik di folder public
        if (currentImage) {
            await deleteOldImage(currentImage);
        }

        // Reset nilai di form
        form.setFieldValue('image', '');
    };

    const handleFormSubmit = (values: ProductFormValues) => {
        let finalValues = { ...values };
        if (!finalValues.hasVariants && !finalValues.sku?.trim()) {
            finalValues = {
                ...finalValues,
                sku: generateSku(finalValues.name),
            };
        }
        return onSubmit(finalValues);
    };

    return (
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
            <Stack gap="lg">
                {/* Informasi Dasar Produk */}
                <Card withBorder p="md" pos="relative">
                    <LoadingOverlay visible={uploading} overlayProps={{ blur: 1 }} />
                    <Stack gap="sm">
                        <TextInput
                            label="Nama Produk"
                            placeholder="Contoh: Kemeja Polos"
                            key={form.key('name')}
                            {...form.getInputProps('name')}
                            onBlur={(e) => {
                                form.getInputProps('name').onBlur?.(e);
                                if (
                                    !form.values.hasVariants &&
                                    !form.values.sku.trim() &&
                                    e.currentTarget.value.trim()
                                ) {
                                    form.setFieldValue('sku', generateSku(e.currentTarget.value));
                                }
                            }}
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

                        {/* Input Foto Native HTML + Teks Keterangan & Preview */}
                        <Stack gap={4}>
                            <Input.Wrapper label="Foto Produk (Opsional)">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        void handleFileUpload(file);
                                    }}
                                    style={{ display: 'block', marginTop: '4px' }}
                                />
                            </Input.Wrapper>
                            <Text size="xs" c="dimmed">
                                Format: JPG, JPEG, PNG, WEBP, Ukuran Max. 3 MB
                            </Text>

                            {/* Indicator / Preview foto yang sedang di-assign */}
                            {form.values.image && (
                                <Group
                                    justify="space-between"
                                    align="center"
                                    mt="xs"
                                    p="xs"
                                    bg="var(--mantine-color-gray-0)"
                                    style={{ borderRadius: '6px' }}
                                >
                                    <Group gap="xs">
                                        <Image src={form.values.image} alt="Preview Produk" w={40} h={40} radius="sm" />
                                        <Stack gap={0}>
                                            <Text size="xs" fw={600} c="green.7">
                                                Foto Terpasang
                                            </Text>
                                            <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                                                {form.values.image}
                                            </Text>
                                        </Stack>
                                    </Group>

                                    {/* Tombol Hapus Foto */}
                                    <Tooltip label="Hapus Foto">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            size="sm"
                                            type="button"
                                            aria-label="Hapus Foto Produk"
                                            onClick={handleRemoveImage}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            )}
                        </Stack>
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
                                    placeholder="Contoh: KEME-8F2A"
                                    key={form.key('sku')}
                                    {...form.getInputProps('sku')}
                                    required={!form.values.hasVariants}
                                    rightSection={
                                        <Button
                                            variant="subtle"
                                            size="compact-xs"
                                            type="button"
                                            onClick={() => {
                                                form.setFieldValue('sku', generateSku(form.values.name));
                                            }}
                                        >
                                            Otomatis
                                        </Button>
                                    }
                                    rightSectionWidth={75}
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
