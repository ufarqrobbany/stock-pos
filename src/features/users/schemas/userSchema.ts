import { z } from 'zod';

export const userRoleSchema = z.enum(['OWNER', 'INVENTORY', 'CASHIER'], {
    message: 'Role akses wajib dipilih.',
});

const baseUserSchema = z.object({
    name: z.string().trim().min(1, 'Nama lengkap wajib diisi'),
    username: z.string().trim().min(1, 'Username wajib diisi').pipe(z.string().min(3, 'Username minimal 3 karakter')),
    role: userRoleSchema,
    isActive: z.boolean(),
});

export const createUserSchema = baseUserSchema.extend({
    password: z
        .string()
        .trim()
        .min(1, 'Kata sandi wajib diisi')
        .pipe(z.string().min(6, 'Kata sandi minimal 6 karakter')),
});

export const updateUserSchema = baseUserSchema.extend({
    password: z.literal('').or(z.string().trim().min(6, 'Kata sandi baru minimal 6 karakter')).optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UserFormData = CreateUserFormData | UpdateUserFormData;
