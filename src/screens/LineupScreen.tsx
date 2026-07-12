import React, { useMemo, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { Plus, Settings, Calendar } from 'lucide-react-native';
import { GrailCard } from '../components/GrailCard';
import { SettingsModal } from '../components/SettingsModal';
import { useFinance } from '../context/FinanceContext';
import { calculateProjectedBalance, getRiskLevel } from '../utils/math';
import { SpotlightOverlay } from '../components/SpotlightOverlay';

export const LineupScreen = ({ navigation, onSelectItem }: any) => {
    const { currentBalance, monthlyIncome, expenses, grails, setSelectedItemId, isInitialized, hasSeenTour, completeTour } = useFinance();
    const [showSettings, setShowSettings] = useState(false);

    // Refs for spotlight targets
    const balanceRef = useRef<View>(null);
    const timelineRef = useRef<View>(null);
    const addBtnRef = useRef<View>(null);

    const showTour = isInitialized && !hasSeenTour;

    const spotlightSteps = useMemo(() => [
        {
            targetRef: addBtnRef,
            text: 'Start here! Tap the + button to add a drop you\'re saving up for.',
        },
        {
            targetRef: balanceRef,
            text: 'Your liquid stash balance. It updates automatically based on deposits and expenses.',
        },
        {
            targetRef: timelineRef,
            text: 'View your 6-month projected timeline of all upcoming expenses and drops.',
        },
    ], []);

    // Sort grails by date
    const sortedGrails = useMemo(() => {
        return [...grails].sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [grails]);

    // Calculate live status for each grail
    const grailsWithMath = useMemo(() => {
        let cumulativeGrailCost = 0;

        return sortedGrails.map(grail => {
            if (grail.status === 'ACQUIRED') {
                return {
                    ...grail,
                    status: 'acquired' as const,
                    projectedBalance: 0,
                };
            }

            const math = calculateProjectedBalance(
                grail.date,
                currentBalance,
                monthlyIncome,
                expenses,
                cumulativeGrailCost
            );

            const balanceAfterThis = math.projectedBalance - grail.price;
            const risk = getRiskLevel(balanceAfterThis, monthlyIncome);
            const status = risk === 'danger' ? 'risky' : 'affordable';

            cumulativeGrailCost += grail.price;

            return {
                ...grail,
                status: status as 'affordable' | 'risky',
                projectedBalance: balanceAfterThis,
            };
        });
    }, [sortedGrails, currentBalance, monthlyIncome, expenses]);

    const handleItemPress = (itemId: string) => {
        if (onSelectItem) {
            onSelectItem(itemId);
            setSelectedItemId(itemId);
        } else {
            navigation.navigate('Ticket', { itemId });
        }
    };

    return (
        <Container safeArea>
            {/* Fixed Sticky Header */}
            <View style={styles.tickerHeader}>
                <View ref={balanceRef} style={styles.tickerContent} collapsable={false}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Stash')}
                    >
                        <Typography variant="mono" color={theme.colors.primary} style={styles.tickerText}>
                            BALANCE: ${currentBalance.toFixed(2)} ///
                        </Typography>
                    </TouchableOpacity>
                </View>
                <View ref={timelineRef} collapsable={false}>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() => navigation.navigate('Timeline')}
                    >
                        <Calendar color={theme.colors.textMuted} size={22} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => setShowSettings(true)}
                >
                    <Settings color={theme.colors.textMuted} size={22} />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Typography variant="h1" style={styles.title}>THE LINEUP</Typography>
            </View>

            <View style={styles.listContainer}>
                <View style={styles.timelineLine} />
                <FlatList
                    data={grailsWithMath}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scroll}
                    renderItem={({ item }) => (
                        <GrailCard
                            item={item}
                            onPress={() => handleItemPress(item.id)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Typography variant="h2" color={theme.colors.textMuted}>NO DROPS PLANNED</Typography>
                            <Typography variant="body" color={theme.colors.textMuted} style={styles.subtitle}>Secure the bag.</Typography>
                        </View>
                    }
                    ListFooterComponent={
                        grailsWithMath.length > 0 ? (
                            <View style={styles.footerInfo}>
                                <Typography variant="h2" color={theme.colors.border} style={styles.endText}>
                                    END OF{"\n"}THE LINE
                                </Typography>
                            </View>
                        ) : null
                    }
                />
            </View>

            <View style={styles.fabContainer}>
                <View ref={addBtnRef} collapsable={false}>
                    <Button
                        variant="primary"
                        icon={<Plus color={theme.colors.background} size={40} />}
                        onPress={() => navigation.navigate('DropModal')}
                        style={styles.fab}
                    />
                </View>
            </View>

            <SettingsModal
                visible={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Custom Spotlight Tour */}
            <SpotlightOverlay
                visible={showTour}
                steps={spotlightSteps}
                onFinish={completeTour}
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    tickerHeader: {
        height: 56,
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tickerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    tickerText: {
        fontSize: 12,
    },
    headerBtn: {
        padding: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
    },
    titleContainer: {
        padding: theme.spacing.lg,
        paddingBottom: 0,
    },
    title: {
        textTransform: 'uppercase',
    },
    listContainer: {
        flex: 1,
        position: 'relative',
        marginTop: theme.spacing.lg,
    },
    timelineLine: {
        position: 'absolute',
        left: 48,
        top: 0,
        bottom: 0,
        width: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderWidth: 1,
        zIndex: -1,
    },
    scroll: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.giant * 2,
    },
    footerInfo: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },
    endText: {
        textAlign: 'center',
        fontSize: 48,
        lineHeight: 48,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.giant,
    },
    subtitle: {
        marginTop: theme.spacing.sm,
    },
    fabContainer: {
        position: 'absolute',
        bottom: theme.spacing.lg,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fab: {
        width: 64,
        height: 64,
        paddingHorizontal: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
