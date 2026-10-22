'use client';

import { ActionIcon, Button, Card, Group, NumberInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { generateSku } from '../utils/skuUtils';

export interface VariantFormItem {
    id: string;
    variantName: string;
    sku: string;
    sellingPrice: number | '';
    lowStockThreshold: number | '';
    isActive: boolean;
}

interface ProductVariantFormProps {
    variants: VariantFormItem[];
    onChange: (variants: VariantFormItem[]) => void;
}

export function ProductVariantForm({ variants, onChange }: ProductVariantFormProps) {
    const handleAddVariant = () => {
        const newVariant: VariantFormItem = {
            id: crypto.randomUUID(),
            variantName: '',
            sku: '',
            sellingPrice: '',
            lowStockThreshold: 10,
            isActive: true,
        };
        onChange([...variants, newVariant]);
    };

    const handleRemoveVariant = (id: string) => {
        onChange(variants.filter((item) => item.id !== id));
    };

    const handleUpdateVariant = (id: string, field: keyof VariantFormItem, value: string | number | boolean) => {
        const updated = variants.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        onChange(updated);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <div>
                    <Text fw={500}>Daftar Varian Produk</Text>
                    <Text size="xs" c="dimmed">
                        Tambahkan variasi seperti ukuran, warna, atau spesifikasi.
                    </Text>
                </div>
                <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={handleAddVariant}>
                    Tambah Varian
                </Button>
            </Group>

            {variants.map((variant, index) => (
                <Card key={variant.id} withBorder p="sm" radius="md">
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text size="sm" fw={600}>
                                Varian {index + 1}
                            </Text>
                            {variants.length > 1 && (
                                <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => handleRemoveVariant(variant.id)}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            )}
                        </Group>

                        <Group grow align="flex-start">
                            <TextInput
                                label="Nama Varian"
                                placeholder="Contoh: Merah / XL"
                                value={variant.variantName}
                                onChange={(e) => handleUpdateVariant(variant.id, 'variantName', e.target.value)}
                                onBlur={(e) => {
                                    if (!variant.sku.trim() && e.currentTarget.value.trim()) {
                                        handleUpdateVariant(variant.id, 'sku', generateSku(e.currentTarget.value));
                                    }
                                }}
                                required
                            />
                            <TextInput
                                label="SKU"
                                placeholder="Kode SKU"
                                value={variant.sku}
                                onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                                rightSection={
                                    <Button
                                        variant="subtle"
                                        size="compact-xs"
                                        type="button"
                                        onClick={() =>
                                            handleUpdateVariant(variant.id, 'sku', generateSku(variant.variantName))
                                        }
                                    >
                                        Otomatis
                                    </Button>
                                }
                                rightSectionWidth={75}
                                required
                            />
                        </Group>

                        <Group grow align="flex-start">
                            <NumberInput
                                label="Harga Jual"
                                placeholder="0"
                                value={variant.sellingPrice}
                                onChange={(val) => handleUpdateVariant(variant.id, 'sellingPrice', val ?? '')}
                                min={0}
                                required
                            />
                            <NumberInput
                                label="Batas Stok Minimum"
                                placeholder="10"
                                value={variant.lowStockThreshold}
                                onChange={(val) => handleUpdateVariant(variant.id, 'lowStockThreshold', val ?? 0)}
                                min={0}
                            />
                        </Group>

                        <Switch
                            label="Status Aktif"
                            checked={variant.isActive}
                            onChange={(e) => handleUpdateVariant(variant.id, 'isActive', e.currentTarget.checked)}
                        />
                    </Stack>
                </Card>
            ))}
        </Stack>
    );
}
