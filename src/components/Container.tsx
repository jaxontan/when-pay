import React from 'react';
import { View, StyleSheet, ViewProps, SafeAreaView } from 'react-native';
import { theme } from '../theme/theme';

interface ContainerProps extends ViewProps {
    safeArea?: boolean;
    padded?: boolean;
    centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
    safeArea = false,
    padded = true,
    centered = false,
    style,
    children,
    ...props
}) => {
    const containerStyle = [
        styles.container,
        padded && styles.padded,
        centered && styles.centered,
        style,
    ];

    if (safeArea) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={containerStyle} {...props}>
                    {children}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={containerStyle} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    padded: {
        paddingHorizontal: theme.spacing.lg,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
