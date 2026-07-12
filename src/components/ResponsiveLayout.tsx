import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../theme/theme';
import { LineupScreen } from '../screens/LineupScreen';
import { TicketScreen } from '../screens/TicketScreen';

const BREAKPOINT = 768;

interface ResponsiveLayoutProps {
    navigation: any;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isWide = width >= BREAKPOINT;
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    if (!isWide) {
        // Mobile: just render the lineup, navigation handles the rest
        return <LineupScreen navigation={navigation} />;
    }

    // Web wide: side-by-side layout
    return (
        <View style={styles.splitContainer}>
            <View style={styles.leftPanel}>
                <LineupScreen
                    navigation={navigation}
                    onSelectItem={(id: string) => setSelectedItemId(id)}
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.rightPanel}>
                <TicketScreen
                    itemIdProp={selectedItemId}
                    onBack={() => setSelectedItemId(null)}
                    navigation={navigation}
                    route={{ params: { itemId: selectedItemId } }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    splitContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
    },
    leftPanel: {
        flex: 1,
        maxWidth: 480,
        minWidth: 360,
    },
    divider: {
        width: 1,
        backgroundColor: theme.colors.border,
    },
    rightPanel: {
        flex: 1.5,
    },
});
