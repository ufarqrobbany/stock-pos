'use client';

import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
// import { useRouter } from 'next/navigation';

import { type LoginFormData, loginSchema } from '@/features/auth/schemas/loginSchema';

export function useLoginForm() {
    // const router = useRouter();

    const form = useForm<LoginFormData>({
        initialValues: {
            username: '',
            password: '',
        },
        validate: zod4Resolver(loginSchema),
        validateInputOnBlur: true,
    });

    const handleSubmit = (_values: LoginFormData) => {
        // TODO: Handle login submission
    };

    return {
        form,
        handleSubmit,
    };
}
