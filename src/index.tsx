import {
  useNotif,
  NotificationProvider,
  useStatusBarVisibility,
  useStatusBarStore,
  hasDynamicIsland,
} from './library/index';

import type {
  NotificationProps,
  NotificationRef,
  NotificationStyle,
  NotificationShowOptions,
} from './library/index';

// Define NotificationOptions since it's not exported as an interface from library/index.tsx
export interface NotificationOptions {
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

// Import individual components
import DynamicIslandNotificationComponent from './library/DynamicIslandNotifications';
import NotchNotificationComponent from './library/NotchNotification';
import ToastNotificationComponent from './library/ToastNotification';

// Re-export hooks and components
export {
  NotificationProvider,
  useStatusBarVisibility,
  useStatusBarStore,
  hasDynamicIsland,
};

// Re-export types
export type {
  NotificationProps,
  NotificationRef,
  NotificationStyle,
  NotificationShowOptions,
};

// Re-export individual components
export const DynamicIslandNotification = DynamicIslandNotificationComponent;
export const NotchNotification = NotchNotificationComponent;
export const ToastNotification = ToastNotificationComponent;

// Define a type for our default export to avoid TS errors
interface DefaultExport {
  Provider: typeof NotificationProvider;
  useNotification: typeof useNotif;
  useNotif: typeof useNotif;
  useStatusBarVisibility: typeof useStatusBarVisibility;
  DynamicIslandNotification: typeof DynamicIslandNotificationComponent;
  NotchNotification: typeof NotchNotificationComponent;
  ToastNotification: typeof ToastNotificationComponent;
}

// Default export with named methods for CommonJS compatibility
const defaultExport: DefaultExport = {
  // Main components
  Provider: NotificationProvider,
  useNotification: useNotif,
  useNotif,

  // Status bar utilities
  useStatusBarVisibility,

  // Individual components for specific use cases
  DynamicIslandNotification: DynamicIslandNotificationComponent,
  NotchNotification: NotchNotificationComponent,
  ToastNotification: ToastNotificationComponent,
};

export default defaultExport;
