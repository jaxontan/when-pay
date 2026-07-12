import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';

export const OnboardingScreen = () => {
    const { completeOnboarding } = useFinance();
    const [step, setStep] = useState(1);
    const [initialBalance, setInitialBalance] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else {
            const bal = parseFloat(initialBalance) || 0;
            const inc = parseFloat(monthlyIncome) || 0;
            completeOnboarding(bal, inc);
        }
    };

    return (
        <Container safeArea style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <Typography variant="mono" color={theme.colors.primary} style={styles.steps}>
                        /// INIT {step}/3
                    </Typography>
                </View>

                <View style={styles.content}>
                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <Typography variant="h1" style={styles.title}>WELCOME{"\n"}TO THE{"\n"}LINEUP</Typography>
                            <Typography variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
                                Before you start planning your drops, we need to calibrate the algorithm.
                            </Typography>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <Typography variant="h1" style={styles.title}>THE{"\n"}STASH</Typography>
                            <Typography variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
                                How much liquid cash do you currently have available for grails?
                            </Typography>
                            <View style={styles.inputContainer}>
                                <Typography variant="h1" color={theme.colors.primary} style={styles.currency}>$</Typography>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.border}
                                    keyboardType="numeric"
                                    value={initialBalance}
                                    onChangeText={setInitialBalance}
                                    autoFocus
                                />
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <Typography variant="h1" style={styles.title}>THE{"\n"}INFLOW</Typography>
                            <Typography variant="body" color={theme.colors.textMuted} style={styles.subtitle}>
                                What is your guaranteed monthly income? This fuels your projected timeline.
                            </Typography>
                            <View style={styles.inputContainer}>
                                <Typography variant="h1" color={theme.colors.primary} style={styles.currency}>$</Typography>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.border}
                                    keyboardType="numeric"
                                    value={monthlyIncome}
                                    onChangeText={setMonthlyIncome}
                                    autoFocus
                                />
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Button
                        title={step === 3 ? "INITIALIZE ALGORITHM →" : "CONTINUE →"}
                        onPress={handleNext}
                    />
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.lg,
    },
    steps: {
        fontSize: 12,
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        justifyContent: 'center',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 64,
        lineHeight: 64,
        marginBottom: theme.spacing.lg,
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.sm,
    },
    currency: {
        fontSize: 64,
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: theme.fonts.display,
        fontSize: 64,
        color: theme.colors.textMain,
    },
    footer: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.giant,
    }
});
