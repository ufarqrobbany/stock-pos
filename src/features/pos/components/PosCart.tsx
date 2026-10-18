'use client';

import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Divider,
    Group,
    ScrollArea,
    Select,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconMinus,
    IconPlus,
    IconReceipt2,
    IconShoppingCart,
    IconTrash,
    IconUser,
    IconUserPlus,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import type { Customer } from '@/db/types/customer';
import type { CustomerFormData } from '@/features/customers/schemas/customerSchema';
import type { PosCartItem } from '../types';
import { PosAddCustomerModal } from './PosAddCustomerModal';

export interface PosCartProps {
    items: PosCartItem[];
    customers: Customer[];
    selectedCustomerId: string | null;
    onSelectCustomer: (customer: Customer | null) => void;
    onAddCustomer: (input: CustomerFormData) => Promise<Customer | null>;
    onUpdateQuantity: (cartItemId: string, newQty: number) => void;
    onRemoveItem: (cartItemId: string) => void;
    onClearCart: () => void;
    onCheckout: () => void;
}

export function PosCart({
    items,
    customers,
    selectedCustomerId,
    onSelectCustomer,
    onAddCustomer,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCheckout,
}: PosCartProps) {
    const [isAddCustomerModalOpen, { open: openAddCustomerModal, close: closeAddCustomerModal }] = useDisclosure(false);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const customerOptions = useMemo(() => {
        return customers.map((c) => ({
            value: c.id,
            label: `${c.name} • ${c.phone}`,
        }));
    }, [customers]);

    const handleCustomerChange = (customerId: string | null) => {
        if (!customerId) {
            onSelectCustomer(null);
            return;
        }
        const found = customers.find((c) => c.id === customerId);
        onSelectCustomer(found ?? null);
    };

    return (
        <>
            <Card withBorder shadow="none" p="sm" radius="md" h="100%" mih={0} style={{ overflow: 'hidden' }}>
                <Group justify="space-between" align="center" mb={8}>
                    <Group gap={8} align="center">
                        <IconShoppingCart size={20} color="var(--mantine-color-primary-6)" />
                        <Text fw={600} size="md">
                            Detail Pesanan
                        </Text>
                    </Group>

                    {items.length > 0 && (
                        <Button
                            variant="subtle"
                            color="red"
                            size="compact-xs"
                            leftSection={<IconTrash size={12} />}
                            onClick={onClearCart}
                        >
                            Kosongkan
                        </Button>
                    )}
                </Group>

                <Group my="sm" gap={6} wrap="nowrap" align="center">
                    <Select
                        size="xs"
                        placeholder="Pilih Pelanggan (opsional)"
                        leftSection={<IconUser size={14} color="var(--mantine-color-neutral-4)" />}
                        data={customerOptions}
                        value={selectedCustomerId}
                        onChange={handleCustomerChange}
                        searchable
                        clearable
                        nothingFoundMessage="Tidak ada pelanggan ditemukan"
                        flex={1}
                        style={{ minWidth: 0 }}
                    />
                    <Tooltip label="Tambah Pelanggan Baru" withArrow position="top">
                        <ActionIcon
                            color="primary"
                            size="30px"
                            onClick={openAddCustomerModal}
                            aria-label="Tambah Pelanggan Baru"
                        >
                            <IconUserPlus size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <Divider my={4} />

                <Box flex={1} mih={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {items.length === 0 ? (
                        <Center h="100%" py={36}>
                            <Text size="sm" c="neutral.5" ta="center">
                                Keranjang Belum Terisi
                            </Text>
                        </Center>
                    ) : (
                        <ScrollArea h="100%" scrollbarSize={6} flex={1} mih={0}>
                            <Stack gap={8} py={4}>
                                {items.map((item) => (
                                    <Box
                                        key={item.id}
                                        p={10}
                                        bd="1px solid var(--mantine-color-surface-2)"
                                        style={{ borderRadius: 'var(--mantine-radius-md)' }}
                                    >
                                        <Group justify="space-between" align="flex-start" wrap="nowrap" mb={6}>
                                            <Box style={{ minWidth: 0, flex: 1 }}>
                                                <Text fw={600} size="xs" lineClamp={1} title={item.productName}>
                                                    {item.productName}
                                                </Text>
                                                {item.variantName && (
                                                    <Badge size="xs" variant="light" color="neutral" mt={2}>
                                                        {item.variantName}
                                                    </Badge>
                                                )}
                                            </Box>
                                            <ActionIcon
                                                size="xs"
                                                variant="subtle"
                                                color="red"
                                                onClick={() => onRemoveItem(item.id)}
                                                aria-label="Hapus item"
                                            >
                                                <IconTrash size={13} />
                                            </ActionIcon>
                                        </Group>

                                        <Group justify="space-between" align="center">
                                            <Text fw={700} size="xs" c="primary.7">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </Text>

                                            <Group gap={6} align="center">
                                                <ActionIcon
                                                    size="xs"
                                                    radius="sm"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Kurangi kuantitas"
                                                >
                                                    <IconMinus size={12} />
                                                </ActionIcon>

                                                <Text size="xs" fw={600} style={{ minWidth: 20, textAlign: 'center' }}>
                                                    {item.quantity}
                                                </Text>

                                                <ActionIcon
                                                    size="xs"
                                                    radius="sm"
                                                    disabled={item.quantity >= item.maxStock}
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Tambah kuantitas"
                                                >
                                                    <IconPlus size={12} />
                                                </ActionIcon>
                                            </Group>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        </ScrollArea>
                    )}
                </Box>

                <Divider my={6} />

                <Stack gap="xs" pt={4}>
                    <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                            Jumlah Barang
                        </Text>
                        <Text size="xs" fw={600}>
                            {totalItems} item
                        </Text>
                    </Group>

                    <Group justify="space-between" align="center">
                        <Text fw={600} size="md">
                            Total Tagihan
                        </Text>
                        <Text fw={800} size="lg" c="primary.7">
                            Rp {total.toLocaleString('id-ID')}
                        </Text>
                    </Group>

                    <Button
                        size="md"
                        color="primary"
                        disabled={items.length === 0}
                        onClick={onCheckout}
                        leftSection={<IconReceipt2 size={18} />}
                        fullWidth
                        mt={4}
                    >
                        Bayar (Rp {total.toLocaleString('id-ID')})
                    </Button>
                </Stack>
            </Card>

            <PosAddCustomerModal
                opened={isAddCustomerModalOpen}
                onClose={closeAddCustomerModal}
                addCustomer={onAddCustomer}
                onCustomerCreated={(newCustomer) => {
                    onSelectCustomer(newCustomer);
                }}
            />
        </>
    );
}
