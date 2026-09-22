import { authRepository } from '@/db/repositories/userRepository';
import type { Result } from '@/types/common';
import { verifyPassword } from '@/utils/password';
import type { LoginFormData } from '../schemas/loginSchema';
import type { SessionUser } from '../types';

export const authService = {
    async login({ username, password }: LoginFormData): Promise<Result<SessionUser>> {
        const user = await authRepository.findByUsername(username);

        if (!user || !(await verifyPassword(password, user.password))) {
            return { success: false, data: null, message: 'Username atau kata sandi tidak valid' };
        }

        if (!user.isActive) {
            return { success: false, data: null, message: 'Akun Anda sedang dinonaktifkan' };
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
