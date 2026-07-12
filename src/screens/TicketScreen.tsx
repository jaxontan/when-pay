import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { useFinance, PaymentType } from '../context/FinanceContext';
import { calculateProjectedBalance, getRiskLevel } from '../utils/math';

const INSTALLMENT_OPTIONS = [3, 6, 12, 24];

export const TicketScreen = ({ navigation, route, itemIdProp, onBack }: any) => {
    const itemId = itemIdProp || route?.params?.itemId;
    const { currentBalance, monthlyIncome, expenses, grails, markGrailAcquired, removeGrail } = useFinance();
    const [showPayOptions, setShowPayOptions] = useState(false);
    const [showInstallments, setShowInstallments] = useState(false);
    const [customMonths, setCustomMonths] = useState('');

    const grail = grails.find(g => g.id === itemId);

    const ticketData = useMemo(() => {
        if (!grail) return null;

        const sortedGrails = [...grails].sort((a, b) => a.date.getTime() - b.date.getTime());
        let priorCosts = 0;
        for (const g of sortedGrails) {
            if (g.id === grail.id) break;
            if (g.status === 'PLANNED') {
                priorCosts += g.price;
            }
        }

        const math = calculateProjectedBalance(
            grail.date,
            currentBalance,
            monthlyIncome,
            expenses,
            priorCosts
        );

        const projectedBalance = math.projectedBalance - grail.price;
        const risk = getRiskLevel(projectedBalance, monthlyIncome);
        const approved = risk !== 'danger';

        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const formattedDate = `${monthNames[grail.date.getMonth()]} ${grail.date.getDate()}`;

        return {
            name: grail.name,
            price: grail.price,
            date: formattedDate,
            status: grail.status === 'ACQUIRED' ? 'ACQUIRED' : (approved ? 'APPROVED' : 'DENIED'),
            isAcquired: grail.status === 'ACQUIRED',
            paymentType: grail.paymentType,
            installmentMonths: grail.installmentMonths,
            currentBalance: currentBalance,
            projectedIncome: math.totalIncome,
            expensesOffset: math.totalExpenses + priorCosts,
            projectedBalance,
            riskLevel: risk,
        };
    }, [grail, currentBalance, monthlyIncome, expenses, grails]);

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    if (!ticketData || !grail) {
        return (
            <Container safeArea style={styles.container}>
                <View style={styles.emptyState}>
                    <Typography variant="mono" color={theme.colors.border} style={styles.emptyMono}>
                        /// SELECT AN ITEM ///
                    </Typography>
                    <Typography variant="h2" color={theme.colors.textMuted} style={styles.emptyTitle}>
                        NO DROP SELECTED
                    </Typography>
                    <Typography variant="body" color={theme.colors.border} style={styles.emptyBody}>
                        Tap a drop from the lineup to view its details here.
                    </Typography>
                </View>
            </Container>
        );
    }

    const item = ticketData;

    const handlePayFull = () => {
        markGrailAcquired(grail.id, 'CASH');
        setShowPayOptions(false);
        Alert.alert('SECURED', 'Paid in full. Your balance has been updated.');
    };

    const handleInstallment = (months: number) => {
        markGrailAcquired(grail.id, 'INSTALLMENTS', months, new Date());
        setShowInstallments(false);
        setShowPayOptions(false);
        Alert.alert(
            'SECURED',
            `Set up ${months}-month installment plan. $${(grail.price / months).toFixed(2)}/mo added to expenses.`
        );
    };

    const handleDeleteDrop = () => {
        Alert.alert('Cancel Drop', 'Are you sure you want to remove this drop?', [
            { text: 'NO', style: 'cancel' },
            {
                text: 'YES',
                style: 'destructive',
                onPress: () => {
                    removeGrail(grail.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    return (
        <Container safeArea style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn}>
                    <ArrowLeft color={theme.colors.textMain} size={28} />
                </TouchableOpacity>
                <Typography variant="mono" style={styles.headerSubtitle} color={theme.colors.textMuted}>
                    TICKET #{grail.id.substring(0, 6)}
                </Typography>
                <TouchableOpacity style={styles.iconBtn}>
                    <Share2 color={theme.colors.textMain} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.ticketStub}>
                    <View style={styles.ticketTop}>
                        <View style={styles.rowBetween}>
                            <Typography variant="label" color={theme.colors.background}>ADMIT ONE</Typography>
                            <Typography variant="label" color={theme.colors.background}>● LIVE DROP</Typography>
                        </View>
                        <Typography variant="h1" color={theme.colors.background} style={styles.itemName}>
                            {item.name}
                        </Typography>
                        <View style={styles.rowBetween}>
                            <View>
                                <Typography variant="label" color={theme.colors.textMuted}>RELEASE DATE</Typography>
                                <Typography variant="h2" color={theme.colors.background}>{item.date}</Typography>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Typography variant="label" color={theme.colors.textMuted}>PRICE</Typography>
                                <Typography variant="h2" color={theme.colors.background}>${item.price.toFixed(2)}</Typography>
                            </View>
                        </View>
                    </View>

                    <View style={styles.perforation}>
                        <View style={styles.dashedLine} />
                    </View>

                    <View style={styles.ticketBottom}>
                        <View style={styles.mathRow}>
                            <Typography variant="mono" color={theme.colors.textMuted}>CURRENT BALANCE</Typography>
                            <Typography variant="mono" color={theme.colors.background}>${item.currentBalance.toFixed(2)}</Typography>
                        </View>

                        {!item.isAcquired && (
                            <>
                                {item.projectedIncome > 0 && (
                                    <View style={styles.mathRow}>
                                        <Typography variant="mono" color={theme.colors.textMuted}>PROJECTED INCOME</Typography>
                                        <Typography variant="mono" color="#008800">+{item.projectedIncome.toFixed(2)}</Typography>
                                    </View>
                                )}
                                {item.expensesOffset > 0 && (
                                    <View style={styles.mathRow}>
                                        <Typography variant="mono" color={theme.colors.textMuted}>EXPENSES</Typography>
                                        <Typography variant="mono" color={theme.colors.danger}>-${item.expensesOffset.toFixed(2)}</Typography>
                                    </View>
                                )}
                                <View style={styles.mathRow}>
                                    <Typography variant="mono" color={theme.colors.textMuted}>THIS DROP</Typography>
                                    <Typography variant="mono" color={theme.colors.danger}>-${item.price.toFixed(2)}</Typography>
                                </View>

                                <View style={styles.mathDivider} />

                                <View style={styles.mathRow}>
                                    <Typography variant="h2" color={theme.colors.background}>PROJECTED BALANCE</Typography>
                                    <View style={styles.projectedBox}>
                                        <Typography variant="h2" color={item.status === 'APPROVED' ? theme.colors.primary : theme.colors.danger}>
                                            ${item.projectedBalance.toFixed(2)}
                                        </Typography>
                                    </View>
                                </View>
                            </>
                        )}

                        {item.isAcquired && (
                            <>
                                <View style={styles.mathRow}>
                                    <Typography variant="h2" color={theme.colors.background}>PAYMENT:</Typography>
                                    <View style={styles.projectedBox}>
                                        <Typography variant="h2" color={theme.colors.primary}>
                                            {item.paymentType === 'INSTALLMENTS'
                                                ? `${item.installmentMonths}x INSTALLMENTS`
                                                : 'PAID IN FULL'}
                                        </Typography>
                                    </View>
                                </View>
                                {item.paymentType === 'INSTALLMENTS' && item.installmentMonths && (
                                    <View style={styles.mathRow}>
                                        <Typography variant="mono" color={theme.colors.textMuted}>MONTHLY PAYMENT</Typography>
                                        <Typography variant="mono" color={theme.colors.primary}>
                                            ${(item.price / item.installmentMonths).toFixed(2)}/mo
                                        </Typography>
                                    </View>
                                )}
                            </>
                        )}

                        <View style={[styles.stampOverlay, {
                            borderColor: item.status === 'APPROVED'
                                ? theme.colors.primary
                                : (item.status === 'ACQUIRED' ? '#00FF00' : theme.colors.danger)
                        }]}>
                            <Typography
                                variant="h1"
                                color={item.status === 'APPROVED'
                                    ? theme.colors.primary
                                    : (item.status === 'ACQUIRED' ? '#00FF00' : theme.colors.danger)}
                                style={styles.stampText}
                            >
                                {item.status.toUpperCase()}
                            </Typography>
                        </View>

                        <View style={styles.barcodeSection}>
                            <View style={styles.barcodeLines}>
                                <View style={[styles.bar, { width: 6 }]} />
                                <View style={[styles.bar, { width: 2 }]} />
                                <View style={[styles.bar, { width: 8 }]} />
                                <View style={[styles.bar, { width: 4 }]} />
                                <View style={[styles.bar, { width: 2 }]} />
                                <View style={[styles.bar, { width: 6 }]} />
                                <View style={[styles.bar, { width: 10 }]} />
                                <View style={[styles.bar, { width: 3 }]} />
                            </View>
                            <View style={styles.rowBetween}>
                                <Typography variant="label" color={theme.colors.textMuted}>S/N: 893-203-44</Typography>
                                <Typography variant="label" color={theme.colors.textMuted}>AUTH: OK</Typography>
                            </View>
                        </View>
                    </View>

                    <View style={styles.jaggedEdgeContainer}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <View key={i} style={styles.jaggedTriangle} />
                        ))}
                    </View>
                </View>

                {!item.isAcquired && (
                    <View style={styles.riskSection}>
                        <View style={styles.rowBetween}>
                            <Typography variant="label" color={theme.colors.textMuted}>RISK LEVEL</Typography>
                            <Typography variant="label" color={item.riskLevel === 'danger' ? theme.colors.danger : item.riskLevel === 'warning' ? '#FFA500' : theme.colors.primary}>
                                {item.riskLevel.toUpperCase()}
                            </Typography>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: item.riskLevel === 'danger' ? '90%' : item.riskLevel === 'warning' ? '50%' : '10%', backgroundColor: item.riskLevel === 'danger' ? theme.colors.danger : item.riskLevel === 'warning' ? '#FFA500' : theme.colors.primary }]} />
                        </View>
                        <Typography variant="label" color={theme.colors.border} style={styles.riskSub}>
                            {item.riskLevel === 'danger' ? '/// INSUFFICIENT FUNDS ///' : item.riskLevel === 'warning' ? '/// PROCEED WITH CAUTION ///' : '/// SECURE ///'}
                        </Typography>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {!item.isAcquired ? (
                    showInstallments ? (
                        <>
                            <Typography variant="label" color={theme.colors.textMuted} style={{ marginBottom: 8 }}>
                                SELECT INSTALLMENT PLAN
                            </Typography>
                            <View style={styles.installmentGrid}>
                                {INSTALLMENT_OPTIONS.map(months => (
                                    <TouchableOpacity
                                        key={months}
                                        style={styles.installmentOption}
                                        onPress={() => handleInstallment(months)}
                                    >
                                        <Typography variant="h2" color={theme.colors.textMain} style={styles.installmentNumber}>
                                            {months}
                                        </Typography>
                                        <Typography variant="label" color={theme.colors.textMuted}>MONTHS</Typography>
                                        <Typography variant="mono" color={theme.colors.primary} style={styles.installmentPrice}>
                                            ${(grail.price / months).toFixed(0)}/mo
                                        </Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.customRow}>
                                <TextInput
                                    style={styles.customInput}
                                    value={customMonths}
                                    onChangeText={setCustomMonths}
                                    keyboardType="numeric"
                                    placeholder="Custom"
                                    placeholderTextColor={theme.colors.border}
                                />
                                <TouchableOpacity
                                    style={styles.customBtn}
                                    onPress={() => {
                                        const m = parseInt(customMonths);
                                        if (isNaN(m) || m < 1 || m > 120) {
                                            Alert.alert('Invalid', 'Enter a number between 1 and 120.');
                                            return;
                                        }
                                        handleInstallment(m);
                                    }}
                                >
                                    <Typography variant="label" color={theme.colors.background}>GO</Typography>
                                </TouchableOpacity>
                            </View>
                            <Button title="CANCEL" variant="ghost" onPress={() => { setShowInstallments(false); setCustomMonths(''); }} style={{ marginTop: 8 }} />
                        </>
                    ) : showPayOptions ? (
                        <>
                            <Button title="PAY IN FULL" onPress={handlePayFull} style={{ marginBottom: 8 }} />
                            <Button title="INSTALLMENTS" variant="outline" onPress={() => setShowInstallments(true)} style={{ marginBottom: 8 }} />
                            <Button title="CANCEL" variant="ghost" onPress={() => setShowPayOptions(false)} />
                        </>
                    ) : (
                        <>
                            <Button title="MARK AS PAID →" onPress={() => setShowPayOptions(true)} style={{ marginBottom: 8 }} />
                            <Button title="CANCEL DROP" variant="ghost" onPress={handleDeleteDrop} style={{ marginBottom: 8 }} />
                            <Button title="BACK TO LINEUP" variant="outline" onPress={handleGoBack} />
                        </>
                    )
                ) : (
                    <Button title="BACK TO LINEUP" onPress={handleGoBack} />
                )}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#0A0A0A' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg },
    iconBtn: { padding: theme.spacing.sm, backgroundColor: theme.colors.surface },
    headerSubtitle: { fontSize: 12 },
    scroll: { padding: theme.spacing.lg },
    ticketStub: { backgroundColor: theme.colors.textMain, borderRadius: theme.radii.sharp, overflow: 'hidden', position: 'relative' },
    ticketTop: { padding: theme.spacing.xl },
    itemName: { fontSize: 56, lineHeight: 56, marginVertical: theme.spacing.lg },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    perforation: { height: 20, justifyContent: 'center', overflow: 'hidden' },
    dashedLine: { borderBottomWidth: 2, borderBottomColor: '#CCCCCC', borderStyle: 'dashed', width: '100%' },
    ticketBottom: { padding: theme.spacing.xl, paddingTop: theme.spacing.md, position: 'relative' },
    mathRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    mathDivider: { height: 1, backgroundColor: '#CCCCCC', marginVertical: theme.spacing.md },
    projectedBox: { backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs },
    stampOverlay: { position: 'absolute', top: 60, left: 20, transform: [{ rotate: '-15deg' }], borderWidth: 4, borderColor: theme.colors.primary, padding: theme.spacing.sm, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    stampText: { fontSize: 48, color: theme.colors.primary },
    barcodeSection: { marginTop: theme.spacing.xl },
    barcodeLines: { flexDirection: 'row', height: 60, justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    bar: { backgroundColor: theme.colors.background, height: '100%' },
    jaggedEdgeContainer: { flexDirection: 'row', height: 10, backgroundColor: theme.colors.textMain, overflow: 'hidden' },
    jaggedTriangle: { width: 20, height: 20, backgroundColor: '#0A0A0A', transform: [{ rotate: '45deg' }, { translateY: 10 }, { translateX: -10 }] },
    riskSection: { marginTop: theme.spacing.xl },
    progressTrack: { height: 8, backgroundColor: theme.colors.surface, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
    progressFill: { height: '100%', backgroundColor: theme.colors.border },
    riskSub: { fontSize: 10 },
    footer: { padding: theme.spacing.lg },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    emptyMono: { fontSize: 10, marginBottom: theme.spacing.md },
    emptyTitle: { marginBottom: theme.spacing.sm },
    emptyBody: { textAlign: 'center' },
    installmentGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    installmentOption: { flex: 1, minWidth: 70, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, alignItems: 'center' },
    installmentNumber: { fontSize: 28, lineHeight: 32 },
    installmentPrice: { fontSize: 12, marginTop: theme.spacing.xs },
    customRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
    customInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, fontFamily: 'SpaceMono_400Regular', fontSize: 16, color: theme.colors.textMain },
    customBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, justifyContent: 'center', alignItems: 'center' },
});
