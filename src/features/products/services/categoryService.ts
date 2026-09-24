import { categoryRepository } from '@/db/repositories/categoryRepository';
import type { Category } from '@/db/types/product';
import { notifyError, notifySuccess } from '@/utils/notifications';

export const categoryService = {
    async loadCategories(): Promise<Category[]> {
        const result = await categoryRepository.loadCategories();
        if (!result.success || !result.data) {
            notifyError({ title: 'Gagal', message: 'Gagal memuat daftar kategori.' });
            return [];
        }
        return result.data;
    },

    async createCategory(name: string, parentId: string | null = null): Promise<boolean> {
        const result = await categoryRepository.createCategory(name, parentId);
        if (!result.success) {
            notifyError({ title: 'Gagal menambahkan kategori.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil menambahkan kategori.', message: result.message });
        return true;
    },

    async deleteCategory(categoryId: string, allCategories: Category[]): Promise<boolean> {
        const result = await categoryRepository.deleteCategory(categoryId, allCategories);
        if (!result.success) {
            notifyError({ title: 'Gagal menghapus kategori.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil menghapus kategori.', message: result.message });
        return true;
    },

    async updateCategory(id: string, name: string, parentId: string | null = null): Promise<boolean> {
        const result = await categoryRepository.updateCategory(id, name, parentId);
        if (!result.success) {
            notifyError({ title: 'Gagal memperbarui kategori.', message: result.message });
            return false;
        }

        notifySuccess({ title: 'Berhasil memperbarui kategori.', message: result.message });
        return true;
    },
};
