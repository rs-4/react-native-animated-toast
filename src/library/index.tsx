import React, { createContext, useContext, useState, useEffect } from 'react';
import DynamicIslandNotification from './DynamicIslandNotifications';
import NotchNotification from './NotchNotification';
import ToastNotification from './ToastNotification';
import {
  detectDeviceType,
  DeviceType,
  hasDynamicIsland,
} from './config/devices';
import * as Device from 'expo-device';
import { useStatusBarStore } from './store/useStatusBarStore';

// Export the individual notification components
export { DynamicIslandNotification, NotchNotification, ToastNotification };

// Export the hasDynamicIsland function for compatibility
export { hasDynamicIsland };

// Export StatusBar store for advanced usage
export { useStatusBarStore };

/**
 * Type of notification to display
 * @typedef {'success' | 'failed' | 'default'} NotificationType
 */
type NotificationType = 'success' | 'failed' | 'default';

/**
 * Options for customizing notifications
 * @interface NotificationOptions
 */
interface NotificationOptions {
  /** Custom text color */
  textColor?: string;
  /** Whether to show shadow effect */
  showShadow?: boolean;
  /** Custom shadow color */
  shadowColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Custom auto-hide delay in milliseconds */
  autoHideDelay?: number;
  /** Disable auto-hiding the notification */
  disableAutoHide?: boolean;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Force a specific notification style */
  forceStyle?: 'dynamicIsland' | 'notch' | 'toast';
}

// Notification Context used by the hook
/**
 * Notification context type used by the hook
 * @interface NotificationContextType
 */
type NotificationContextType = {
  /** Display a success notification */
  success: (message: string, options?: NotificationOptions) => void;
  /** Display a failure/error notification */
  failed: (message: string, options?: NotificationOptions) => void;
  /** Display a toast notification */
  toaster: (message: string, options?: NotificationOptions) => void;
  /** Display a notification with custom content */
  showCustom: (
    children: React.ReactNode,
    options?: NotificationOptions
  ) => void;
  /** Hide any active notification */
  hide: () => void;
  /** Get a reference to the close function for manual control */
  getCloseRef: () => (() => void) | null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Hook to access the notification API
 */
export const useNotif = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('notif must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Hook to access StatusBar visibility state for proper integration
 * @returns Object with hidden state that should be passed to StatusBar component
 */
export const useStatusBarVisibility = () => {
  const hidden = useStatusBarStore(
    (state: { hidden: boolean }) => state.hidden
  );
  return { hidden };
};

/**
 * Provider props for the NotificationProvider component
 * @interface NotificationProviderProps
 */
type NotificationProviderProps = {
  /** The child components to render */
  children: React.ReactNode;
  /** Force a specific notification style, otherwise auto-detected */
  forceStyle?: 'dynamicIsland' | 'notch' | 'toast';
};

/**
 * Provider component that enables notification functionality
 */
export const NotificationProvider = ({
  children,
  forceStyle,
}: NotificationProviderProps) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<NotificationType>('default');
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.STANDARD);
  const [customContent, setCustomContent] = useState<React.ReactNode | null>(
    null
  );
  const [options, setOptions] = useState<NotificationOptions>({});

  // Reference to the close function for manual control
  const closeRef = React.useRef<(() => void) | null>(null);

  // Access the StatusBar store to control visibility
  const setStatusBarHidden = useStatusBarStore(
    (state: { setHidden: (hidden: boolean) => void }) => state.setHidden
  );

  // Hide StatusBar when notifications are visible for Notch and Dynamic Island types
  useEffect(() => {
    if (
      visible &&
      (deviceType === DeviceType.DYNAMIC_ISLAND ||
        deviceType === DeviceType.NOTCH)
    ) {
      setStatusBarHidden(true);
    } else {
      setStatusBarHidden(false);
    }
  }, [visible, deviceType, setStatusBarHidden]);

  // Detect device type on mount
  useEffect(() => {
    const detectDevice = async () => {
      const deviceId = await Device.modelId;
      console.log('Device detected for notification style:', deviceId);

      // Use forced style or detect automatically
      if (forceStyle) {
        switch (forceStyle) {
          case 'dynamicIsland':
            setDeviceType(DeviceType.DYNAMIC_ISLAND);
            break;
          case 'notch':
            setDeviceType(DeviceType.NOTCH);
            break;
          default:
            setDeviceType(DeviceType.STANDARD);
        }
      } else {
        setDeviceType(detectDeviceType(deviceId));
      }
    };

    detectDevice();
  }, [forceStyle]);

  const show = (
    text: string,
    notifType: NotificationType = 'default',
    notifOptions?: NotificationOptions
  ) => {
    setCustomContent(null);
    setMessage(text);
    setType(notifType);
    setOptions(notifOptions || {});

    // Update device type if forceStyle is provided in options
    if (notifOptions?.forceStyle) {
      switch (notifOptions.forceStyle) {
        case 'dynamicIsland':
          setDeviceType(DeviceType.DYNAMIC_ISLAND);
          break;
        case 'notch':
          setDeviceType(DeviceType.NOTCH);
          break;
        case 'toast':
          setDeviceType(DeviceType.STANDARD);
          break;
      }
    }

    setVisible(true);
  };

  const showCustom = (
    content: React.ReactNode,
    notifOptions?: NotificationOptions
  ) => {
    setMessage('');
    setCustomContent(content);
    setType('default');
    setOptions(notifOptions || {});

    // Update device type if forceStyle is provided in options
    if (notifOptions?.forceStyle) {
      switch (notifOptions.forceStyle) {
        case 'dynamicIsland':
          setDeviceType(DeviceType.DYNAMIC_ISLAND);
          break;
        case 'notch':
          setDeviceType(DeviceType.NOTCH);
          break;
        case 'toast':
          setDeviceType(DeviceType.STANDARD);
          break;
      }
    }

    setVisible(true);
  };

  const hide = () => {
    // Use the close reference if available, otherwise just hide
    if (closeRef.current) {
      closeRef.current();
    } else {
      setVisible(false);
    }
  };

  // Function to store the close function reference
  const setClose = (closeFn: () => void) => {
    closeRef.current = closeFn;
  };

  // Function to get the close reference for manual control
  const getCloseRef = () => {
    return closeRef.current;
  };

  const success = (msg: string, notifOptions?: NotificationOptions) =>
    show(msg, 'success', notifOptions);
  const failed = (msg: string, notifOptions?: NotificationOptions) =>
    show(msg, 'failed', notifOptions);
  const toaster = (msg: string, notifOptions?: NotificationOptions) =>
    show(msg, 'default', notifOptions);

  // Render the appropriate notification component based on device type
  const renderNotification = () => {
    if (!visible) return null;

    const commonProps = {
      message,
      onHide: () => setVisible(false),
      type,
      textColor: options.textColor,
      showShadow: options.showShadow,
      shadowColor: options.shadowColor,
      borderColor: options.borderColor,
      autoHideDelay: options.autoHideDelay,
      setClose,
      disableAutoHide: options.disableAutoHide,
      enableHaptics: options.enableHaptics,
      children: customContent,
    };

    switch (deviceType) {
      case DeviceType.DYNAMIC_ISLAND:
        return <DynamicIslandNotification {...commonProps} />;
      case DeviceType.NOTCH:
        return <NotchNotification {...commonProps} />;
      default:
        return <ToastNotification {...commonProps} />;
    }
  };

  return (
    <NotificationContext.Provider
      value={{ success, failed, toaster, showCustom, hide, getCloseRef }}
    >
      {children}
      {renderNotification()}
    </NotificationContext.Provider>
  );
};

// Export the provider as DynamicIslandProvider for backward compatibility
export const DynamicIslandProvider = NotificationProvider;

// Export the hook as useDynamicIsland for backward compatibility
export const useDynamicIsland = useNotif;

// Export the context for backward compatibility
export { NotificationContext };

/**
 * Properties for all notification components
 * @interface NotificationProps
 */
export interface NotificationProps {
  /** Text message to display */
  message: string;
  /** Callback when notification is hidden */
  onHide: () => void;
  /** Type of notification */
  type?: 'success' | 'failed' | 'default';
  /** Custom text color */
  textColor?: string;
  /** Whether to show shadow */
  showShadow?: boolean;
  /** Custom shadow color */
  shadowColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Custom auto-hide delay in milliseconds */
  autoHideDelay?: number;
  /** Disable auto-hiding the notification */
  disableAutoHide?: boolean;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Function to expose the close method */
  setClose?: (closeFn: () => void) => void;
  /** Custom content to display instead of message */
  children?: React.ReactNode;
}

/**
 * Reference to notification methods
 * @interface NotificationRef
 */
export interface NotificationRef {
  /** Hide the notification */
  hide: () => void;
}

/**
 * Notification style type
 * @interface NotificationStyle
 */
export interface NotificationStyle {
  /** Type of notification appearance */
  type: 'dynamicIsland' | 'notch' | 'toast';
}

/**
 * Options for showing a notification
 * @interface NotificationShowOptions
 * @extends NotificationOptions
 */
export interface NotificationShowOptions extends NotificationOptions {
  /** Disable auto-hiding the notification */
  disableAutoHide?: boolean;
}

// Export default provider and hook
export default { Provider: NotificationProvider, useNotification: useNotif };
