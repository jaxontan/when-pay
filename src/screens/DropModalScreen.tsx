import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Container } from '../components/Container';
import { Typography } from '../components/Typography';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { X, PenLine, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useFinance } from '../context/FinanceContext';

export const DropModalScreen = ({ navigation }: any) => {
    const { addGrail } = useFinance();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const [targetDate, setTargetDate] = useState(new Date());

    const adjustDate = (days: number) => {
        const d = new Date(targetDate);
        d.setDate(d.getDate() + days);
        setTargetDate(d);
    };

    const handleAddGrail = () => {
        if (!name || !price) {
            Alert.alert('Missing fields', 'Please enter a name and price for the grail.');
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            Alert.alert('Invalid price', 'Please enter a valid number.');
            return;
        }

        const finalDate = new Date(targetDate);
        finalDate.setHours(23, 59, 59, 999); // Set to end of day to allow "today"

        if (finalDate < new Date()) {
            Alert.alert('Invalid Date', "You can't plan for the past. Select today or a future date.");
            return;
        }

        addGrail({
            name: name,
            price: priceNum,
            date: finalDate
        });

        navigation.goBack();
    };

    return (
        <Container safeArea style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color={theme.colors.textMain} size={32} />
                </TouchableOpacity>
                <Typography variant="mono" style={styles.headerSubtitle} color={theme.colors.textMuted}>
                    SECURE THE BAG /// 001
                </Typography>
                <View style={{ flex: 1 }} />
                <View style={styles.badge}>
                    <Typography variant="label" color={theme.colors.background}>HYPED</Typography>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Typography variant="h1" style={styles.title}>NEW{"\n"}DROP</Typography>

                <View style={styles.formGroup}>
                    <Typography variant="label" color={theme.colors.textMuted}>GRAIL NAME</Typography>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputDisplay}
                            placeholder="WHAT IS IT?"
                            placeholderTextColor={theme.colors.border}
                            value={name}
                            onChangeText={setName}
                        />
                        <PenLine color={theme.colors.border} size={24} />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Typography variant="label" color={theme.colors.textMuted}>PRICE POINT</Typography>
                    <View style={styles.inputContainer}>
                        <Typography variant="h2" color={theme.colors.primary} style={styles.currency}>$</Typography>
                        <TextInput
                            style={styles.inputMono}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.border}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <View style={styles.rowBetween}>
                        <Typography variant="label" color={theme.colors.textMuted}>DROP DATE</Typography>
                        <Typography variant="label" color={theme.colors.primary}>/// SELECT DATE</Typography>
                    </View>
                    <View style={[styles.dateSelectorMock, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md }]}>
                        <TouchableOpacity onPress={() => adjustDate(-1)} style={styles.dateControlBtn}>
                            <ChevronLeft color={theme.colors.textMain} size={32} />
                        </TouchableOpacity>

                        <Typography variant="h2" style={styles.dateText}>
                            {targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </Typography>

                        <TouchableOpacity onPress={() => adjustDate(1)} style={styles.dateControlBtn}>
                            <ChevronRight color={theme.colors.textMain} size={32} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <View style={styles.rowBetween}>
                    <Typography variant="label" color={theme.colors.textMuted}>EST. BALANCE AFTER COP</Typography>
                    <Typography variant="label" color={theme.colors.textMain}>TBD</Typography>
                </View>
                <Button
                    title="ADD TO ROTATION ->"
                    onPress={handleAddGrail}
                    style={styles.actionBtn}
                />
                <Typography variant="mono" style={styles.footerSub} color={theme.colors.border}>
          /// NO BUYER'S REMORSE ALLOWED ///
                </Typography>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    closeBtn: {
        marginRight: theme.spacing.md,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        transform: [{ rotate: '5deg' }],
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    title: {
        color: 'transparent',
        textShadowColor: theme.colors.textMain,
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
        lineHeight: 64,
        fontSize: 64,
        marginBottom: theme.spacing.xl,
    },
    formGroup: {
        marginBottom: theme.spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    inputDisplay: {
        flex: 1,
        fontFamily: theme.fonts.display,
        fontSize: 32,
        color: theme.colors.textMain,
        textTransform: 'uppercase',
    },
    inputMono: {
        flex: 1,
        fontFamily: theme.fonts.mono,
        fontSize: 32,
        color: theme.colors.primary,
    },
    currency: {
        marginRight: theme.spacing.sm,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateSelectorMock: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: theme.spacing.sm,
    },
    dateCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    dateText: {
        fontSize: 32,
        lineHeight: 38,
    },
    dateControlBtn: {
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.sharp,
    },
    footer: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: '#111',
    },
    actionBtn: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    footerSub: {
        textAlign: 'center',
        fontSize: 10,
    }
});
