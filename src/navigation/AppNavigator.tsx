import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { useWindowDimensions } from 'react-native';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
import { DropModalScreen } from '../screens/DropModalScreen';
import { TicketScreen } from '../screens/TicketScreen';
import { StashScreen } from '../screens/StashScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { theme } from '../theme/theme';
import { useFinance } from '../context/FinanceContext';

export type RootStackParamList = {
    Onboarding: undefined;
    Home: undefined;
    Lineup: undefined;
    DropModal: undefined;
    Ticket: { itemId: string };
    Stash: undefined;
    Timeline: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textMain,
        border: theme.colors.border,
        notification: theme.colors.danger,
    },
};

const BREAKPOINT = 768;

const HomeScreen = ({ navigation }: any) => {
    return <ResponsiveLayout navigation={navigation} />;
};

export const AppNavigator = () => {
    const { width } = useWindowDimensions();
    const isWide = width >= BREAKPOINT;
    const { isInitialized, isLoading } = useFinance();

    if (isLoading) {
        return null; // Or a splash screen
    }

    return (
        <NavigationContainer theme={AppTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.colors.background },
                }}
            >
                {!isInitialized ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        {/* On mobile, Ticket is a separate screen; on wide, it's inline */}
                        {!isWide && (
                            <Stack.Screen name="Ticket" component={TicketScreen} />
                        )}
                        <Stack.Screen name="Timeline" component={TimelineScreen} />
                        <Stack.Screen name="Stash" component={StashScreen} />
                        <Stack.Screen
                            name="DropModal"
                            component={DropModalScreen}
                            options={{
                                presentation: 'modal',
                                ...TransitionPresets.ModalSlideFromBottomIOS,
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
