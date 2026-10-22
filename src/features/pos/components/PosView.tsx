'use client';

import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import type { PaymentMethod } from '@/db/types/sales';
import type { UserRole } from '@/db/types/user';
import type { ProductListItem, ProductListVariant } from '@/features/products/types';
import { notifyError } from '@/utils/notifications';
import { usePosCart } from '../hooks/usePosCart';
import { usePosCatalog } from '../hooks/usePosCatalog';
import { usePosCustomers } from '../hooks/usePosCustomers';
import { posService } from '../services/posService';
import { PosCart } from './PosCart';
import { PosCheckoutModal } from './PosCheckoutModal';
import { PosFilter } from './PosFilter';
import { PosProductGrid } from './PosProductGrid';
import { PosVariantModal } from './PosVariantModal';

export interface PosViewProps {
    cashierId?: string;
    cashierName?: string;
    userRole?: UserRole;
}

export function PosView({ cashierId = 'cashier', userRole }: PosViewProps) {
    const theme = useMantineTheme();
    const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

    const catalog = usePosCatalog();
    const cart = usePosCart();
    const customers = usePosCustomers();

    const [selectedProductForVariant, setSelectedProductForVariant] = useState<ProductListItem | null>(null);
    const [isCheckoutModalOpen, { open: openCheckoutModal, close: closeCheckoutModal }] = useDisclosure(false);
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

    const handleAddVariantToCart = useCallback(
        (product: ProductListItem, variant: ProductListVariant) => {
            cart.handleAddVariantToCart(product, variant);
            setSelectedProductForVariant(null);
        },
        [cart.handleAddVariantToCart]
    );

    const handleOpenCheckout = useCallback(() => {
        if (cart.cartItems.length === 0) {
            notifyError({
                title: 'Keranjang Kosong',
                message: 'Silakan pilih produk terlebih dahulu sebelum melakukan pembayaran.',
            });
            return;
        }
        openCheckoutModal();
    }, [cart.cartItems.length, openCheckoutModal]);

    const handleProcessCheckout = useCallback(
        async (params: { paymentMethod: PaymentMethod; amountPaid?: number }) => {
            if (cart.cartItems.length === 0) return null;

            setIsCheckingOut(true);
            try {
                const transaction = await posService.checkout({
                    cashierId,
                    customerId: cart.customerId ?? undefined,
                    customerName: cart.customerName.trim() || undefined,
                    paymentMethod: params.paymentMethod,
                    items: cart.cartItems,
                });

                if (transaction) {
                    cart.handleClearCart();
                    await catalog.loadCatalog();
                    closeCheckoutModal();
                    return transaction;
                }
                return null;
            } finally {
                setIsCheckingOut(false);
            }
        },
        [
            cashierId,
            cart.customerId,
            cart.customerName,
            cart.cartItems,
            cart.handleClearCart,
            catalog.loadCatalog,
            closeCheckoutModal,
        ]
    );

    return (
        <>
            <Box
                p="xl"
                h="calc(100dvh - 64px)"
                mah="calc(100dvh - 64px)"
                mr={isDesktop ? 380 : 0}
                style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'margin-right 200ms ease',
                }}
            >
                <Stack gap={2} mb="md">
                    <Title order={2}>Point of Sale</Title>
                    <Text c="neutral.4" size="sm">
                        Kelola transaksi penjualan dan pencatatan kasir
                    </Text>
                </Stack>

                <Box mb="md">
                    <PosFilter
                        search={catalog.search}
                        onSearchChange={catalog.setSearch}
                        categories={catalog.categories}
                        selectedCategory={catalog.selectedCategory}
                        onSelectCategory={catalog.setSelectedCategory}
                    />
                </Box>

                <Box flex={1} mih={0} pr={4} style={{ overflowY: 'auto' }}>
                    <PosProductGrid
                        products={catalog.products}
                        isLoading={catalog.loading}
                        hasActiveFilter={catalog.hasActiveFilter}
                        totalActiveCount={catalog.totalActiveCount}
                        searchQuery={catalog.search}
                        selectedCategoryName={catalog.selectedCategoryName}
                        userRole={userRole}
                        onAddToCart={cart.handleAddToCart}
                        onSelectVariant={setSelectedProductForVariant}
                    />
                </Box>
            </Box>

            <PosCart
                items={cart.cartItems}
                customers={customers.customers}
                selectedCustomerId={cart.customerId}
                onSelectCustomer={cart.handleSelectCustomer}
                onAddCustomer={customers.addCustomer}
                onUpdateQuantity={cart.handleUpdateQuantity}
                onRemoveItem={cart.handleRemoveItem}
                onClearCart={cart.handleClearCart}
                onCheckout={handleOpenCheckout}
            />

            <PosVariantModal
                product={selectedProductForVariant}
                opened={Boolean(selectedProductForVariant)}
                onClose={() => setSelectedProductForVariant(null)}
                onAddVariantToCart={handleAddVariantToCart}
            />

            <PosCheckoutModal
                opened={isCheckoutModalOpen}
                onClose={() => !isCheckingOut && closeCheckoutModal()}
                items={cart.cartItems}
                customerName={cart.customerName}
                customerPhone={cart.customerPhone}
                totalAmount={cart.totalAmount}
                totalItems={cart.totalItems}
                isSubmitting={isCheckingOut}
                onConfirmCheckout={handleProcessCheckout}
            />
        </>
    );
}
