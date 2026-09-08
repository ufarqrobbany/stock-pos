import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type CustomColors = 'primary' | 'neutral' | 'surface' | DefaultMantineColor;

declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<CustomColors, MantineColorsTuple>;
    }
}
