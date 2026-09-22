'use client';

import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type LoginFormData, loginSchema } from '@/features/auth/schemas/loginSchema';
import { notifyError } from '@/utils/notifications';
import { setSessionCookie } from '@/utils/session';
import { authService } from '../services/authService';

export function useLoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormData>({
        initialValues: {
            username: '',
            password: '',
        },
        validate: zod4Resolver(loginSchema),
        validateInputOnBlur: true,
    });

    const handleSubmit = async (values: LoginFormData) => {
        setIsLoading(true);

        try {
            const result = await authService.login(values);

            if (!result.success || !result.data) {
                notifyError({
                    title: 'Gagal Masuk',
                    message: result.message,
                });
                return;
            }

            await setSessionCookie(result.data);
            router.replace('/');
        } catch {
            notifyError();
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        handleSubmit,
        isLoading,
    };
}
