// Dynamic Island Notification Component – Bug‑free version
// Stop infinite onLayout loops by measuring content only once.
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Platform,
  Pressable,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import { getDeviceAnimationConfig } from './config/devices';
import type { DeviceAnimationConfig } from './config/devices';

// ---------------------------------------------------------------------------
// constants
const BASE_DYNAMIC_ISLAND_MIN_WIDTH = 126;
const BASE_DYNAMIC_ISLAND_MAX_WIDTH = 350;
const ANIMATION_DURATION = 350;
const DEFAULT_AUTO_HIDE_DELAY = 3000;
const SAFE_TOP = Platform.OS === 'ios' ? 10 : 5;
const CONTENT_PADDING_TOP = 25; // Padding top for content
const CONTENT_PADDING_BOTTOM = 12; // Extra padding at the bottom

// ---------------------------------------------------------------------------
// props
/**
 * Props for the DynamicIslandNotification component
 * @interface DynamicIslandNotificationProps
 */
export type DynamicIslandNotificationProps = {
  /** Text message to display in the notification */
  message: string;
  /** Callback function called when notification is hidden */
  onHide: () => void;
  /** Type of notification: success, failed, or default */
  type?: 'success' | 'failed' | 'default';
  /** Custom text color */
  textColor?: string;
  /** Whether to show a shadow effect */
  showShadow?: boolean;
  /** Custom shadow color */
  shadowColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Custom React component to display inside the notification */
  children?: React.ReactNode;
  /** Delay before auto-hiding in milliseconds */
  autoHideDelay?: number;
  /** Function to expose the close method for external control */
  setClose?: (closeFunction: () => void) => void;
  /** Disable auto-hide behavior completely */
  disableAutoHide?: boolean;
  /** Enable haptic feedback when notification appears */
  enableHaptics?: boolean;
};

// ---------------------------------------------------------------------------
/**
 * A notification component that mimics the iOS Dynamic Island for modern iPhones
 * @param props - The component props
 * @returns React component
 */
export default function DynamicIslandNotification({
  message,
  onHide,
  type = 'default',
  textColor,
  showShadow = false,
  borderColor,
  shadowColor,
  children,
  autoHideDelay,
  setClose,
  disableAutoHide,
  enableHaptics = true,
}: DynamicIslandNotificationProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [dynamicIslandHeight, setDynamicIslandHeight] = useState(0);
  const [deviceConfig, setDeviceConfig] = useState<DeviceAnimationConfig>(
    getDeviceAnimationConfig(undefined)
  );

  // Detect device model and load appropriate configuration
  useEffect(() => {
    const loadDeviceConfig = async () => {
      const deviceId = await Device.modelId;
      console.log('Device detected:', deviceId);
      setDeviceConfig(getDeviceAnimationConfig(deviceId || undefined));
    };

    loadDeviceConfig();
  }, []);

  // ----- shared animation values
  const expansion = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(1);
  const completelyHidden = useSharedValue(0); // 0: visible, 1: hidden

  /** Size of the expanded island, filled after first onLayout */
  const contentSize = useSharedValue({
    w: BASE_DYNAMIC_ISLAND_MAX_WIDTH,
    h: deviceConfig.expandedHeight,
  });

  /** ensure we measure only once to avoid loops  */
  const measuredOnce = useRef(false);
  /** track if the component is mounted */
  const isMounted = useRef(true);
  /** track current height for icon positioning */
  const currentHeight = useRef(deviceConfig.expandedHeight);
  /** reference to the dynamic island view */
  const dynamicIslandRef = useRef<View>(null);

  // ----- responsive minima based on device configuration
  const dynamicIslandMinWidth = Math.min(
    BASE_DYNAMIC_ISLAND_MIN_WIDTH,
    windowWidth * deviceConfig.minWidthRatio
  );
  const dynamicIslandMaxWidth = Math.min(
    BASE_DYNAMIC_ISLAND_MAX_WIDTH,
    windowWidth * deviceConfig.maxWidthRatio
  );
  const minHeight = Math.min(deviceConfig.initialHeight, windowHeight * 0.05);

  // -----------------------------------------------------------------------
  // LAYOUT CALLBACK – update height dynamically based on content
  const onContentLayout = (event: LayoutChangeEvent) => {
    if (!isMounted.current) return;

    const { width, height } = event.nativeEvent.layout;

    // Always update height to adapt to content, adding extra padding
    const newHeight = Math.max(
      height + CONTENT_PADDING_TOP + CONTENT_PADDING_BOTTOM,
      deviceConfig.expandedHeight
    );

    // Store current height for icon positioning
    currentHeight.current = newHeight;

    let newWidth = dynamicIslandMaxWidth;
    if (!measuredOnce.current) {
      newWidth = Math.min(width + 40, dynamicIslandMaxWidth);
      measuredOnce.current = true; // Only measure width once
    }

    contentSize.value = {
      w: newWidth,
      h: newHeight,
    };
  };

  // Get dynamic island dimensions for icon positioning
  const onDynamicIslandLayout = (event: LayoutChangeEvent) => {
    if (dynamicIslandHeight === 0) {
      setDynamicIslandHeight(event.nativeEvent.layout.height);
    }
  };

  // -----------------------------------------------------------------------
  // hide routine
  const hideNotification = useCallback(() => {
    // Fade out the text
    textOpacity.value = withTiming(0, { duration: ANIMATION_DURATION / 2 });
    textScale.value = withTiming(0.9, { duration: ANIMATION_DURATION / 2 });

    setTimeout(() => {
      // Collapse the island completely to a point
      expansion.value = withSpring(0, {
        damping: 8,
        stiffness: 150,
        mass: 0.8,
        velocity: 3,
      });

      // Add a final shrink to zero size
      setTimeout(() => {
        if (isMounted.current) {
          // Ensure the notification completely disappears
          completelyHidden.value = 1;

          // Call the onHide callback
          setTimeout(() => {
            runOnJS(onHide)();
          }, 50);
        }
      }, ANIMATION_DURATION - 50);
    }, ANIMATION_DURATION / 2);
  }, [completelyHidden, expansion, onHide, textOpacity, textScale]);

  // -----------------------------------------------------------------------
  // mount effect
  useEffect(() => {
    isMounted.current = true;
    expansion.value = 0;
    textOpacity.value = 0;
    textScale.value = 0.9;

    // Expose close function if setClose is provided
    if (setClose) {
      setClose(hideNotification);
    }

    expansion.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
      velocity: 3,
      mass: 0.5,
    });

    // Trigger haptic feedback when notification appears
    if (enableHaptics) {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'failed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    setTimeout(() => {
      if (!isMounted.current) return;

      textOpacity.value = withTiming(1, { duration: ANIMATION_DURATION / 2 });
      textScale.value = withSpring(1, {
        damping: 12,
        stiffness: 120,
      });
    }, ANIMATION_DURATION / 2);

    // Only set auto-hide timeout if disableAutoHide is not true
    let timeout: NodeJS.Timeout | undefined;
    if (!disableAutoHide) {
      timeout = setTimeout(
        hideNotification,
        autoHideDelay || DEFAULT_AUTO_HIDE_DELAY
      );
    }

    return () => {
      isMounted.current = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [
    autoHideDelay,
    disableAutoHide,
    enableHaptics,
    expansion,
    hideNotification,
    setClose,
    textOpacity,
    textScale,
    type,
  ]);

  // -----------------------------------------------------------------------
  // animated styles
  const dynamicIslandStyle = useAnimatedStyle(() => {
    // When completely hidden, force size to 0
    if (completelyHidden.value === 1) {
      return {
        width: 0,
        height: 0,
        opacity: 0,
        borderRadius: 0,
        transform: [{ scale: 0 }],
      };
    }

    // Get the animated dimensions
    const width = interpolate(
      expansion.value,
      [0, 1],
      [dynamicIslandMinWidth, contentSize.value.w],
      { extrapolateRight: 'clamp' }
    );

    const height = interpolate(
      expansion.value,
      [0, 1],
      [minHeight, contentSize.value.h],
      { extrapolateRight: 'clamp' }
    );

    const borderRadius = interpolate(
      expansion.value,
      [0, 1],
      [20, deviceConfig.borderRadius],
      { extrapolateRight: 'clamp' }
    );

    const scale = interpolate(
      expansion.value,
      [0, 0.3, 1],
      [deviceConfig.initialScale, 0.95, 1],
      { extrapolateRight: 'clamp' }
    );

    const opacity = interpolate(expansion.value, [0, 0.1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return {
      width,
      height,
      borderRadius,
      opacity,
      transform: [{ scale }, { translateY: -2 }],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: interpolate(textOpacity.value, [0, 1], [10, 0]) },
      { scale: textScale.value },
    ],
  }));

  // -----------------------------------------------------------------------
  // helpers
  const color = (() => {
    switch (type) {
      case 'success':
        return textColor || '#4CAF50';
      case 'failed':
        return textColor || '#F44336';
      default:
        return textColor || '#FFFFFF';
    }
  })();

  // Determine border color based on type and custom borderColor prop
  const getBorderColor = () => {
    if (borderColor) return borderColor;

    switch (type) {
      case 'success':
        return 'rgba(76, 175, 80, 0.3)'; // Default green border for success
      case 'failed':
        return 'rgba(244, 67, 54, 0.3)'; // Default red border for failed
      default:
        return 'rgba(255, 255, 255, 0.1)'; // Default subtle white border
    }
  };

  const shadowStyle = showShadow
    ? {
        shadowColor: shadowColor || color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 25,
      }
    : {};

  // -----------------------------------------------------------------------
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden
        barStyle="light-content"
      />

      <View style={styles.dynamicIslandContainer}>
        <Pressable style={styles.pressableContainer} onPress={hideNotification}>
          <Animated.View
            style={[
              styles.dynamicIsland,
              dynamicIslandStyle,
              shadowStyle,
              {
                borderColor: getBorderColor(),
              },
              type === 'success' && styles.successIsland,
              type === 'failed' && styles.failedIsland,
            ]}
            onLayout={onDynamicIslandLayout}
            ref={dynamicIslandRef}
          >
            <Animated.View
              style={[styles.notificationContent, contentStyle]}
              onLayout={onContentLayout}
            >
              {children ? (
                <View style={styles.customContentContainer}>{children}</View>
              ) : (
                <View style={styles.contentRow}>
                  <Text
                    style={[
                      styles.notificationText,
                      { color },
                      type !== 'default' && styles.accentedText,
                    ]}
                  >
                    {message}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// styles
const styles = StyleSheet.create({
  dynamicIslandContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    elevation: 10000,
    alignItems: 'center',
    paddingTop: SAFE_TOP,
    overflow: 'visible', // Changed to visible to allow shadow to extend
  },
  pressableContainer: {
    alignItems: 'center',
    overflow: 'visible', // Changed to visible to allow shadow to extend
  },
  dynamicIsland: {
    backgroundColor: 'black',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  successIsland: {
    // No border color here - using getBorderColor function
  },
  failedIsland: {
    // No border color here - using getBorderColor function
  },
  notificationContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: CONTENT_PADDING_TOP,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customContentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: CONTENT_PADDING_BOTTOM - 10, // Subtract existing padding
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: CONTENT_PADDING_BOTTOM - 10, // Subtract existing padding
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  accentedText: {
    fontSize: 17,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
