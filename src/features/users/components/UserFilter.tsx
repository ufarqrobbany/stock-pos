'use client';

import { CloseButton, Flex, Group, Select, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { ROLE_OPTIONS } from '../constants';
import { useUserContext } from '../context/UserContext';
import type { UserRoleFilter } from '../types';

export function UserFilter() {
    const { filter } = useUserContext();

    return (
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
            <TextInput
                w={360}
                placeholder="Cari nama atau username..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                    filter.search && (
                        <CloseButton
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => filter.setSearch('')}
                        />
                    )
                }
                value={filter.search}
                onChange={(e) => filter.setSearch(e.currentTarget.value)}
            />

            <Flex direction="row" align="center" gap="sm">
                <Text size="sm" fw={500}>
                    Role
                </Text>
                <Select
                    w={180}
                    allowDeselect={false}
                    data={ROLE_OPTIONS}
                    value={filter.role}
                    onChange={(val) => filter.setRole(val as UserRoleFilter)}
                />
            </Flex>
        </Group>
    );
}
