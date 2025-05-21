# React Native Dynamic Notifications

A customizable, device-aware notification system for React Native that adapts to different iOS and Android devices.

<p align="center">
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue.svg" alt="Platform iOS | Android">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

## Features

- Device detection with optimal notification style
- Dynamic Island integration for iPhone 14 Pro and newer
- Notch support for iPhone X through 13 and other notched devices
- Toast fallback for all other devices
- Success, failure, and default notification types
- Highly customizable appearance and behavior
- Manual control and persistent notifications
- Custom content support

## Quick Start

```bash
yarn add react-native-dynamic-toast
```

```jsx
import { NotificationProvider, notif } from 'react-native-dynamic-toast';

// Wrap your app
function App() {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
}

// Use in components
function MyComponent() {
  const notification = notif();

  return (
    <Button
      title="Show Notification"
      onPress={() => notification.success('Operation successful!')}
    />
  );
}
```

> ## ⚠️ CRITICAL: StatusBar Configuration Required
>
> For Dynamic Island and Notch notifications to work properly, you **must** configure your StatusBar component with the `hidden` state from the library:
>
> ```jsx
> import { StatusBar } from 'react-native';
> import { useStatusBarVisibility } from 'react-native-dynamic-toast';
>
> function Screen() {
>   const { hidden } = useStatusBarVisibility();
>   return (
>     <StatusBar hidden={hidden} translucent backgroundColor="transparent" />
>   );
> }
> ```
>
> Without this configuration, notifications will not animate correctly with the device's notch or Dynamic Island.
>
> See the [documentation](./src/docs/README.md#statusbar-configuration) for details.

## Documentation

For detailed documentation, see the [full documentation](./src/docs/README.md).

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
