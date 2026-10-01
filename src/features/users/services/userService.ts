import { userRepository } from '@/db/repositories/userRepository';
import type { User } from '@/db/types/user';
import type { PaginatedResult } from '@/types/common';
import { notifyError, notifySuccess } from '@/utils/notifications';
import type { CreateUserInput, UpdateUserInput, UserQueryParams } from '../types';

export const userService = {
    async getUsers(params: UserQueryParams): Promise<PaginatedResult<User>> {
        const result = await userRepository.getAll(params);

        if (!result.success || !result.data) {
            notifyError({
                title: 'Gagal Memuat Pengguna',
                message: result.message,
            });
            return {
                items: [],
                total: 0,
                page: 1,
                pageSize: params.pageSize || 10,
                totalPages: 1,
            };
        }

        return result.data;
    },

    async getUserById(id: string): Promise<User | null> {
        const result = await userRepository.getById(id);

        if (!result.success || !result.data) {
            notifyError({
                title: 'Gagal Memuat Data Pengguna',
                message: result.message,
            });
            return null;
        }

        return result.data;
    },

    async createUser(input: CreateUserInput): Promise<boolean> {
        const result = await userRepository.createUser(input);

        if (!result.success) {
            notifyError({
                title: 'Gagal Menambahkan Pengguna',
                message: result.message,
            });
            return false;
        }

        notifySuccess({
            title: 'Berhasil',
            message: result.message,
        });
        return true;
    },

    async updateUser(id: string, input: UpdateUserInput): Promise<boolean> {
        const result = await userRepository.updateUser(id, input);

        if (!result.success) {
            notifyError({
                title: 'Gagal Memperbarui Pengguna',
                message: result.message,
            });
            return false;
        }

        notifySuccess({
            title: 'Berhasil',
            message: result.message,
        });
        return true;
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await userRepository.deleteUser(id);

        if (!result.success) {
            notifyError({
                title: 'Gagal Menghapus Pengguna',
                message: result.message,
            });
            return false;
        }

        notifySuccess({
            title: 'Berhasil',
            message: result.message,
        });
        return true;
    },
};
