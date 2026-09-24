'use client';

import { Button, Card, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Category } from '@/db/types/product';
import { createCategoryColumns } from '@/features/products/categoryColumns';
import { CategoryForm, type CategoryFormValues } from '@/features/products/components/categoryForm';
import { categoryService } from '@/features/products/services/categoryService';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [initialValues, setInitialValues] = useState<Partial<CategoryFormValues>>({});
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        void categoryService.loadCategories().then(setCategories);
    }, []);

    const refreshCategories = async () => {
        setCategories(await categoryService.loadCategories());
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setInitialValues({});
        open();
    };

    const handleOpenEdit = (category: Category) => {
        setEditingId(category.id);
        setInitialValues({ name: category.name, parentId: category.parentId ?? null });
        open();
    };

    const handleSubmit = async (values: CategoryFormValues) => {
        setLoading(true);

        const success = editingId
            ? await categoryService.updateCategory(editingId, values.name.trim(), values.parentId)
            : await categoryService.createCategory(values.name.trim(), values.parentId);

        setLoading(false);
        if (!success) return; // notifikasi gagal sudah ditembak dari categoryService

        await refreshCategories();
        close();
    };

    const handleDelete = async (category: Category) => {
        const success = await categoryService.deleteCategory(category.id, categories);
        if (!success) return;

        await refreshCategories();
    };

    const getParentName = (parentIdValue: string | null | undefined) => {
        if (!parentIdValue) return '-';
        return categories.find((category) => category.id === parentIdValue)?.name ?? '-';
    };

    const categoryColumns = createCategoryColumns({
        onEdit: handleOpenEdit,
        onDelete: handleDelete,
        getParentName,
    });

    return (
        <Stack gap="md">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Kelola Kategori</Title>
                    <Text c="neutral.4" size="sm">
                        Tambah dan kelola kategori produk.
                    </Text>
                </div>

                <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
                    Tambah Kategori
                </Button>
            </Group>

            <Card withBorder p="md">
                <DataTable
                    columns={categoryColumns}
                    data={categories}
                    getRowKey={(item) => item.id}
                    minWidth={600}
                    emptyText="Belum ada Kategori."
                />
            </Card>

            <Modal opened={opened} onClose={close} title={editingId ? 'Edit Kategori' : 'Tambah Kategori'}>
                <CategoryForm
                    initialValues={initialValues}
                    categories={categories}
                    excludeId={editingId}
                    onSubmit={handleSubmit}
                    loading={loading}
                    submitLabel={editingId ? 'Simpan Perubahan' : 'Simpan Kategori'}
                    onCancel={close}
                />
            </Modal>
        </Stack>
    );
}
