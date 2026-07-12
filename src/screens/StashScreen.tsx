import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { theme } from '../theme/theme';
import { ArrowLeft, Edit2, Flame, Trash2 } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';

export const StashScreen = ({ navigation }: any) => {
    const {
        currentBalance,
        monthlyIncome, setMonthlyIncome,
        incomeEntries,
        expenses, removeExpense
    } = useFinance();

    const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());

    useEffect(() => {
        const num = parseFloat(incomeInput);
        if (!isNaN(num) && num >= 0) {
            setMonthlyIncome(num);
        }
    }, [incomeInput]);

    const totalBurn = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const burnPercentage = monthlyIncome > 0 ? Math.min(100, Math.max(0, (totalBurn / monthlyIncome) * 100)) : 0;

    return (
        <Container safeArea style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft color={theme.colors.textMain} size={28} />
                </TouchableOpacity>
                <Typography variant="label" style={styles.headerBadge} color={theme.colors.primary}>
                    CONFIGURATION
                </Typography>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.titleSection}>
                    <Typography variant="h1" style={styles.title}>THE STASH</Typography>
                    <View style={styles.row}>
                        <View style={styles.greenBar} />
                        <Typography variant="mono" color={theme.colors.textMuted} style={styles.subtext}>
                            INCOME /// EXPENSE MATRIX
                        </Typography>
                    </View>
                </View>

                {/* Current Balance (Read Only) */}
                <View style={styles.section}>
                    <Typography variant="label" color={theme.colors.textMuted}>CURRENT BALANCE</Typography>
                    <Typography variant="h1" color={theme.colors.primary} style={styles.balanceDisplay}>
                        ${currentBalance.toFixed(2)}
                    </Typography>
                    <Typography variant="mono" color={theme.colors.border} style={styles.smallHint}>
                        Auto-calculated from deposits &minus; spending
                    </Typography>
                </View>

                {/* Recent Deposits */}
                {incomeEntries.length > 0 && (
                    <View style={styles.section}>
                        <Typography variant="label" color={theme.colors.textMuted}>RECENT DEPOSITS</Typography>
                        {incomeEntries.slice(-5).reverse().map(entry => (
                            <View key={entry.id} style={styles.expenseRow}>
                                <View>
                                    <Typography variant="body" style={styles.expenseName}>{entry.note}</Typography>
                                    <Typography variant="label" color={theme.colors.border}>
                                        {entry.date.toLocaleDateString()}
                                    </Typography>
                                </View>
                                <Typography variant="mono" color="#008800">
                                    +${entry.amount.toFixed(2)}
                                </Typography>
                            </View>
                        ))}
                    </View>
                )}

                {/* Monthly Income */}
                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Typography variant="label" color={theme.colors.textMuted}>FIXED MONTHLY INCOME</Typography>
                        <Typography variant="label" color={theme.colors.primary}>EDITABLE</Typography>
                    </View>
                    <View style={styles.inputContainer}>
                        <Typography variant="mono" color={theme.colors.textMuted} style={styles.currency}>$</Typography>
                        <TextInput
                            style={styles.inputMono}
                            value={incomeInput}
                            onChangeText={setIncomeInput}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.colors.border}
                        />
                    </View>
                    <Typography variant="mono" color={theme.colors.border} style={styles.smallHint}>
                        Set to 0 if no fixed job — use "Add Money" in settings instead
                    </Typography>
                </View>

                {/* Fixed Burn */}
                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Typography variant="h2" color={theme.colors.textMain} style={styles.sectionTitle}>
                            FIXED BURN
                        </Typography>
                        <Flame color={theme.colors.primary} size={20} />
                    </View>

                    {expenses.map(expense => (
                        <View key={expense.id} style={styles.expenseRow}>
                            <View>
                                <Typography variant="h2" style={styles.expenseName}>{expense.name}</Typography>
                            </View>
                            <View style={styles.row}>
                                <Typography variant="mono" color={theme.colors.textMain}>
                                    -${expense.amount.toFixed(0)}
                                </Typography>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert('Remove Expense', `Remove "${expense.name}"?`, [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Remove', style: 'destructive', onPress: () => removeExpense(expense.id) }
                                        ]);
                                    }}
                                    style={{ marginLeft: 8 }}
                                >
                                    <Trash2 color={theme.colors.textMuted} size={16} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {expenses.length === 0 && (
                        <Typography variant="body" color={theme.colors.border} style={{ marginTop: 8 }}>
                            No fixed expenses yet.
                        </Typography>
                    )}
                </View>

            </ScrollView>

            {/* Footer Total Burn */}
            <View style={styles.footer}>
                <View style={styles.rowBetween}>
                    <View>
                        <Typography variant="label" color={theme.colors.danger}>TOTAL BURN</Typography>
                        <Typography variant="label" color={theme.colors.textMuted}>FIXED MONTHLY OUTGOING</Typography>
                    </View>
                    <Typography variant="mono" style={styles.totalBurnText}>
                        $ {totalBurn} <Typography variant="label" color={theme.colors.textMuted}>/mo</Typography>
                    </Typography>
                </View>
                <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${burnPercentage}%` }]} />
                </View>
                <View style={styles.rowBetween}>
                    <Typography variant="label" color={theme.colors.textMuted} style={styles.tinyText}>0%</Typography>
                    <Typography variant="label" color={theme.colors.textMuted} style={styles.tinyText}>100%</Typography>
                </View>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#0A0A0A' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    iconBtn: {},
    headerBadge: { borderWidth: 1, borderColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 4 },
    scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.giant },
    titleSection: { marginBottom: theme.spacing.xl },
    title: { fontSize: 56, lineHeight: 56 },
    row: { flexDirection: 'row', alignItems: 'center' },
    greenBar: { width: 2, height: 14, backgroundColor: theme.colors.primary, marginRight: theme.spacing.md },
    subtext: { fontSize: 12 },
    section: { marginBottom: theme.spacing.xxl },
    balanceDisplay: { fontSize: 48, lineHeight: 52, marginVertical: 4 },
    smallHint: { fontSize: 10, marginTop: 4 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.sm, marginTop: theme.spacing.md },
    currency: { fontSize: 24, marginRight: theme.spacing.sm },
    inputMono: { flex: 1, fontFamily: 'SpaceMono_400Regular', fontSize: 32, color: theme.colors.textMain, textAlign: 'right' },
    sectionTitle: { fontSize: 24, marginBottom: theme.spacing.md },
    expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    expenseName: { fontSize: 20, lineHeight: 24 },
    footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border },
    totalBurnText: { fontSize: 32 },
    barContainer: { height: 8, backgroundColor: theme.colors.surface, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs },
    barFill: { height: '100%', backgroundColor: theme.colors.danger },
    tinyText: { fontSize: 8 },
});
