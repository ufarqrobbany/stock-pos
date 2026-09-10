import { hashPassword } from '@/utils/password';
import type { StockPOSDatabase } from './index';
import type { User } from './types/user';

export async function seedUsers(db: StockPOSDatabase): Promise<void> {
    const [ownerHash, gudangHash, kasirHash] = await Promise.all([
        hashPassword('owner123'),
        hashPassword('gudang123'),
        hashPassword('kasir123'),
    ]);

    const initialUsers: User[] = [
        {
            id: 'usr_owner_01',
            name: 'Pemilik Toko',
            username: 'owner',
            password: ownerHash,
            role: 'OWNER',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'usr_inv_01',
            name: 'Staf Gudang',
            username: 'gudang',
            password: gudangHash,
            role: 'INVENTORY',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'usr_cashier_01',
            name: 'Kasir Utama',
            username: 'kasir',
            password: kasirHash,
            role: 'CASHIER',
            isActive: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.users.bulkAdd(initialUsers);
}
