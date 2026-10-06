import { Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface ConfirmDeleteOptions {
    title?: string;
    itemName?: string;
    entityType?: string;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
}

export const confirmDelete = ({
    title = 'Konfirmasi Hapus',
    itemName,
    entityType = 'akun',
    message,
    confirmLabel = 'Hapus',
    cancelLabel = 'Batal',
    onConfirm,
}: ConfirmDeleteOptions) => {
    const content = message ?? (
        <Text size="sm">
            Apakah Anda yakin ingin menghapus {entityType}{' '}
            <Text span fw={600}>
                {itemName}
            </Text>
            ? Tindakan ini tidak dapat dibatalkan.
        </Text>
    );

    modals.openConfirmModal({
        title: (
            <Group gap="xs">
                <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
                <Text fw={600} size="md">
                    {title}
                </Text>
            </Group>
        ),
        centered: true,
        size: 'sm',
        children: content,
        labels: { confirm: confirmLabel, cancel: cancelLabel },
        confirmProps: { color: 'red', size: 'sm' },
        cancelProps: { size: 'sm', variant: 'default' },
        onConfirm,
    });
};
