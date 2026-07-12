import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, LayoutRectangle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../theme/theme';

interface SpotlightStep {
    /** ref to the target element */
    targetRef: React.RefObject<View | null>;
    /** text to display */
    text: string;
}

interface SpotlightOverlayProps {
    visible: boolean;
    steps: SpotlightStep[];
    onFinish: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CIRCLE_RADIUS = 60;

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({ visible, steps, onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetLayout, setTargetLayout] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;

    const measureTarget = useCallback(() => {
        const step = steps[currentStep];
        if (!step?.targetRef?.current) return;

        step.targetRef.current.measureInWindow((x, y, w, h) => {
            setTargetLayout({ x, y, w, h });
        });
    }, [currentStep, steps]);

    useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            // Small delay to let layout settle
            setTimeout(measureTarget, 400);
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            setTimeout(measureTarget, 200);
        }
    }, [currentStep, measureTarget, visible]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setTargetLayout(null);
            setCurrentStep(prev => prev + 1);
        } else {
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                onFinish();
            });
        }
    };

    const handleSkip = () => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            onFinish();
        });
    };

    if (!visible) return null;

    const step = steps[currentStep];
    const cx = targetLayout ? targetLayout.x + targetLayout.w / 2 : SCREEN_W / 2;
    const cy = targetLayout ? targetLayout.y + targetLayout.h / 2 : SCREEN_H / 2;

    // Position tooltip below or above the spotlight
    const tooltipTop = cy + CIRCLE_RADIUS + 20 > SCREEN_H - 200
        ? cy - CIRCLE_RADIUS - 160
        : cy + CIRCLE_RADIUS + 20;

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity }]}>
                {/* Dark overlay pieces around the circle */}
                {targetLayout && (
                    <>
                        {/* Top rect */}
                        <View style={[styles.darkPiece, { top: 0, left: 0, right: 0, height: Math.max(0, cy - CIRCLE_RADIUS) }]} />
                        {/* Bottom rect */}
                        <View style={[styles.darkPiece, { top: cy + CIRCLE_RADIUS, left: 0, right: 0, bottom: 0 }]} />
                        {/* Left rect (middle band) */}
                        <View style={[styles.darkPiece, { top: cy - CIRCLE_RADIUS, left: 0, width: Math.max(0, cx - CIRCLE_RADIUS), height: CIRCLE_RADIUS * 2 }]} />
                        {/* Right rect (middle band) */}
                        <View style={[styles.darkPiece, { top: cy - CIRCLE_RADIUS, left: cx + CIRCLE_RADIUS, right: 0, height: CIRCLE_RADIUS * 2 }]} />

                        {/* Corner fills for the circle (to make it look circular) */}
                        {/* We use a circular border to create the circle effect */}
                        <View style={[styles.circleHole, {
                            top: cy - CIRCLE_RADIUS,
                            left: cx - CIRCLE_RADIUS,
                            width: CIRCLE_RADIUS * 2,
                            height: CIRCLE_RADIUS * 2,
                            borderRadius: CIRCLE_RADIUS,
                        }]} />
                    </>
                )}

                {/* Full dark overlay if no layout yet */}
                {!targetLayout && (
                    <View style={[styles.darkPiece, { top: 0, left: 0, right: 0, bottom: 0 }]} />
                )}

                {/* Tooltip */}
                <View style={[styles.tooltip, { top: tooltipTop }]}>
                    <View style={styles.tooltipContent}>
                        <Typography variant="mono" color={theme.colors.primary} style={styles.stepIndicator}>
                            STEP {currentStep + 1}/{steps.length}
                        </Typography>
                        <Typography variant="body" color={theme.colors.textMain} style={styles.tooltipText}>
                            {step?.text}
                        </Typography>
                    </View>
                    <View style={styles.tooltipFooter}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                            <Typography variant="mono" color={theme.colors.textMuted}>SKIP</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                            <Typography variant="mono" color={theme.colors.background}>
                                {currentStep === steps.length - 1 ? 'GOT IT' : 'NEXT'}
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    darkPiece: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
    },
    circleHole: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
    },
    tooltip: {
        position: 'absolute',
        left: 24,
        right: 24,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    tooltipContent: {
        padding: theme.spacing.lg,
    },
    stepIndicator: {
        fontSize: 10,
        marginBottom: theme.spacing.sm,
        letterSpacing: 2,
    },
    tooltipText: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
    },
    tooltipFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    skipBtn: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtn: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
    },
});
