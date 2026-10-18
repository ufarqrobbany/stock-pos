'use client';

import { Badge, Box, Button, Card, Image, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import type { ProductListItem } from '@/features/products/types';

interface PosProductCardProps {
    product: ProductListItem;
    onAddToCart: (product: ProductListItem) => void;
    onSelectVariant: (product: ProductListItem) => void;
}

export function PosProductCard({ product, onAddToCart, onSelectVariant }: PosProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const hasVariants = Boolean(product.variants && product.variants.length > 0);
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
    const priceDisplay = product.price ?? 0;
    const imageSrc = product.imageUrl?.trim() || product.image?.trim() || null;
    const canShowImage = Boolean(imageSrc && !imageError);

    const handleAction = () => {
        if (isOutOfStock) return;
        if (hasVariants) {
            onSelectVariant(product);
        } else {
            onAddToCart(product);
        }
    };

    return (
        <Card p="xs" radius="md" withBorder shadow="none" opacity={isOutOfStock ? 0.65 : 1}>
            <Stack justify="space-between" h="100%" gap="xs">
                <Box>
                    <Box
                        pos="relative"
                        h={125}
                        mb="xs"
                        bg="gray.2"
                        style={{ borderRadius: 'var(--mantine-radius-sm)', overflow: 'hidden' }}
                    >
                        {canShowImage && imageSrc ? (
                            <Image src={imageSrc} alt="" h={125} fit="cover" onError={() => setImageError(true)} />
                        ) : null}

                        {(isOutOfStock || isLowStock) && (
                            <Box pos="absolute" top={6} right={6}>
                                <Badge size="xs" variant="filled" color={isOutOfStock ? 'red' : 'orange'}>
                                    {isOutOfStock ? 'Habis' : `Sisa ${product.stock}`}
                                </Badge>
                            </Box>
                        )}

                        {hasVariants && (
                            <Box pos="absolute" bottom={6} left={6}>
                                <Badge size="xs" variant="white" color="neutral">
                                    {product.variants.length} Varian
                                </Badge>
                            </Box>
                        )}
                    </Box>

                    <Stack gap={2}>
                        <Text size="11px" c="dimmed" lineClamp={1}>
                            {product.categoryName}
                        </Text>
                        <Text fw={600} size="sm" lineClamp={1} title={product.name}>
                            {product.name}
                        </Text>
                        {product.description && (
                            <Text size="11px" c="neutral.5" lineClamp={1}>
                                {product.description}
                            </Text>
                        )}
                    </Stack>
                </Box>

                <Box mt="xs">
                    <Box mb={6}>
                        {hasVariants && (
                            <Text size="10px" c="dimmed" lh={1.2}>
                                Mulai dari
                            </Text>
                        )}
                        <Text fw={700} size="sm" c="primary.7">
                            Rp {priceDisplay.toLocaleString('id-ID')}
                        </Text>
                    </Box>

                    <Button
                        size="xs"
                        variant={hasVariants ? 'light' : 'filled'}
                        color="primary"
                        fullWidth
                        disabled={isOutOfStock}
                        leftSection={!hasVariants && !isOutOfStock ? <IconPlus size={14} /> : undefined}
                        onClick={handleAction}
                    >
                        {isOutOfStock ? 'Habis' : hasVariants ? 'Pilih Varian' : 'Tambah'}
                    </Button>
                </Box>
            </Stack>
        </Card>
    );
}
