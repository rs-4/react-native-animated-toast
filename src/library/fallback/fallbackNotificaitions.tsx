import React from 'react';
import ToastNotification from '../ToastNotification';
import type { ToastNotificationProps } from '../ToastNotification';

export type FallbackNotificationProps = Partial<ToastNotificationProps> & {
  message: string;
};

/**
 * Fallback notification component for devices that don't support
 * either Dynamic Island or Notch.
 * @deprecated Use ToastNotification directly instead
 */
export default function FallbackNotification(props: FallbackNotificationProps) {
  // Log a warning about deprecation
  React.useEffect(() => {
    console.warn(
      'FallbackNotification is deprecated. Use ToastNotification component directly.'
    );
  }, []);

  return <ToastNotification {...props} onHide={props.onHide || (() => {})} />;
}
