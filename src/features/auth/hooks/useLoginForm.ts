'use client';

import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type LoginFormData, loginSchema } from '@/features/auth/schemas/loginSchema';
import { notifyError } from '@/utils/notifications';
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
            const success = await authService.login(values);
            if (success) {
                router.replace('/');
            }
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
