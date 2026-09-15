import { IconBox, IconDashboard, IconReceipt, IconUsers } from '@tabler/icons-react';

export const sidebarRoutes = [
    { label: 'Dashboard', link: '/dashboard', icon: IconDashboard },
    { label: 'Katalog Produk', link: '/products', icon: IconBox },
    { label: 'Riwayat Transaksi', link: '/transactions', icon: IconReceipt },
    { label: 'Manajemen Pengguna', link: '/users', icon: IconUsers },
];
