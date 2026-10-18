import { notifications } from '@mantine/notifications';

interface NotificationOptions {
    title?: string;
    message?: string;
}

export const notifyError = ({
    title = 'Kesalahan Sistem',
    message = 'Terjadi gangguan sistem, silakan coba lagi',
}: NotificationOptions = {}) => {
    setTimeout(() => {
        notifications.show({
            color: 'red',
            title,
            message,
        });
    }, 0);
};

export const notifySuccess = ({
    title = 'Berhasil',
    message = 'Operasi berhasil dilakukan',
}: NotificationOptions = {}) => {
    setTimeout(() => {
        notifications.show({
            color: 'green',
            title,
            message,
        });
    }, 0);
};
