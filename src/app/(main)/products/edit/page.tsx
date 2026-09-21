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
    loadCategories,
    loadProductById,
    loadVariantByProductId,
    updateProduct,
    updateProductVariants,
} from '@/features/products/productData';

export default function EditProductPage() {
    const router = useRouter();
    const searchParams = new URLSearchParams(window.location.search);

    const productId = searchParams.get('id');

    const [categories, setCategories] = useState<Category[]>([]);
    const [fetching, setFetching] = useState(true);

    // form state UTAMA
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [image, setImage] = useState('');
    const [hasVariants, setHasVariants] = useState(false);
    const [isActive, setIsActive] = useState(true);

    // untuk produk DENGAN varian
    const [variants, setVariants] = useState<VariantFormItem[]>([]);

    // untuk produk TANPA varian
    const [sku, setSku] = useState('');
    const [lowStockThreshold, setLowStockThreshold] = useState<number | string>('');
    const [sellingPrice, setSellingPrice] = useState<number | string>('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // fetch data kategori dan detail produk saat mount
    useEffect(() => {
        async function initData() {
            // reset error setiap kali proses berjalan
            setError('');

            if (!productId) {
                setError('ID produk tidak ditemukan di URL.');
                setFetching(false);
                return;
            }

            try {
                setFetching(true);

                const [fetchedCategories, products] = await Promise.all([
                    loadCategories(),
                    loadProductById(productId),
                ]);

                setCategories(fetchedCategories);

                if (!products) {
                    setError('Produk tidak ditemukan');
                    return;
                }

                setName(products.name);
                setDescription(products.description ?? '');
                setCategoryId(products.categoryId);
                setImage(products.image ?? '');
                setHasVariants(products.hasVariants);
                setIsActive(products.isActive);

                // Jika produk MEMILIKI varian, ambil data varian
                if (products.hasVariants) {
                    const existingVariants = await loadVariantByProductId(productId);
                    setVariants(
                        existingVariants.map((variant) => ({
                            id: variant.id,
                            variantName: variant.variantName,
                            sku: variant.sku,
                            sellingPrice: variant.sellingPrice,
                            lowStockThreshold: variant.lowStockThreshold,
                            isActive: variant.isActive,
                        }))
                    );
                } else {
                    // jika TANPA varian, isi detail non-varian
                    setSku(products.sku || '');
                    setSellingPrice(products.sellingPrice ?? '');
                    setLowStockThreshold(products.lowStockThreshold ?? '');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat data produk.');
            } finally {
                setFetching(false);
            }
        }

        void initData();
    }, [productId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!productId) return setError('ID produk tidak valid.');
        if (!name.trim()) return setError('Nama produk wajib diisi.');
        if (!categoryId) setError('Kategori produk wajib dipilih.');

        setLoading(true);

        try {
            // 1. update data produk utama
            await updateProduct(productId as string, {
                name: name.trim(),
                description: description.trim() || undefined,
                categoryId: categoryId as string,
                image: image.trim() || undefined,
                hasVariants,
                isActive,
                sku: !hasVariants && sku ? sku.trim() : null,
                sellingPrice:
                    !hasVariants && typeof sellingPrice === 'number' ? sellingPrice : null,
                lowStockThreshold:
                    !hasVariants && typeof lowStockThreshold === 'number'
                        ? lowStockThreshold
                        : null,
            });

            // 2. update varian jika produk memiliki varian
            if (hasVariants) {
                if (variants.length === 0) {
                    setError('Tambahkan minimal satu varian produk.');
                    setLoading(false);
                    return;
                }

                await updateProductVariants(
                    productId as string,
                    variants.map((v) => ({
                        id: v.id,
                        productId: productId as string,
                        variantName: v.variantName.trim(),
                        sku: v.sku.trim(),
                        sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : 0,
                        lowStockThreshold:
                            typeof v.lowStockThreshold === 'number' ? v.lowStockThreshold : 10,
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

    if (fetching) {
        return <Text size="sm">Memuat data produk...</Text>;
    }

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
                            Simpan Perubahan
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Stack>
    );
}
