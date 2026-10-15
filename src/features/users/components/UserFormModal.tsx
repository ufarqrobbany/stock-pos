'use client';

import { Button, Group, Modal, PasswordInput, Select, SimpleGrid, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { USER_FORM_ROLE_OPTIONS } from '../constants';
import { useUserContext } from '../context/UserContext';
import type { UserFormData } from '../schemas/userSchema';

const defaultValues: UserFormData = {
    name: '',
    username: '',
    password: '',
    role: 'CASHIER',
    isActive: true,
};

export function UserFormModal() {
    const { isModalOpen, closeModal, editingUser, isSelfEditing, isSubmitting, formSchema, handleFormSubmit } =
        useUserContext();

    const isEdit = Boolean(editingUser);

    const form = useForm<UserFormData>({
        initialValues: defaultValues,
        validate: zod4Resolver(formSchema),
        validateInputOnBlur: true,
    });

    const { setValues, reset, clearErrors } = form;

    useEffect(() => {
        if (isModalOpen) {
            if (editingUser) {
                setValues({
                    name: editingUser.name,
                    username: editingUser.username,
                    password: '',
                    role: editingUser.role,
                    isActive: editingUser.isActive,
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isModalOpen, editingUser, setValues, reset, clearErrors]);

    return (
        <Modal
            opened={isModalOpen}
            onClose={() => !isSubmitting && closeModal()}
            title={
                <Text fw={600} size="md">
                    {isEdit ? 'Ubah Pengguna' : 'Tambah Pengguna'}
                </Text>
            }
            centered
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleFormSubmit)} noValidate>
                <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <TextInput
                            label="Nama Lengkap"
                            placeholder="Contoh: John Doe"
                            {...form.getInputProps('name')}
                        />
                        <TextInput label="Username" placeholder="Contoh: johndoe" {...form.getInputProps('username')} />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Select
                            label="Role Akses"
                            data={USER_FORM_ROLE_OPTIONS}
                            allowDeselect={false}
                            disabled={isSelfEditing}
                            {...form.getInputProps('role')}
                        />
                        <PasswordInput
                            label={isEdit ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi'}
                            placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Buat kata sandi akun'}
                            {...form.getInputProps('password')}
                        />
                    </SimpleGrid>

                    <Group justify="space-between" align="center" mt="xs">
                        <Switch
                            label="Akun Aktif"
                            checked={form.values.isActive}
                            disabled={isSelfEditing}
                            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
                        />
                        <Group gap="xs">
                            <Button variant="default" size="sm" onClick={closeModal} disabled={isSubmitting}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" loading={isSubmitting}>
                                {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
