# Usage Guide

This guide provides examples and best practices for using React Native Dynamic Notifications in your application.

## Basic Notifications

### Success Notification

```jsx
import { useNotif } from 'react-native-dynamic-toast';

function SuccessExample() {
  const notification = useNotif();

  const handleSuccess = () => {
    notification.success('Operation completed successfully');
  };

  return <Button title="Show Success" onPress={handleSuccess} />;
}
```

### Error Notification

```jsx
import { useNotif } from 'react-native-dynamic-toast';

function ErrorExample() {
  const notification = useNotif();

  const handleError = () => {
    notification.failed('An error occurred', {
      textColor: '#F44336',
      showShadow: true,
      shadowColor: '#F44336',
    });
  };

  return <Button title="Show Error" onPress={handleError} />;
}
```

### Default Toast Notification

```jsx
import { useNotif } from 'react-native-dynamic-toast';

function ToastExample() {
  const notification = useNotif();

  const showToast = () => {
    notification.toaster('Information message', {
      autoHideDelay: 2000, // 2 seconds
    });
  };

  return <Button title="Show Toast" onPress={showToast} />;
}
```

## Customizing Notifications

### Styling

You can customize the appearance of notifications using various options:

```jsx
notification.success('Customized notification', {
  textColor: '#4CAF50', // Custom text color
  showShadow: true, // Enable shadow
  shadowColor: 'rgba(0,0,0,0.5)', // Custom shadow color
  borderColor: '#E0E0E0', // Custom border color
  enableHaptics: true, // Enable haptic feedback
});
```

### Auto-Hide Delay

Control how long notifications remain visible:

```jsx
// Show for 5 seconds (5000ms)
notification.success('This will show for 5 seconds', {
  autoHideDelay: 5000,
});

// Show for 10 seconds
notification.failed('Longer error message', {
  autoHideDelay: 10000,
});
```

## Advanced Usage

### Persistent Notifications

Create notifications that stay until manually closed:

```jsx
import { useRef } from 'react';
import { useNotif } from 'react-native-dynamic-toast';

function PersistentExample() {
  const notification = useNotif();
  const closeRef = useRef(null);

  const showPersistent = () => {
    notification.success('This notification will stay', {
      disableAutoHide: true,
    });

    // Store reference to close function
    setTimeout(() => {
      closeRef.current = notification.getCloseRef();
    }, 500);
  };

  const closePersistent = () => {
    if (closeRef.current) {
      closeRef.current();
      closeRef.current = null;
    }
  };

  return (
    <View>
      <Button title="Show Persistent" onPress={showPersistent} />
      <Button title="Close Notification" onPress={closePersistent} />
    </View>
  );
}
```

### Custom Content

Display custom components in your notifications:

```jsx
import { useNotif } from 'react-native-dynamic-toast';
import { View, Text, StyleSheet } from 'react-native';

function CustomContentExample() {
  const notification = useNotif();

  const CustomComponent = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Title</Text>
      <Text style={styles.message}>
        This is a completely custom notification
      </Text>
      <Text style={styles.message}>With multiple lines of text</Text>
    </View>
  );

  const showCustom = () => {
    notification.showCustom(<CustomComponent />, {
      showShadow: true,
      autoHideDelay: 5000,
    });
  };

  return <Button title="Show Custom Content" onPress={showCustom} />;
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
});
```

### Forcing Notification Styles

You can override the automatic device detection and force a specific notification style:

```jsx
// Force Dynamic Island style
notification.success('Dynamic Island style', {
  forceStyle: 'dynamicIsland',
});

// Force Notch style
notification.success('Notch style', {
  forceStyle: 'notch',
});

// Force Toast style
notification.success('Toast style', {
  forceStyle: 'toast',
});
```

## Best Practices

1. **Keep messages concise**: Notifications work best with short, clear messages
2. **Use appropriate types**: Use success for confirmations, failed for errors, and toaster for informational messages
3. **Consider device differences**: Test on different devices to ensure your notifications look good across all styles
4. **Custom content**: When using custom content, keep it simple and ensure it works well with flexible heights
5. **Haptic feedback**: Use haptic feedback sparingly to avoid overwhelming the user

## Important: StatusBar Configuration

For Dynamic Island and Notch notifications to work properly, you **must** configure your StatusBar components to respect the visibility state managed by the library:

```jsx
import { StatusBar } from 'react-native';
import { useStatusBarVisibility } from 'react-native-dynamic-toast';

function YourScreen() {
  // Get the current hidden state from the library
  const { hidden } = useStatusBarVisibility();

  return (
    <>
      {/* This configuration is essential for proper notification display */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden={hidden}
        barStyle="light-content"
      />

      {/* Your screen content */}
    </>
  );
}
```

### For Navigation-Based Apps

If you're using React Navigation or a similar router, you should configure the StatusBar at the navigation container level and in individual screens:

```jsx
// App.js
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  NotificationProvider,
  useStatusBarVisibility,
} from 'react-native-dynamic-toast';

const Stack = createStackNavigator();

function AppContent() {
  // Get the visibility state to pass to the StatusBar
  const { hidden } = useStatusBarVisibility();

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        hidden={hidden}
        barStyle="light-content"
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
```

### Why this is critical:

When a notification appears in the Dynamic Island or Notch style, the library needs to hide the status bar to create the illusion that the notification is expanding from the device's hardware features. If the status bar remains visible:

1. The visual effect is broken
2. The status bar icons will appear on top of your notification
3. The animation won't look seamless and professional

Make sure to apply this configuration to **every screen** in your app where you define a StatusBar.
