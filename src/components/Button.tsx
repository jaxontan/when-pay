import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps, View } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
    title?: string;
    variant?: 'primary' | 'outline' | 'ghost';
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    icon,
    style,
    ...props
}) => {
    const getContainerStyle = () => {
        switch (variant) {
            case 'outline':
                return [styles.container, styles.outline];
            case 'ghost':
                return [styles.container, styles.ghost];
            case 'primary':
            default:
                return [styles.container, styles.primary];
        }
    };

    const getTextColor = () => {
        if (variant === 'primary') return theme.colors.background;
        return theme.colors.textMain;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[getContainerStyle(), style]}
            {...props}
        >
            <View style={styles.content}>
                {icon && <View style={title ? styles.iconMargin : undefined}>{icon}</View>}
                {title && (
                    <Typography variant="label" color={getTextColor()} uppercase>
                        {title}
                    </Typography>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radii.sharp,
        paddingHorizontal: theme.spacing.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: theme.colors.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    iconMargin: {
        marginRight: theme.spacing.sm,
    },
});
