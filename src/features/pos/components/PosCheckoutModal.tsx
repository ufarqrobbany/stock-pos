'use client';

import { Box, Button, Divider, Flex, Group, Modal, Paper, ScrollArea, Select, Stack, Text } from '@mantine/core';
import { IconReceipt2, IconUser } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { PAYMENT_METHODS } from '../constants/paymentMethods';
import type { PaymentMethod, PosCartItem, SalesTransaction } from '../types';
import { PosCashPaymentSection } from './PosCashPaymentSection';

interface PosCheckoutModalProps {
    opened: boolean;
    onClose: () => void;
    items: PosCartItem[];
    customerName: string;
    customerPhone?: string;
    totalAmount: number;
    totalItems: number;
    isSubmitting: boolean;
    onConfirmCheckout: (params: {
        paymentMethod: PaymentMethod;
        amountPaid?: number;
    }) => Promise<SalesTransaction | null>;
}

export function PosCheckoutModal({
    opened,
    onClose,
    items,
    customerName,
    customerPhone,
    totalAmount,
    totalItems,
    isSubmitting,
    onConfirmCheckout,
}: PosCheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [cashReceived, setCashReceived] = useState<number | ''>(totalAmount);

    useEffect(() => {
        if (opened) {
            setCashReceived(totalAmount);
            setPaymentMethod('CASH');
        }
    }, [opened, totalAmount]);

    const isCash = paymentMethod === 'CASH';
    const cashValue = typeof cashReceived === 'number' ? cashReceived : 0;
    const isPaymentValid = !isCash || cashValue >= totalAmount;

    const quickAmounts = useMemo(() => {
        return [
            totalAmount,
            Math.ceil(totalAmount / 10000) * 10000,
            Math.ceil(totalAmount / 20000) * 20000,
            Math.ceil(totalAmount / 50000) * 50000,
            Math.ceil(totalAmount / 100000) * 100000,
        ]
            .filter((amt, idx, arr) => amt >= totalAmount && arr.indexOf(amt) === idx)
            .slice(0, 4);
    }, [totalAmount]);

    const handleSubmit = async () => {
        if (!isPaymentValid || isSubmitting) return;

        await onConfirmCheckout({
            paymentMethod,
            amountPaid: isCash ? cashValue : totalAmount,
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text fw={700} size="md">
                    Pembayaran Transaksi
                </Text>
            }
            centered
            radius="md"
            size="md"
        >
            <Stack gap="md">
                <Paper p="xs" radius="sm" withBorder>
                    <Group gap="xs">
                        <IconUser size={16} color="var(--mantine-color-neutral-5)" />
                        <div>
                            <Text size="11px" c="dimmed">
                                Pelanggan
                            </Text>
                            <Text fw={600} size="xs">
                                {customerName.trim() ? customerName : 'Pelanggan Umum'}
                            </Text>
                            {customerPhone && (
                                <Text size="10px" c="dimmed">
                                    {customerPhone}
                                </Text>
                            )}
                        </div>
                    </Group>
                </Paper>

                <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                        Daftar Pesanan:
                    </Text>
                    <ScrollArea h={items.length > 3 ? 120 : 'auto'} scrollbarSize={6}>
                        <Stack gap={4}>
                            {items.map((item) => (
                                <Group key={item.id} justify="space-between" align="center" py={2}>
                                    <Box style={{ minWidth: 0, flex: 1 }}>
                                        <Text size="xs" fw={500} lineClamp={1}>
                                            {item.productName}
                                            {item.variantName ? ` (${item.variantName})` : ''}
                                        </Text>
                                        <Text size="11px" c="dimmed">
                                            {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                                        </Text>
                                    </Box>
                                    <Text size="xs" fw={600}>
                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    </ScrollArea>
                </Box>

                <Divider />

                <Flex gap="xs" direction="column">
                    <Group justify="space-between" align="baseline">
                        <Text size="xs">Jumlah Barang</Text>
                        <Text fw={700} size="xs">
                            {totalItems} item
                        </Text>
                    </Group>

                    <Group justify="space-between" align="baseline">
                        <Text fw={700} size="sm">
                            Total Tagihan
                        </Text>
                        <Text fw={800} size="xl" c="primary.7">
                            Rp {totalAmount.toLocaleString('id-ID')}
                        </Text>
                    </Group>
                </Flex>

                <Group justify="space-between" align="center">
                    <Text size="xs" fw={600}>
                        Metode Pembayaran
                    </Text>
                    <Select
                        size="xs"
                        value={paymentMethod}
                        onChange={(val) => val && setPaymentMethod(val as PaymentMethod)}
                        data={PAYMENT_METHODS}
                        allowDeselect={false}
                        w={180}
                    />
                </Group>

                {isCash && (
                    <PosCashPaymentSection
                        totalAmount={totalAmount}
                        cashReceived={cashReceived}
                        onChangeCashReceived={setCashReceived}
                        quickAmounts={quickAmounts}
                    />
                )}

                <Divider />

                <Group justify="flex-end" gap="sm">
                    <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button
                        color="primary"
                        loading={isSubmitting}
                        disabled={!isPaymentValid}
                        onClick={handleSubmit}
                        leftSection={<IconReceipt2 size={16} />}
                    >
                        Selesaikan Transaksi
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
