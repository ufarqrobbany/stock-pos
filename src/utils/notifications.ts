import { notifications } from '@mantine/notifications';

interface NotificationOptions {
    title?: string;
    message?: string;
}

export const notifyError = ({
    title = 'Kesalahan Sistem',
    message = 'Terjadi gangguan sistem, silakan coba lagi',
}: NotificationOptions = {}) => {
    notifications.show({
        color: 'red',
        title,
        message,
    });
};

export const notifySuccess = ({
    title = 'Berhasil',
    message = 'Operasi berhasil dilakukan',
}: NotificationOptions = {}) => {
    notifications.show({
        color: 'green',
        title,
        message,
    });
};
