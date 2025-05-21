# React Native Dynamic Notifications

A customizable, device-aware notification system for React Native that adapts to different iOS and Android devices.

## Features

- ✨ **Device Detection**: Automatically selects the optimal notification style based on the device
- 🏝️ **Dynamic Island Integration**: Seamless integration with iPhone 14 Pro and newer models with Dynamic Island
- 🔔 **Notch Support**: Special notch-based notification for iPhone X through 13 and other devices with notches
- 🍞 **Toast Fallback**: Standard toast notifications for all other devices
- 🎯 **Multiple Types**: Success, failure, and default notification styles
- 📏 **Responsive Design**: Adapts to different screen sizes and orientations
- 🎨 **Highly Customizable**: Control colors, shadows, borders, and more
- 🔄 **Manual Control**: Option to disable auto-hide and programmatically control notifications
- 📦 **Custom Content**: Display your own React components inside notifications
- 📱 **Cross-Platform**: Works on both iOS and Android

## Installation

```bash
npm install react-native-dynamic-toast
# or
yarn add react-native-dynamic-toast
```

### Requirements

- React Native >= 0.60.0
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) >= 2.0.0
- [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) (optional, for haptic feedback)
- [expo-device](https://docs.expo.dev/versions/latest/sdk/device/) (for device detection)

## Basic Usage

1. Wrap your app with the `NotificationProvider`:

```jsx
import { NotificationProvider } from 'react-native-dynamic-toast';

export default function App() {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
}
```

2. **IMPORTANT**: Configure your StatusBar to work with notifications

For Dynamic Island and Notch notifications to work properly, you must ensure your StatusBar is properly configured. The library needs to control the StatusBar visibility during notifications:

```jsx
import { StatusBar } from 'react-native';
import {
  NotificationProvider,
  useStatusBarVisibility,
} from 'react-native-dynamic-toast';

function MyScreen() {
  // Get the hidden state from the library
  const { hidden } = useStatusBarVisibility();

  return (
    <>
      {/* The hidden prop is CRUCIAL for the animations to work correctly */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden={hidden}
        barStyle="dark-content"
      />

      {/* Your screen content */}
    </>
  );
}
```

If you don't configure your StatusBar correctly, the status bar icons may remain visible during notifications, breaking the visual effect of the Dynamic Island and Notch notifications.

3. Use the notification hook in your components:

```jsx
import { useNotif } from 'react-native-dynamic-toast';

function MyComponent() {
  const notification = useNotif();

  const showSuccessNotification = () => {
    notification.success('Operation completed successfully!');
  };

  const showErrorNotification = () => {
    notification.failed('An error occurred', {
      textColor: '#F44336',
      showShadow: true,
    });
  };

  return (
    <View>
      <Button title="Show Success" onPress={showSuccessNotification} />
      <Button title="Show Error" onPress={showErrorNotification} />
    </View>
  );
}
```

## API Reference

### NotificationProvider

The main provider component that enables notification functionality.

```jsx
<NotificationProvider forceStyle="dynamicIsland">
  {children}
</NotificationProvider>
```

#### Props

| Prop         | Type                                    | Description                         | Default                     |
| ------------ | --------------------------------------- | ----------------------------------- | --------------------------- |
| `forceStyle` | `'dynamicIsland' \| 'notch' \| 'toast'` | Force a specific notification style | Device-based auto-detection |

### Notification Hook

```jsx
const notification = useNotif();
```

The notification hook provides the following methods:

#### Methods

| Method                          | Description                           | Parameters                                          |
| ------------------------------- | ------------------------------------- | --------------------------------------------------- |
| `success(message, options?)`    | Show a success notification           | `message: string, options?: NotificationOptions`    |
| `failed(message, options?)`     | Show an error notification            | `message: string, options?: NotificationOptions`    |
| `toaster(message, options?)`    | Show a default toast notification     | `message: string, options?: NotificationOptions`    |
| `showCustom(content, options?)` | Show custom content in notification   | `content: ReactNode, options?: NotificationOptions` |
| `hide()`                        | Hide the current notification         | None                                                |
| `getCloseRef()`                 | Get a reference to the close function | Returns `() => void \| null`                        |

### NotificationOptions

Options for customizing the appearance and behavior of notifications.

| Option            | Type                                    | Description                             | Default                     |
| ----------------- | --------------------------------------- | --------------------------------------- | --------------------------- |
| `textColor`       | `string`                                | Color of the notification text          | Type-based default          |
| `showShadow`      | `boolean`                               | Show shadow effect                      | `false`                     |
| `shadowColor`     | `string`                                | Color of the shadow                     | Same as text color          |
| `borderColor`     | `string`                                | Color of the notification border        | Type-based default          |
| `autoHideDelay`   | `number`                                | Delay before auto-hiding (milliseconds) | `3000`                      |
| `disableAutoHide` | `boolean`                               | Disable auto-hiding                     | `false`                     |
| `enableHaptics`   | `boolean`                               | Enable haptic feedback                  | `true`                      |
| `forceStyle`      | `'dynamicIsland' \| 'notch' \| 'toast'` | Force a specific style                  | Device-based auto-detection |

## Advanced Usage

### Persistent Notifications

To create a notification that stays until manually closed:

```jsx
function PersistentNotificationExample() {
  const notification = useNotif();
  const closeRef = useRef(null);

  const showPersistentNotification = () => {
    notification.success("This notification won't disappear", {
      disableAutoHide: true,
    });

    // Save the close reference for later use
    setTimeout(() => {
      closeRef.current = notification.getCloseRef();
    }, 500);
  };

  const closeManually = () => {
    if (closeRef.current) {
      closeRef.current();
      closeRef.current = null;
    }
  };

  return (
    <View>
      <Button title="Show Persistent" onPress={showPersistentNotification} />
      <Button title="Close Notification" onPress={closeManually} />
    </View>
  );
}
```

### Custom Content

Display your own React components inside notifications:

```jsx
function CustomContentExample() {
  const notification = useNotif();

  const CustomContent = () => (
    <View style={{ padding: 10 }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Custom Title</Text>
      <Text style={{ color: 'white' }}>This is a fully custom component!</Text>
      <Text style={{ color: 'white' }}>You have complete control.</Text>
    </View>
  );

  return (
    <Button
      title="Show Custom Content"
      onPress={() =>
        notification.showCustom(<CustomContent />, {
          showShadow: true,
          autoHideDelay: 5000,
        })
      }
    />
  );
}
```

### Forcing Specific Notification Styles

You can force a specific notification style, regardless of the device:

```jsx
function ForceStyleExample() {
  const notification = useNotif();

  return (
    <View>
      <Button
        title="Force Dynamic Island"
        onPress={() =>
          notification.success('Dynamic Island Style', {
            forceStyle: 'dynamicIsland',
          })
        }
      />

      <Button
        title="Force Notch"
        onPress={() =>
          notification.success('Notch Style', {
            forceStyle: 'notch',
          })
        }
      />

      <Button
        title="Force Toast"
        onPress={() =>
          notification.success('Toast Style', {
            forceStyle: 'toast',
          })
        }
      />
    </View>
  );
}
```

## Device Support

The library automatically detects the device and chooses the appropriate notification style:

- **Dynamic Island**: iPhone 14 Pro, iPhone 14 Pro Max, iPhone 15, iPhone 15 Plus, iPhone 15 Pro, iPhone 15 Pro Max
- **Notch**: iPhone X, iPhone XS, iPhone XS Max, iPhone XR, iPhone 11, iPhone 11 Pro, iPhone 11 Pro Max, iPhone 12, iPhone 12 mini, iPhone 12 Pro, iPhone 12 Pro Max, iPhone 13, iPhone 13 mini, iPhone 13 Pro, iPhone 13 Pro Max, iPhone 14, iPhone 14 Plus
- **Toast**: All other iOS and Android devices

## StatusBar Configuration

⚠️ **CRITICAL**: Proper StatusBar configuration is essential for the Dynamic Island and Notch notifications to work correctly.

To ensure seamless animation and visual integration of notifications with the device's notch or Dynamic Island:

1. Import the StatusBar component from React Native and the visibility hook from the library:

```jsx
import { StatusBar } from 'react-native';
import { useStatusBarVisibility } from 'react-native-dynamic-toast';
```

2. Use the `hidden` state in all your screens where you define a StatusBar:

```jsx
function MyScreen() {
  const { hidden } = useStatusBarVisibility();

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden={hidden} // This prop is CRUCIAL
        barStyle="light-content"
      />
      {/* Your screen content */}
    </>
  );
}
```

For app-wide StatusBar configuration, you can use this pattern in your navigation container or root component:

```jsx
// App.js or your navigation root
import { StatusBar } from 'react-native';
import {
  NotificationProvider,
  useStatusBarVisibility,
} from 'react-native-dynamic-toast';

function App() {
  const { hidden } = useStatusBarVisibility();

  return (
    <NotificationProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden={hidden}
        barStyle="light-content"
      />
      <NavigationContainer>{/* Your app routes */}</NavigationContainer>
    </NotificationProvider>
  );
}
```

3. Apply this pattern to ALL StatusBar components in your application

Without this configuration, the status bar icons will remain visible during notifications, which breaks the illusion of the notification expanding from the device's notch or Dynamic Island.

### Advanced StatusBar Control

If you need more control over the StatusBar in your application, you can directly use the StatusBar store:

```jsx
import { useStatusBarStore } from 'react-native-dynamic-toast';

function CustomStatusBarController() {
  const { hidden, setHidden } = useStatusBarStore();

  // Now you can programmatically control the StatusBar visibility
  // But be careful not to interfere with the notification system
}
```

## License

MIT
