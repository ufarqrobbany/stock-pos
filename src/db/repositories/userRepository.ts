import { Dexie } from 'dexie';
import { db } from '@/db';
import type { LoginFormData } from '@/features/auth/schemas/loginSchema';
import type { SessionUser } from '@/features/auth/types';
import type { CreateUserInput, UpdateUserInput, UserQueryParams } from '@/features/users/types';
import type { PaginatedResult, Result } from '@/types/common';
import { hashPassword, verifyPassword } from '@/utils/password';
import type { User } from '../types/user';

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

    async getById(id: string): Promise<Result<User>> {
        try {
            const user = await db.users.get(id);
            if (!user) {
                return {
                    success: false,
                    data: null,
                    message: 'Pengguna tidak ditemukan',
                };
            }

            return {
                success: true,
                data: user,
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal mengambil data pengguna',
            };
        }
    },

    async getAll({
        page = 1,
        pageSize = 10,
        search,
        sortBy = 'createdAt',
        sortDirection = 'asc',
        role,
    }: UserQueryParams): Promise<Result<PaginatedResult<User>>> {
        try {
            let collection = role
                ? db.users.where(`[role+${sortBy}]`).between([role, Dexie.minKey], [role, Dexie.maxKey])
                : db.users.orderBy(sortBy);

            if (sortDirection === 'desc') {
                collection = collection.reverse();
            }

            if (search?.trim()) {
                const keyword = search.trim().toLowerCase();
                collection = collection.filter(
                    (user) => user.name.toLowerCase().includes(keyword) || user.username.toLowerCase().includes(keyword)
                );
            }

            const total = await collection.count();
            const items = await collection
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize) || 1,
                },
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal mengambil data pengguna dari database',
            };
        }
    },

    async createUser(input: CreateUserInput): Promise<Result<User>> {
        try {
            const username = input.username.trim();
            const existing = await db.users.where('username').equalsIgnoreCase(username).first();
            if (existing) {
                return {
                    success: false,
                    data: null,
                    message: 'Username sudah digunakan',
                };
            }

            const now = new Date().toISOString();
            const hashedPassword = await hashPassword(input.password);

            const newUser: User = {
                id: crypto.randomUUID(),
                name: input.name.trim(),
                username,
                password: hashedPassword,
                role: input.role,
                isActive: input.isActive ?? true,
                createdAt: now,
                updatedAt: now,
            };

            await db.users.add(newUser);

            return {
                success: true,
                data: newUser,
                message: 'Pengguna berhasil ditambahkan',
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal menambahkan pengguna',
            };
        }
    },

    async updateUser(id: string, input: UpdateUserInput): Promise<Result<User>> {
        try {
            const user = await db.users.get(id);
            if (!user) {
                return {
                    success: false,
                    data: null,
                    message: 'Pengguna tidak ditemukan',
                };
            }

            if (input.username && input.username.trim().toLowerCase() !== user.username.toLowerCase()) {
                const username = input.username.trim();
                const existing = await db.users.where('username').equalsIgnoreCase(username).first();
                if (existing && existing.id !== id) {
                    return {
                        success: false,
                        data: null,
                        message: 'Username sudah digunakan oleh pengguna lain',
                    };
                }
            }

            const updates: Partial<User> = {
                updatedAt: new Date().toISOString(),
            };

            if (input.name !== undefined) updates.name = input.name.trim();
            if (input.username !== undefined) updates.username = input.username.trim();
            if (input.role !== undefined) updates.role = input.role;
            if (input.isActive !== undefined) updates.isActive = input.isActive;
            if (input.password?.trim()) {
                updates.password = await hashPassword(input.password);
            }

            await db.users.update(id, updates);

            return {
                success: true,
                data: { ...user, ...updates },
                message: 'Pengguna berhasil diperbarui',
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal memperbarui pengguna',
            };
        }
    },

    async deleteUser(id: string): Promise<Result<void>> {
        try {
            const user = await db.users.get(id);
            if (!user) {
                return {
                    success: false,
                    data: null,
                    message: 'Pengguna tidak ditemukan',
                };
            }

            await db.users.delete(id);

            return {
                success: true,
                data: null,
                message: 'Pengguna berhasil dihapus',
            };
        } catch {
            return {
                success: false,
                data: null,
                message: 'Gagal menghapus pengguna',
            };
        }
    },
};
