'use client';

import { AppShell, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainSidebar } from '@/components/layout/MainSidebar';
import type { SessionUser } from '@/features/auth/types';
import { clearSessionCookie } from '@/utils/session';

interface MainLayoutProps {
    children: React.ReactNode;
    user: SessionUser | null;
}

export function MainLayout({ children, user }: MainLayoutProps) {
    const router = useRouter();

    const theme = useMantineTheme();
    const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

    const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(false);
    const [isSidebarCompact, { toggle: toggleSidebarCompact }] = useDisclosure(false);
    const activeSidebarCompact = Boolean(isDesktop && isSidebarCompact);

    const handleLogout = async () => {
        await clearSessionCookie();
        router.replace('/login');
    };

    return (
        <AppShell
            layout="alt"
            header={{ height: 64 }}
            navbar={{
                width: activeSidebarCompact ? 72 : 250,
                breakpoint: 'sm',
                collapsed: { mobile: !sidebarOpened },
            }}
        >
            <AppShell.Header bd="1px solid var(--mantine-color-surface-2)">
                <MainHeader sidebarOpened={sidebarOpened} toggleSidebar={toggleSidebar} user={user} />
            </AppShell.Header>
            <AppShell.Navbar p="md" bg="neutral.9">
                <MainSidebar
                    isCompact={activeSidebarCompact}
                    toggleCompact={toggleSidebarCompact}
                    onClose={closeSidebar}
                    onLogout={handleLogout}
                    userRole={user?.role}
                />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
