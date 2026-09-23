import { db } from '@/db';
import type { LoginFormData } from '@/features/auth/schemas/loginSchema';
import type { SessionUser } from '@/features/auth/types';
import type { Result } from '@/types/common';
import { verifyPassword } from '@/utils/password';

export const userRepository = {
    async authenticate({ username, password }: LoginFormData): Promise<Result<SessionUser>> {
        const user = await db.users.where('username').equalsIgnoreCase(username).first();

        if (!user || !(await verifyPassword(password, user.password))) {
            return {
                success: false,
                data: null,
                message: 'Username atau kata sandi tidak valid',
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                data: null,
                message: 'Akun Anda sedang dinonaktifkan',
            };
        }

        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
            message: 'Berhasil masuk',
        };
    },
};
