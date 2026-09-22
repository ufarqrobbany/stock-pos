import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().trim().min(1, 'Username wajib diisi').pipe(z.string().min(3, 'Username minimal 3 karakter')),
    password: z.string().min(1, 'Kata sandi wajib diisi').pipe(z.string().min(6, 'Kata sandi minimal 6 karakter')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
