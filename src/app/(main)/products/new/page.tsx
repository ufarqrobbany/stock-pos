'use client';

import {
    Button,
    Card,
    Group,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/db/types/product';
import {
    ProductVariantForm,
    type VariantFormItem,
} from '@/features/products/components/productVariantForm';
import {
    createInitialStockBalances,
    createProduct,
    createProductVariants,
    loadCategories,
} from '@/features/products/productData';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);

    // form state UTAMA
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [image, setImage] = useState('');
    const [hasVariants, setHasVariants] = useState(false);

    // untuk produk TANPA varian
    const [sku, setSku] = useState('');
    const [sellingPrice, setSellingPrice] = useState<number | string>('');
    const [lowStockThreshold, setLowStockThreshold] = useState<number | string>('');

    // untuk produk DENGAN varian
    const [variants, setVariants] = useState<VariantFormItem[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void loadCategories().then(setCategories);
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nama produk wajib diisi.');
            return;
        }

        if (!categoryId) {
            setError('Kategori produk wajib dipilih.');
            return;
        }

        setLoading(true);

        try {
            //1. membuat produk
            const createdProduct = await createProduct({
                name: name.trim(),
                description: description.trim(),
                categoryId,
                image: image.trim() || undefined,
                hasVariants,
                sku: !hasVariants && sku ? sku.trim() : null,
                sellingPrice:
                    !hasVariants && typeof sellingPrice === 'number' ? sellingPrice : null,
                lowStockThreshold:
                    !hasVariants && typeof lowStockThreshold === 'number'
                        ? lowStockThreshold
                        : null,
                isActive: true,
            });

            // toggle memiliki varian
            if (hasVariants) {
                if (variants.length === 0) {
                    setError('Tambahkan minimal satu varian produk.');
                    setLoading(false);
                    return;
                }

                // membuat varian
                const createVariants = await createProductVariants(
                    variants.map((v) => ({
                        productId: createdProduct.id,
                        variantName: v.variantName.trim(),
                        sku: v.sku.trim(),
                        sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : 0,
                        lowStockThreshold:
                            typeof v.lowStockThreshold === 'number' ? v.lowStockThreshold : 10,
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

            router.push('products');
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

            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    {/* Informasi Dasar Produk */}
                    <Card withBorder p="md">
                        <Stack gap="sm">
                            <Title order={4}>Informasi Produk</Title>
                            <TextInput
                                label="Nama Produk"
                                placeholder="Contoh: Kemeja Polos"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <Select
                                label="Kategori"
                                placeholder="Pilih kategori"
                                data={categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.name,
                                }))}
                                value={categoryId}
                                onChange={setCategoryId}
                                searchable
                                required
                            />
                            <Textarea
                                label="Deskripsi"
                                placeholder="Penjelasan singkat mengenai produk"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                minRows={3}
                            />
                            <TextInput
                                label="URL Gambar (Opsional)"
                                placeholder="https://..."
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </Stack>
                    </Card>

                    {/* Pengaturan Varian */}
                    <Card withBorder p="md">
                        <Stack gap="md">
                            <Switch
                                label="Produk ini memiliki varian? (Misal: ukuran, warna)"
                                checked={hasVariants}
                                onChange={(e) => {
                                    const checked = e.currentTarget.checked;
                                    setHasVariants(checked);
                                    if (checked && variants.length === 0) {
                                        setVariants([
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
                                }}
                            />

                            {/* Render Form Varian Terpisah atau Form Non-Varian */}
                            {hasVariants ? (
                                <ProductVariantForm variants={variants} onChange={setVariants} />
                            ) : (
                                <Stack gap="sm">
                                    <TextInput
                                        label="SKU"
                                        placeholder="Kode SKU Produk"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                    />
                                    <Group grow>
                                        <NumberInput
                                            label="Harga Jual"
                                            placeholder="0"
                                            value={sellingPrice}
                                            onChange={(val) => setSellingPrice(val ?? '')}
                                            min={0}
                                            required
                                        />
                                        <NumberInput
                                            label="Batas Stok Minimum"
                                            placeholder="10"
                                            value={lowStockThreshold}
                                            onChange={(val) => setLowStockThreshold(val ?? 10)}
                                            min={0}
                                        />
                                    </Group>
                                </Stack>
                            )}
                        </Stack>
                    </Card>

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            type="button"
                            onClick={() => router.push('/products')}
                        >
                            Batal
                        </Button>
                        <Button type="submit" loading={loading}>
                            Simpan Produk
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Stack>
    );
}
