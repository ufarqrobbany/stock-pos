export type UserRole = 'OWNER' | 'INVENTORY' | 'CASHIER';

export interface User {
    id: string;
    name: string;
    username: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}
