'use client';

import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
    const [isMini, { toggle: toggleMini }] = useDisclosure(false);

    return (
        <AppShell
            navbar={{
                width: isMini ? 72 : 250,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened },
            }}
            transitionDuration={200}
            transitionTimingFunction="ease"
        >
            <AppShell.Navbar
                p="md"
                bg="neutral.9"
                style={{
                    borderRight: '1px solid var(--mantine-color-neutral-8)',
                    zIndex: 101,
                }}
            >
                <AppSidebar isMini={isMini} toggleMini={toggleMini} onNavigate={closeMobile} />
            </AppShell.Navbar>

            <AppShell.Main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Box
                    h={64}
                    bg="white"
                    top={0}
                    style={{
                        borderBottom: '1px solid var(--mantine-color-surface-2)',
                        position: 'sticky',
                        zIndex: 100,
                    }}
                >
                    <AppHeader opened={mobileOpened} toggleMobile={toggleMobile} />
                </Box>

                <Box p="md" flex={1}>
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
