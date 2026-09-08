import { createTheme, type MantineColorsTuple } from '@mantine/core';
import { Outfit } from 'next/font/google';
import inputClasses from './input.module.css';

export const fontOutfit = Outfit({
    subsets: ['latin'],
    style: 'normal',
    variable: '--font-outfit',
    weight: ['300', '400', '500', '600', '700'],
});

const orange: MantineColorsTuple = [
    '#fff7ed',
    '#ffedd5',
    '#fed7aa',
    '#fdba74',
    '#fb923c',
    '#f97316',
    '#ea580c',
    '#c2410c',
    '#9a3412',
    '#7c2d12',
];

const charcoal: MantineColorsTuple = [
    '#f5f5f4',
    '#e7e5e4',
    '#d6d3d1',
    '#a8a29e',
    '#78716c',
    '#57534e',
    '#44403c',
    '#292524',
    '#1c1917',
    '#0c0a09',
];

const cream: MantineColorsTuple = [
    '#fbf9f5',
    '#f5f0e6',
    '#ece6dc',
    '#dfd5c4',
    '#d4be99',
    '#bfa378',
    '#a88a5d',
    '#876e48',
    '#675336',
    '#483a25',
];

export const theme = createTheme({
    primaryColor: 'primary',
    primaryShade: 6,
    colors: {
        primary: orange,
        neutral: charcoal,
        surface: cream,
    },
    fontFamily: `${fontOutfit.style.fontFamily}, sans-serif`,
    headings: {
        fontFamily: `${fontOutfit.style.fontFamily}, sans-serif`,
        fontWeight: '600',
    },
    defaultRadius: 'md',
    components: {
        Card: {
            defaultProps: {
                radius: 'lg',
                p: 'xl',
                bd: '1px solid #ece6dc',
                shadow: 'sm',
            },
        },
        Button: {
            defaultProps: {
                size: 'md',
            },
        },
        InputWrapper: {
            defaultProps: {
                inputWrapperOrder: ['label', 'description', 'input', 'error'],
            },
            styles: {
                label: {
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: 4,
                },
            },
        },
        Input: {
            defaultProps: {
                size: 'md',
            },
            classNames: {
                input: inputClasses.input,
                section: inputClasses.section,
            },
        },
        PasswordInput: {
            defaultProps: {
                size: 'md',
            },
            classNames: {
                input: inputClasses.input,
                section: inputClasses.section,
                visibilityToggle: inputClasses.visibilityToggle,
            },
        },
    },
});
