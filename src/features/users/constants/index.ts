import type { UserRole } from '@/db/types/user';
import type { UserRoleFilter } from '../types';

export const ROLE_OPTIONS: { value: UserRoleFilter; label: string }[] = [
    { value: 'ALL', label: 'Semua' },
    { value: 'OWNER', label: 'Owner' },
    { value: 'INVENTORY', label: 'Inventory' },
    { value: 'CASHIER', label: 'Cashier' },
];

export const USER_FORM_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'OWNER', label: 'Owner' },
    { value: 'INVENTORY', label: 'Inventory' },
    { value: 'CASHIER', label: 'Cashier' },
];
