import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../theme/theme';

interface GrailItem {
    id: string;
    name: string;
    price: number;
    date: Date;
    status: 'affordable' | 'risky' | 'acquired';
}

interface GrailCardProps {
    item: GrailItem;
    onPress: () => void;
}

export const GrailCard: React.FC<GrailCardProps> = ({ item, onPress }) => {
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = monthNames[item.date.getMonth()];
    const day = item.date.getDate().toString().padStart(2, '0');

    const affordable = item.status === 'affordable';
    const acquired = item.status === 'acquired';

    return (
        <View style={[styles.container, acquired && styles.containerAcquired]}>
            {/* Timeline left column */}
            <View style={styles.dateCol}>
                <Typography variant="h2" style={styles.day}>{day}</Typography>
                <Typography variant="label" style={styles.month}>{month}</Typography>
                <View style={[styles.node, acquired && { backgroundColor: '#00FF00' }]} />
            </View>

            {/* Card right column */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[
                    styles.card,
                    acquired ? styles.cardAcquired : (affordable ? styles.cardAffordable : styles.cardRisky)
                ]}
            >
                <View style={styles.cardHeader}>
                    <Typography variant="h2" style={[styles.itemName, acquired && { textDecorationLine: 'line-through', color: theme.colors.textMuted }]} numberOfLines={2}>
                        {item.name}
                    </Typography>
                    <Typography variant="mono" color={acquired ? '#00FF00' : (affordable ? theme.colors.primary : theme.colors.danger)}>
                        ${item.price.toFixed(2)}
                    </Typography>
                </View>

                {acquired && (
                    <View style={[styles.riskyInfo, { borderTopColor: '#333' }]}>
                        <Typography variant="label" color="#00FF00">
                            SECURED /// ACQUIRED
                        </Typography>
                    </View>
                )}

                {!affordable && !acquired && (
                    <View style={styles.riskyInfo}>
                        <Typography variant="label" color={theme.colors.danger}>
                            WARNING: INSUFFICIENT FUNDS
                        </Typography>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
    },
    containerAcquired: {
        opacity: 0.6,
    },
    dateCol: {
        width: 60,
        alignItems: 'center',
        marginRight: theme.spacing.md,
        position: 'relative',
    },
    day: {
        fontSize: 32,
        lineHeight: 32,
    },
    month: {
        marginTop: 4,
        color: theme.colors.textMuted,
    },
    node: {
        width: 8,
        height: 8,
        backgroundColor: theme.colors.primary,
        position: 'absolute',
        top: 40,
        left: '50%',
        marginLeft: -4,
        transform: [{ rotate: '45deg' }], // diamond shape
    },
    card: {
        flex: 1,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
    },
    cardAffordable: {
        borderColor: theme.colors.border,
        borderStyle: 'solid',
    },
    cardRisky: {
        borderColor: theme.colors.danger,
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
    },
    cardAcquired: {
        borderColor: '#333',
        borderStyle: 'solid',
        backgroundColor: 'transparent',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemName: {
        flex: 1,
        fontSize: 24,
        lineHeight: 28,
        marginRight: theme.spacing.sm,
    },
    riskyInfo: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
});
