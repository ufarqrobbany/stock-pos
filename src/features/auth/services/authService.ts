import { userRepository } from '@/db/repositories/userRepository';
import { notifyError } from '@/utils/notifications';
import { setSessionCookie } from '@/utils/session';
import type { LoginFormData } from '../schemas/loginSchema';

export const authService = {
    async login(values: LoginFormData): Promise<boolean> {
        const result = await userRepository.authenticate(values);

        if (!result.success || !result.data) {
            notifyError({
                title: 'Gagal Masuk',
                message: result.message,
            });
            return false;
        }

        await setSessionCookie(result.data);
        return true;
    },
};
