import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'body' | 'mono' | 'label';
    color?: string;
    align?: 'left' | 'center' | 'right';
    uppercase?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    color = theme.colors.textMain,
    align = 'left',
    uppercase = false,
    style,
    children,
    ...props
}) => {
    const getStyle = () => {
        switch (variant) {
            case 'h1':
                return styles.h1;
            case 'h2':
                return styles.h2;
            case 'mono':
                return styles.mono;
            case 'label':
                return styles.label;
            case 'body':
            default:
                return styles.body;
        }
    };

    return (
        <Text
            style={[
                getStyle(),
                { color, textAlign: align, textTransform: uppercase ? 'uppercase' : 'none' },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    h1: {
        fontFamily: theme.fonts.display,  // Anton — only used for big impact headings
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: 0,
        lineHeight: 48,
    },
    h2: {
        fontFamily: theme.fonts.heading,  // Inter Bold — readable at medium sizes
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.3,
        lineHeight: 32,
    },
    body: {
        fontFamily: theme.fonts.body,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 26,
        letterSpacing: 0.2,
    },
    mono: {
        fontFamily: theme.fonts.mono,
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    label: {
        fontFamily: theme.fonts.body,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
        lineHeight: 18,
    },
});
