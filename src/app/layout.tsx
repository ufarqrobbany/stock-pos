import '@mantine/core/styles.css';
import '@/styles/globals.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import type { Metadata } from 'next';
import { fontOutfit, theme } from '@/styles/theme';

export const metadata: Metadata = {
    title: 'StockPOS',
    description: 'Inventory Management System & Point of Sale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id" className={fontOutfit.variable} suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme="light">
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
