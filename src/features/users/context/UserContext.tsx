'use client';

import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/dist/client/components/navigation';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import type { User, UserRole } from '@/db/types/user';
import { userService } from '@/features/users/services/userService';
import type { CreateUserInput, UpdateUserInput } from '@/features/users/types';
import { confirmDelete } from '@/utils/confirmModal';
import { setSessionCookie } from '@/utils/session';
import { type UsersState, useUsers } from '../hooks/useUsers';
import { createUserSchema, type UserFormData, updateUserSchema } from '../schemas/userSchema';

interface UserContextValue extends UsersState {
    currentUserId?: string;
    isModalOpen: boolean;
    editingUser: User | null;
    isSelfEditing: boolean;
    isSubmitting: boolean;
    formSchema: typeof createUserSchema | typeof updateUserSchema;
    openCreateModal: () => void;
    openEditModal: (user: User) => void;
    closeModal: () => void;
    handleDeleteUser: (user: User) => void;
    handleFormSubmit: (values: UserFormData) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
    children: ReactNode;
    currentUserId?: string;
}

export function UserProvider({ children, currentUserId }: UserProviderProps) {
    const router = useRouter();
    const userState = useUsers();
    const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSelfEditing = Boolean(editingUser && editingUser.id === currentUserId);
    const formSchema = editingUser ? updateUserSchema : createUserSchema;

    const openCreateModal = useCallback(() => {
        setEditingUser(null);
        openModal();
    }, [openModal]);

    const openEditModal = useCallback(
        (user: User) => {
            setEditingUser(user);
            openModal();
        },
        [openModal]
    );

    const handleDeleteUser = useCallback(
        (user: User) => {
            confirmDelete({
                title: 'Hapus Pengguna',
                entityType: 'akun',
                itemName: user.name,
                onConfirm: async () => {
                    const success = await userService.deleteUser(user.id);
                    if (success) {
                        await userState.refresh();
                    }
                },
            });
        },
        [userState]
    );

    const handleFormSubmit = async (values: UserFormData) => {
        setIsSubmitting(true);
        try {
            const payload: CreateUserInput | UpdateUserInput = {
                name: values.name.trim(),
                username: values.username.trim(),
                role: values.role as UserRole,
                isActive: values.isActive,
            };

            if (values.password?.trim()) {
                payload.password = values.password.trim();
            }

            const success = editingUser
                ? await userService.updateUser(editingUser.id, payload)
                : await userService.createUser(payload as CreateUserInput);

            if (success) {
                if (isSelfEditing && editingUser) {
                    await setSessionCookie({
                        id: editingUser.id,
                        name: payload.name ?? editingUser.name,
                        username: payload.username ?? editingUser.username,
                        role: payload.role ?? editingUser.role,
                    });
                    router.refresh();
                }

                closeModal();
                await userState.refresh();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                ...userState,
                currentUserId,
                isModalOpen,
                editingUser,
                isSelfEditing,
                isSubmitting,
                formSchema,
                openCreateModal,
                openEditModal,
                closeModal,
                handleDeleteUser,
                handleFormSubmit,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return ctx;
}
