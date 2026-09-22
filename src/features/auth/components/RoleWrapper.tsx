import type { ReactNode } from 'react';
import type { UserRole } from '@/db/types/user';
import type { SessionUser } from '@/features/auth/types';
import { AccessDeniedView } from './AccessDeniedView';

interface RoleWrapperProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    user: SessionUser | null;
    type?: 'page' | 'component';
}

export function RoleWrapper({ children, allowedRoles, user, type = 'page' }: RoleWrapperProps) {
    const isAllowed = user ? allowedRoles.includes(user.role) : false;

    if (!isAllowed) {
        if (type === 'page') {
            return <AccessDeniedView />;
        }
        return null;
    }

    return children;
}
