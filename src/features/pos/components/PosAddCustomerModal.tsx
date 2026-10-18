'use client';

import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPhone, IconUser } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import type { Customer } from '@/db/types/customer';
import { type CustomerFormData, customerSchema } from '@/features/customers/schemas/customerSchema';

export interface PosAddCustomerModalProps {
    opened: boolean;
    onClose: () => void;
    onCustomerCreated: (customer: Customer) => void;
    addCustomer: (input: CustomerFormData) => Promise<Customer | null>;
    initialName?: string;
}

export function PosAddCustomerModal({
    opened,
    onClose,
    onCustomerCreated,
    addCustomer,
    initialName = '',
}: PosAddCustomerModalProps) {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const form = useForm<CustomerFormData>({
        initialValues: {
            name: initialName,
            phone: '',
            notes: '',
        },
        validate: zod4Resolver(customerSchema),
        validateInputOnBlur: true,
    });

    const handleClose = () => {
        if (isSubmitting) return;
        form.reset();
        onClose();
    };

    const handleSubmit = async (values: CustomerFormData) => {
        setIsSubmitting(true);
        try {
            const created = await addCustomer({
                name: values.name.trim(),
                phone: values.phone.trim(),
                notes: values.notes?.trim() || undefined,
            });

            if (created) {
                onCustomerCreated(created);
                form.reset();
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Text fw={600} size="md">
                    Tambah Pelanggan Baru
                </Text>
            }
            centered
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
                <Stack gap="sm">
                    <TextInput
                        label="Nama Pelanggan"
                        placeholder="Contoh: Budi Santoso"
                        leftSection={<IconUser size={15} color="var(--mantine-color-neutral-4)" />}
                        withAsterisk
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        label="Nomor Telepon / WhatsApp"
                        placeholder="Contoh: 081234567890"
                        leftSection={<IconPhone size={15} color="var(--mantine-color-neutral-4)" />}
                        withAsterisk
                        {...form.getInputProps('phone')}
                    />

                    <Textarea
                        label="Catatan"
                        placeholder="Catatan preferensi, alamat, atau keterangan member"
                        minRows={2}
                        maxRows={4}
                        autosize
                        {...form.getInputProps('notes')}
                    />

                    <Group justify="flex-end" gap="xs" mt="md">
                        <Button variant="default" size="sm" onClick={handleClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button type="submit" size="sm" loading={isSubmitting}>
                            Simpan &amp; Pilih Pelanggan
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
