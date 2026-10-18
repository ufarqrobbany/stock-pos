'use client';

import { Button, Group, NumberInput, Paper, Stack, Text } from '@mantine/core';

export interface PosCashPaymentSectionProps {
    totalAmount: number;
    cashReceived: number | '';
    onChangeCashReceived: (val: number | '') => void;
    quickAmounts: number[];
}

export function PosCashPaymentSection({
    totalAmount,
    cashReceived,
    onChangeCashReceived,
    quickAmounts,
}: PosCashPaymentSectionProps) {
    const cashValue = typeof cashReceived === 'number' ? cashReceived : 0;
    const change = cashValue - totalAmount;

    return (
        <Stack gap="xs">
            <NumberInput
                label="Uang Diterima (Rp)"
                placeholder="Masukkan jumlah uang tunai"
                min={0}
                thousandSeparator="."
                decimalSeparator=","
                value={cashReceived}
                onChange={(val) => onChangeCashReceived(typeof val === 'number' ? val : '')}
            />

            <Group gap={6} wrap="wrap">
                {quickAmounts.map((amt) => (
                    <Button
                        key={amt}
                        size="compact-xs"
                        variant="light"
                        color={cashValue === amt ? 'primary' : 'gray'}
                        onClick={() => onChangeCashReceived(amt)}
                    >
                        {amt === totalAmount ? 'Uang Pas' : `Rp ${amt.toLocaleString('id-ID')}`}
                    </Button>
                ))}
            </Group>

            <Paper
                p="xs"
                radius="sm"
                bg={change >= 0 ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-red-0)'}
                bd={`1px solid ${change >= 0 ? 'var(--mantine-color-green-3)' : 'var(--mantine-color-red-3)'}`}
            >
                <Group justify="space-between" align="center">
                    <Text size="xs" fw={600} c={change >= 0 ? 'green.8' : 'red.8'}>
                        {change >= 0 ? 'Kembalian' : 'Kekurangan Pembayaran'}
                    </Text>
                    <Text size="sm" fw={800} c={change >= 0 ? 'green.8' : 'red.8'}>
                        Rp {Math.abs(change).toLocaleString('id-ID')}
                    </Text>
                </Group>
            </Paper>
        </Stack>
    );
}
