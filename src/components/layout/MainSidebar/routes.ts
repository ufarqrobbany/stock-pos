import { IconBox, IconDashboard, IconReceipt, IconShoppingCart, IconUsers } from '@tabler/icons-react';
import type { UserRole } from '@/db/types/user';

export interface SidebarRouteItem {
    label: string;
    link: string;
    icon: typeof IconDashboard;
    allowedRoles: UserRole[];
}

export const sidebarRoutes: SidebarRouteItem[] = [
    {
        label: 'Dashboard',
        link: '/dashboard',
        icon: IconDashboard,
        allowedRoles: ['OWNER'],
    },
    {
        label: 'POS',
        link: '/pos',
        icon: IconShoppingCart,
        allowedRoles: ['OWNER', 'CASHIER'],
    },
    {
        label: 'Katalog Produk',
        link: '/products',
        icon: IconBox,
        allowedRoles: ['OWNER', 'INVENTORY'],
    },
    {
        label: 'Riwayat Transaksi',
        link: '/transactions',
        icon: IconReceipt,
        allowedRoles: ['OWNER'],
    },
    {
        label: 'Manajemen Pengguna',
        link: '/users',
        icon: IconUsers,
        allowedRoles: ['OWNER'],
    },
];
