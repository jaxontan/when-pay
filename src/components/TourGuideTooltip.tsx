import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../theme/theme';

export const TourGuideTooltip = ({
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrev,
    handleStop,
    currentStep,
}: any) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Typography variant="body" color={theme.colors.textMain} style={styles.text}>
                    {currentStep?.text}
                </Typography>
            </View>
            <View style={styles.footer}>
                {!isFirstStep ? (
                    <TouchableOpacity onPress={handlePrev} style={styles.btn}>
                        <Typography variant="mono" color={theme.colors.textMuted}>PREV</Typography>
                    </TouchableOpacity>
                ) : <View style={styles.btn} />}

                <View style={styles.dots}>
                    {/* We can't easily do dots without total steps, just empty space is fine */}
                </View>

                {!isLastStep ? (
                    <TouchableOpacity onPress={handleNext} style={styles.btnNext}>
                        <Typography variant="mono" color={theme.colors.background}>NEXT -&gt;</Typography>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleStop} style={styles.btnNext}>
                        <Typography variant="mono" color={theme.colors.background}>GOT IT</Typography>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.sharp,
        borderWidth: 1,
        borderColor: theme.colors.border,
        width: 300,
        overflow: 'hidden',
    },
    content: {
        padding: theme.spacing.lg,
    },
    text: {
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    btn: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnNext: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
    },
    dots: {
        flex: 1,
    }
});
