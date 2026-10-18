import { db } from '@/db';
import type { Result } from '@/types/common';
import type { Category } from '../types/product';

export const categoryRepository = {
    async loadCategories(): Promise<Result<Category[]>> {
        const categories = await db.categories.toArray();
        return { success: true, data: categories };
    },

    async createCategory(name: string, parentId: string | null): Promise<Result<string>> {
        const newId = crypto.randomUUID();
        await db.categories.add({
            id: newId,
            name: name.trim(),
            parentId: parentId || null,
        });
        return { success: true, data: newId, message: 'Kategori berhasil dibuat.' };
    },

    async deleteCategory(categoryId: string, allCategories: Category[]): Promise<Result<void>> {
        const productCount = await db.products.where('categoryId').equals(categoryId).count();
        if (productCount > 0) {
            return {
                success: false,
                data: null,
                message: 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.',
            };
        }

        const childCount = allCategories.filter((item) => item.parentId === categoryId).length;
        if (childCount > 0) {
            return {
                success: false,
                data: null,
                message: 'Kategori tidak dapat dihapus karena memiliki subkategori.',
            };
        }

        await db.categories.delete(categoryId);
        return { success: true, data: null, message: 'Kategori berhasil dihapus.' };
    },

    async updateCategory(id: string, name: string, parentId: string | null = null): Promise<Result<void>> {
        await db.categories.update(id, {
            name: name.trim(),
            parentId: parentId || null,
        });
        return { success: true, data: null, message: 'Kategori berhasil diperbarui.' };
    },
};
