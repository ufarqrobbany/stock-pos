import { z } from 'zod';

export const customerSchema = z.object({
    name: z.string().trim().min(1, 'Nama pelanggan wajib diisi.'),
    phone: z
        .string()
        .trim()
        .min(1, 'Nomor telepon wajib diisi.')
        .regex(/^[0-9+\-\s]{8,15}$/, 'Format nomor telepon tidak valid (8-15 digit).'),
    notes: z.string().trim().nullish(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
