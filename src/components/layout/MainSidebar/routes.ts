import { IconBox, IconDashboard, IconReceipt, IconShoppingCart, IconUsers } from '@tabler/icons-react';
import type { UserRole } from '@/db/types/user';

export interface SidebarSubItem {
    label: string;
    link: string;
    allowedRoles: UserRole[];
}

export interface SidebarRouteItem {
    label: string;
    link?: string;
    icon: typeof IconDashboard;
    allowedRoles: UserRole[];
    children?: SidebarSubItem[];
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

        icon: IconBox,
        allowedRoles: ['OWNER', 'INVENTORY'],
        children: [
            {
                label: 'Daftar Produk',
                link: '/products',
                allowedRoles: ['OWNER', 'INVENTORY'],
            },
            {
                label: 'Kategori Produk',
                link: '/products/categories',
                allowedRoles: ['OWNER', 'INVENTORY'],
            },
        ],
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
