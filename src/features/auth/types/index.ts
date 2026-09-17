import type { UserRole } from '@/db/types/user';

export interface SessionUser {
    id: string;
    name: string;
    username: string;
    role: UserRole;
}
