'use client';

import { Badge, Box, Button, Divider, Group, Image, Modal, Paper, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import type { ProductListItem, ProductListVariant } from '@/features/products/types';

interface PosVariantModalProps {
    product: ProductListItem | null;
    opened: boolean;
    onClose: () => void;
    onAddVariantToCart: (product: ProductListItem, variant: ProductListVariant) => void;
}

export function PosVariantModal({ product, opened, onClose, onAddVariantToCart }: PosVariantModalProps) {
    const [imageError, setImageError] = useState(false);
    if (!product) return null;

    const handleSelect = (variant: ProductListVariant) => {
        onAddVariantToCart(product, variant);
        onClose();
    };

    const imageSrc = product.imageUrl?.trim() || product.image?.trim() || null;
    const canShowImage = Boolean(imageSrc && !imageError);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <div>
                    <Text fw={700} size="md">
                        Pilih Varian Menu
                    </Text>
                    <Text size="xs" c="dimmed">
                        Tentukan opsi ukuran atau penyajian untuk pesanan ini
                    </Text>
                </div>
            }
            centered
            radius="md"
            size="md"
        >
            <Stack gap="sm">
                <Paper p="xs" radius="sm" withBorder bg="var(--mantine-color-surface-0)">
                    <Group gap="sm" align="center">
                        <Box
                            w={50}
                            h={50}
                            bg="gray.2"
                            style={{ borderRadius: 'var(--mantine-radius-sm)', overflow: 'hidden' }}
                        >
                            {canShowImage && imageSrc ? (
                                <Image
                                    src={imageSrc}
                                    alt=""
                                    w={50}
                                    h={50}
                                    fit="cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : null}
                        </Box>
                        <div>
                            <Text fw={600} size="sm">
                                {product.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {product.categoryName}
                            </Text>
                        </div>
                    </Group>
                </Paper>

                <Divider my={2} />

                <Text size="xs" fw={600} c="neutral.6">
                    Pilihan Varian Tersedia:
                </Text>

                <Stack gap="xs">
                    {product.variants.map((variant) => {
                        const isOutOfStock = variant.stock <= 0;
                        const isLowStock = variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
                        return (
                            <Paper key={variant.id} p="sm" radius="sm" withBorder opacity={isOutOfStock ? 0.6 : 1}>
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Group gap="xs" align="center">
                                            <Text fw={600} size="sm">
                                                {variant.name}
                                            </Text>
                                            {(isOutOfStock || isLowStock) && (
                                                <Badge
                                                    size="xs"
                                                    variant="filled"
                                                    color={isOutOfStock ? 'red' : 'orange'}
                                                >
                                                    {isOutOfStock ? 'Habis' : `Sisa ${variant.stock}`}
                                                </Badge>
                                            )}
                                        </Group>
                                        <Text fw={700} size="sm" c="primary.7" mt={2}>
                                            Rp {variant.price.toLocaleString('id-ID')}
                                        </Text>
                                    </div>

                                    <Button
                                        size="xs"
                                        color="primary"
                                        disabled={isOutOfStock}
                                        leftSection={<IconPlus size={14} />}
                                        onClick={() => handleSelect(variant)}
                                    >
                                        Pilih Varian
                                    </Button>
                                </Group>
                            </Paper>
                        );
                    })}
                </Stack>
            </Stack>
        </Modal>
    );
}
