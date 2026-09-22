import { db } from '@/db';
import type { User } from '@/db/types/user';

export const authRepository = {
    async findByUsername(username: string): Promise<User | undefined> {
        return await db.users.where('username').equalsIgnoreCase(username).first();
    },
};
