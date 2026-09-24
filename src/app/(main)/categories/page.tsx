'use client';

import { Button, Card, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Category } from '@/db/types/product';
import { createCategoryColumns } from '@/features/products/categoryColumns';
import { categoryService } from '@/features/products/services/categoryService';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [message] = useState('');
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        void categoryService.loadCategories().then(setCategories);
    }, []);

    const refreshCategories = async () => {
        setCategories(await categoryService.loadCategories());
    };

    const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const resetForm = () => {
        setName('');
        setParentId(null);
        setEditingId(null);
        setError('');
    };

    const handleOpenCreate = () => {
        resetForm();
        open();
    };

    const handleOpenEdit = (category: Category) => {
        setEditingId(category.id);
        setName(category.name);
        setParentId(category.parentId ?? null);
        setError('');
        open();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const normalizedName = name.trim();

        if (!normalizedName) {
            setError('Nama kategori wajib diisi.');
            return;
        }

        const duplicate = categories.some(
            (category) =>
                category.id !== editingId &&
                category.name.toLowerCase() === normalizedName.toLowerCase() &&
                (category.parentId ?? null) === parentId
        );

        if (duplicate) {
            setError('Kategori dengan nama dan parent yang sama sudah tersedia.');
            return;
        }

        if (editingId && parentId === editingId) {
            setError('Kategori tidak boleh menjadi parent untuk dirinya sendiri.');
            return;
        }

        const success = editingId
            ? await categoryService.updateCategory(editingId, normalizedName, parentId)
            : await categoryService.createCategory(normalizedName, parentId);

        if (!success) return; // notifikasi gagal sudah ditembak dari categoryService

        await refreshCategories();
        close();
        resetForm();
    };

    const handleDelete = async (category: Category) => {
        setError('');

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
        getParentName: getParentName,
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

            {error && (
                <Text c="red.7" size="sm">
                    {error}
                </Text>
            )}
            {message && (
                <Text c="green.7" size="sm">
                    {message}
                </Text>
            )}

            <Card withBorder p="md">
                <DataTable
                    columns={categoryColumns}
                    data={categories}
                    getRowKey={(item) => item.id}
                    minWidth={600}
                    emptyText="Belum ada Kategori."
                />
            </Card>

            <Modal
                opened={opened}
                onClose={() => {
                    close();
                    resetForm();
                }}
                title={editingId ? 'Edit Kategori' : 'Tambah Kategori'}
            >
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Nama Kategori"
                            placeholder="Contoh: Peralatan Rumah"
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                            required
                        />

                        <Select
                            label="Parent Kategori"
                            placeholder="Tidak ada parent"
                            data={categoryOptions.filter((category) => category.value !== editingId)}
                            value={parentId}
                            onChange={setParentId}
                            clearable
                            searchable
                        />

                        <Group justify="flex-end">
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    close();
                                    resetForm();
                                }}
                            >
                                Batal
                            </Button>

                            <Button type="submit">{editingId ? 'Simpan Perubahan' : 'Simpan Kategori'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    );
}
