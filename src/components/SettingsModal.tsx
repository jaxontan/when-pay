import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../theme/theme';
import { X, Plus } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const { currentBalance, monthlyIncome, setMonthlyIncome, addIncome } = useFinance();

    const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
    const [addMoneyAmount, setAddMoneyAmount] = useState('');
    const [addMoneyNote, setAddMoneyNote] = useState('');

    useEffect(() => {
        if (visible) {
            setIncomeInput(monthlyIncome > 0 ? monthlyIncome.toString() : '');
            setAddMoneyAmount('');
            setAddMoneyNote('');
        }
    }, [visible]);

    const handleSaveIncome = () => {
        const inc = parseFloat(incomeInput);
        if (!isNaN(inc) && inc >= 0) {
            setMonthlyIncome(inc);
        } else {
            setMonthlyIncome(0);
        }
    };

    const handleAddMoney = () => {
        const amount = parseFloat(addMoneyAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('INVALID', 'Enter a positive amount.');
            return;
        }
        addIncome(amount, addMoneyNote || 'DEPOSIT');
        setAddMoneyAmount('');
        setAddMoneyNote('');
        Alert.alert('FUNDS ADDED', `$${amount.toFixed(2)} deposited to your balance.`);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Typography variant="label" color={theme.colors.primary}>
                            SETTINGS
                        </Typography>
                        <TouchableOpacity onPress={() => { handleSaveIncome(); onClose(); }} style={styles.closeBtn}>
                            <X color={theme.colors.textMain} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Current Balance (read-only) */}
                    <View style={styles.balanceDisplay}>
                        <Typography variant="label" color={theme.colors.textMuted}>
                            CURRENT BALANCE
                        </Typography>
                        <Typography variant="h1" color={theme.colors.primary} style={styles.balanceValue}>
                            ${currentBalance.toFixed(2)}
                        </Typography>
                        <Typography variant="mono" color={theme.colors.border} style={styles.balanceHint}>
                            Computed from deposits &minus; spending
                        </Typography>
                    </View>

                    <View style={styles.divider} />

                    {/* Add Money (deposit) */}
                    <View style={styles.fieldGroup}>
                        <Typography variant="label" color={theme.colors.textMuted}>
                            ADD MONEY
                        </Typography>
                        <View style={styles.inputRow}>
                            <Typography variant="h2" color={theme.colors.primary} style={styles.currency}>$</Typography>
                            <TextInput
                                style={styles.input}
                                value={addMoneyAmount}
                                onChangeText={setAddMoneyAmount}
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.border}
                                placeholder="0.00"
                            />
                        </View>
                        <TextInput
                            style={styles.noteInput}
                            value={addMoneyNote}
                            onChangeText={setAddMoneyNote}
                            placeholderTextColor={theme.colors.border}
                            placeholder="NOTE (e.g. salary, freelance, gift)"
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddMoney}>
                            <Plus color={theme.colors.background} size={18} />
                            <Typography variant="label" color={theme.colors.background} style={{ marginLeft: 4 }}>
                                ADD TO BALANCE
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Monthly Income (fixed) */}
                    <View style={styles.fieldGroup}>
                        <Typography variant="label" color={theme.colors.textMuted}>
                            FIXED MONTHLY INCOME
                        </Typography>
                        <Typography variant="mono" color={theme.colors.border} style={styles.fieldHint}>
                            Set to 0 if no fixed job
                        </Typography>
                        <View style={styles.inputRow}>
                            <Typography variant="h2" color={theme.colors.primary} style={styles.currency}>$</Typography>
                            <TextInput
                                style={styles.input}
                                value={incomeInput}
                                onChangeText={setIncomeInput}
                                onBlur={handleSaveIncome}
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.border}
                                placeholder="0"
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Save & Close */}
                    <TouchableOpacity style={styles.saveBtn} onPress={() => { handleSaveIncome(); onClose(); }}>
                        <Typography variant="label" color={theme.colors.background}>
                            DONE
                        </Typography>
                    </TouchableOpacity>

                    <Typography variant="mono" color={theme.colors.border} style={styles.footerText}>
                        /// DATA STORED LOCALLY ///
                    </Typography>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.giant,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        padding: theme.spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.md,
    },
    balanceDisplay: {
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    balanceValue: {
        fontSize: 48,
        lineHeight: 52,
        marginVertical: 4,
    },
    balanceHint: {
        fontSize: 10,
    },
    fieldGroup: {
        marginBottom: theme.spacing.sm,
    },
    fieldHint: {
        fontSize: 10,
        marginTop: 2,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    currency: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: 'SpaceMono_400Regular',
        fontSize: 28,
        color: theme.colors.textMain,
        textAlign: 'right',
    },
    noteInput: {
        fontFamily: 'SpaceMono_400Regular',
        fontSize: 14,
        color: theme.colors.textMain,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: theme.spacing.sm,
        marginTop: theme.spacing.xs,
    },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        marginTop: theme.spacing.md,
    },
});
