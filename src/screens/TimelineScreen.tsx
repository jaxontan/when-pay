import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { theme } from '../theme/theme';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, ShoppingBag } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';
import { generateTimelineEvents, TimelineEvent } from '../utils/math';

export const TimelineScreen = ({ navigation }: any) => {
    const { currentBalance, monthlyIncome, expenses, grails } = useFinance();

    const timelineEvents = useMemo(() => {
        const events = generateTimelineEvents(
            currentBalance,
            monthlyIncome,
            expenses,
            grails,
            6
        );

        // Add running projected balance
        let runningBalance = currentBalance;
        return events.map(event => {
            runningBalance += event.amount;
            return {
                ...event,
                projectedBalance: runningBalance
            };
        });
    }, [currentBalance, monthlyIncome, expenses, grails]);

    const renderEvent = ({ item }: { item: TimelineEvent & { projectedBalance: number } }) => {
        const isPositive = item.amount > 0;
        const Icon = item.type === 'INCOME' ? DollarSign :
            item.type === 'INSTALLMENT' ? CreditCard :
                item.type === 'DROP' ? ShoppingBag : FlameIcon;

        const dateStr = item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

        return (
            <View style={styles.eventRow}>
                <View style={styles.dateCol}>
                    <Typography variant="label" color={theme.colors.textMuted}>{dateStr}</Typography>
                    <View style={styles.connector} />
                </View>

                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { borderColor: isPositive ? theme.colors.primary : theme.colors.danger }]}>
                        <Icon color={isPositive ? theme.colors.primary : theme.colors.danger} size={16} />
                    </View>
                </View>

                <View style={styles.contentCol}>
                    <Typography variant="mono" style={styles.eventName} numberOfLines={1}>{item.name}</Typography>
                    <View style={styles.amountRow}>
                        <Typography variant="label" color={isPositive ? theme.colors.primary : theme.colors.danger}>
                            {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                        </Typography>
                        <View style={styles.balanceTag}>
                            <Typography variant="label" style={styles.balanceText} color={theme.colors.textMuted}>
                                BAL: ${item.projectedBalance.toFixed(0)}
                            </Typography>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Container safeArea style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft color={theme.colors.textMain} size={28} />
                </TouchableOpacity>
                <Typography variant="label" style={styles.headerBadge} color={theme.colors.primary}>
                    6-MONTH OUTLOOK
                </Typography>
            </View>

            <View style={styles.titleSection}>
                <Typography variant="h1" style={styles.title}>TIMELINE</Typography>
                <Typography variant="mono" color={theme.colors.textMuted} style={styles.subtext}>
                    UPCOMING OBLIGATIONS /// PROJECTED FUNDS
                </Typography>
            </View>

            <FlatList
                data={timelineEvents}
                keyExtractor={item => item.id}
                renderItem={renderEvent}
                contentContainerStyle={styles.scroll}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Typography variant="h2" color={theme.colors.textMuted}>STILL WATERS</Typography>
                        <Typography variant="body" color={theme.colors.textMuted}>No financial events projected.</Typography>
                    </View>
                }
            />
        </Container>
    );
};

const FlameIcon = ({ color, size }: any) => <TrendingDown color={color} size={size} />;

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
    },
    headerBadge: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    iconBtn: {
        padding: theme.spacing.xs,
        backgroundColor: theme.colors.surface,
    },
    titleSection: {
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 56,
        lineHeight: 56,
    },
    subtext: {
        fontSize: 10,
        marginTop: 4,
    },
    scroll: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.giant,
    },
    eventRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        height: 60,
    },
    dateCol: {
        width: 60,
        alignItems: 'center',
    },
    connector: {
        flex: 1,
        width: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 4,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        zIndex: 1,
    },
    contentCol: {
        flex: 1,
        paddingLeft: theme.spacing.sm,
        justifyContent: 'center',
    },
    eventName: {
        fontSize: 14,
        textTransform: 'uppercase',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    balanceTag: {
        marginLeft: 8,
        paddingHorizontal: 4,
        backgroundColor: theme.colors.surface,
    },
    balanceText: {
        fontSize: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.giant,
    }
});
