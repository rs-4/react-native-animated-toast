// Toast Notification Component for standard devices (no notch, no dynamic island)
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
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
import { getDeviceAnimationConfig, DeviceType } from './config/devices';
import type { DeviceAnimationConfig } from './config/devices';

// ---------------------------------------------------------------------------
// constants
const ANIMATION_DURATION = 350;
const DEFAULT_AUTO_HIDE_DELAY = 3000;
const SAFE_TOP = Platform.OS === 'ios' ? 80 : 60;
const CONTENT_PADDING = 16;

// ---------------------------------------------------------------------------
// props - same interface as other notifications for compatibility
/**
 * Props for the ToastNotification component
 * @interface ToastNotificationProps
 */
export type ToastNotificationProps = {
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
 * A toast notification component for standard devices (no notch, no dynamic island)
 * Appears at the top of the screen with slide-down animation
 * @param props - The component props
 * @returns React component
 */
export default function ToastNotification({
  message,
  onHide,
  type = 'default',
  textColor,
  showShadow = true,
  borderColor,
  shadowColor,
  children,
  autoHideDelay,
  setClose,
  disableAutoHide,
  enableHaptics = true,
}: ToastNotificationProps) {
  const { width: windowWidth } = useWindowDimensions();

  const [, setToastHeight] = useState(0);
  const [deviceConfig, setDeviceConfig] = useState<DeviceAnimationConfig>(
    getDeviceAnimationConfig(undefined, DeviceType.STANDARD)
  );

  // Detect device model and load appropriate configuration
  useEffect(() => {
    const loadDeviceConfig = async () => {
      const deviceId = await Device.modelId;
      console.log('Device detected (standard):', deviceId);
      setDeviceConfig(
        getDeviceAnimationConfig(deviceId || undefined, DeviceType.STANDARD)
      );
    };

    loadDeviceConfig();
  }, []);

  // ----- shared animation values
  const slideDown = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const completelyHidden = useSharedValue(1); // 0: visible, 1: hidden

  /** Size of the toast, filled after first onLayout */
  const contentSize = useSharedValue({
    w: windowWidth * deviceConfig.maxWidthRatio,
    h: 0, // Will be measured
  });

  /** ensure we measure only once to avoid loops  */
  const measuredOnce = useRef(false);
  /** track if the component is mounted */
  const isMounted = useRef(true);
  /** reference to the toast view */
  const toastRef = useRef<View>(null);

  // -----------------------------------------------------------------------
  // Layout callback - measure content
  const onContentLayout = (event: LayoutChangeEvent) => {
    if (!isMounted.current || measuredOnce.current) return;

    const { height } = event.nativeEvent.layout;
    setToastHeight(height);

    contentSize.value = {
      w: windowWidth * deviceConfig.maxWidthRatio,
      h: height,
    };

    measuredOnce.current = true;
  };

  // -----------------------------------------------------------------------
  // hide routine
  const hideNotification = useCallback(() => {
    // Fade and scale out
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    scale.value = withTiming(0.9, { duration: ANIMATION_DURATION });

    // Slide up
    slideDown.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
      if (isMounted.current) {
        // Ensure completely hidden
        completelyHidden.value = 1;
        runOnJS(onHide)();
      }
    });
  }, [completelyHidden, opacity, onHide, scale, slideDown]);

  // -----------------------------------------------------------------------
  // mount effect
  useEffect(() => {
    isMounted.current = true;
    slideDown.value = 0;
    opacity.value = 0;
    scale.value = 0.9;
    completelyHidden.value = 1;

    // Expose close function if provided
    if (setClose) {
      setClose(hideNotification);
    }

    // Small delay to ensure we have measured the content
    setTimeout(() => {
      if (!isMounted.current) return;

      // Make visible
      completelyHidden.value = 0;

      // Animate in
      slideDown.value = withSpring(1, {
        damping: 12,
        stiffness: 90,
        mass: 0.6,
      });

      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });

      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });

      // Trigger haptic feedback
      if (enableHaptics) {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (type === 'failed') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    }, 50);

    // Auto-hide if enabled
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
    completelyHidden,
    disableAutoHide,
    enableHaptics,
    hideNotification,
    opacity,
    scale,
    setClose,
    slideDown,
    type,
  ]);

  // -----------------------------------------------------------------------
  // animated styles
  const toastStyle = useAnimatedStyle(() => {
    // When completely hidden, force size to 0
    if (completelyHidden.value === 1) {
      return {
        opacity: 0,
        transform: [{ translateY: -100 }, { scale: 0 }],
      };
    }

    const translateY = interpolate(slideDown.value, [0, 1], [-100, 0], {
      extrapolateRight: 'clamp',
    });

    return {
      opacity: opacity.value,
      transform: [{ translateY }, { scale: scale.value }],
    };
  });

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

  // Determine background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(0, 0, 0, 0.95)';
      case 'failed':
        return 'rgba(0, 0, 0, 0.95)';
      default:
        return 'rgba(0, 0, 0, 0.95)';
    }
  };

  // Determine border color
  const getBorderColor = () => {
    if (borderColor) return borderColor;

    switch (type) {
      case 'success':
        return 'rgba(76, 175, 80, 0.3)';
      case 'failed':
        return 'rgba(244, 67, 54, 0.3)';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const shadowStyle = showShadow
    ? {
        shadowColor: shadowColor || '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
      }
    : {};

  // -----------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <Pressable onPress={hideNotification}>
        <Animated.View
          style={[
            styles.toast,
            toastStyle,
            shadowStyle,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              width: windowWidth * deviceConfig.maxWidthRatio,
            },
          ]}
          ref={toastRef}
          onLayout={onContentLayout}
        >
          {children ? (
            <View style={styles.customContent}>{children}</View>
          ) : (
            <Text style={[styles.text, { color }]}>{message}</Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SAFE_TOP,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10000,
    elevation: 10000,
  },
  toast: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  customContent: {
    padding: CONTENT_PADDING / 2,
    width: '100%',
  },
});
