'use client';

import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { Category } from '@/db/types/product';

export interface CategoryFormValues {
    name: string;
    parentId: string | null;
}

interface CategoryFormProps {
    initialValues?: Partial<CategoryFormValues>;
    categories: Category[];
    excludeId?: string | null; // id kategori yang sedang diedit, biar gak jadi parent utk dirinya sendiri
    onSubmit: (values: CategoryFormValues) => Promise<void>;
    loading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const defaultValues: CategoryFormValues = {
    name: '',
    parentId: null,
};

export function CategoryForm({
    initialValues,
    categories,
    excludeId,
    onSubmit,
    loading = false,
    submitLabel = 'Simpan Kategori',
    onCancel,
}: CategoryFormProps) {
    const form = useForm<CategoryFormValues>({
        mode: 'controlled',
        initialValues: defaultValues,
        validate: {
            name: (value, values) => {
                const normalized = value.trim();
                if (!normalized) return 'Nama kategori wajib diisi.';

                const duplicate = categories.some(
                    (category) =>
                        category.id !== excludeId &&
                        category.name.toLowerCase() === normalized.toLowerCase() &&
                        (category.parentId ?? null) === values.parentId
                );

                return duplicate ? 'Kategori dengan nama dan parent yang sama sudah tersedia.' : null;
            },
            parentId: (value) =>
                excludeId && value === excludeId ? 'Kategori tidak boleh menjadi parent untuk dirinya sendiri.' : null,
        },
    });

    const { initialize } = form;

    // Reset/isi form nilai awal secara aman ketika initialValues berubah (sama pola dgn ProductForm)
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            initialize({ ...defaultValues, ...initialValues });
        }
    }, [initialValues, initialize]);

    const categoryOptions = categories
        .filter((category) => category.id !== excludeId)
        .map((category) => ({ value: category.id, label: category.name }));

    return (
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
            <Stack>
                <TextInput
                    label="Nama Kategori"
                    placeholder="Contoh: Peralatan Rumah"
                    key={form.key('name')}
                    {...form.getInputProps('name')}
                    required
                />

                <Select
                    label="Parent Kategori"
                    placeholder="Tidak ada parent"
                    data={categoryOptions}
                    key={form.key('parentId')}
                    {...form.getInputProps('parentId')}
                    clearable
                    searchable
                />

                <Group justify="flex-end">
                    {onCancel && (
                        <Button type="button" variant="default" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" loading={loading}>
                        {submitLabel}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
