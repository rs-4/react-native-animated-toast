import { useNotif, NotificationProvider } from './library/index';

export * from './library/index';
export { default as DynamicIslandNotification } from './library/DynamicIslandNotifications';
export { default as NotchNotification } from './library/NotchNotification';
export { default as ToastNotification } from './library/ToastNotification';

export default {
  Provider: NotificationProvider,
  useNotification: useNotif,
};
