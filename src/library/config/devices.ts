export const devicesWithDynamicIsland = [
  'iPhone14,2', // iPhone 14 Pro
  'iPhone14,3', // iPhone 14 Pro Max
  'iPhone15,2', // iPhone 15 Pro
  'iPhone15,3', // iPhone 15 Pro Max
  'iPhone16,1', // iPhone 16 Pro
  'iPhone16,2', // iPhone 16 Pro Max
  'iPhone16,3', // iPhone 16
  'iPhone16,4', // iPhone 16 Plus
  'iPhone16,5', // iPhone 16 Pro
  'iPhone16,6', // iPhone 16 Pro Max
  'iPhone16,7', // iPhone 16 Pro Max
  'iPhone16,8', // iPhone 16 Pro Max
];

// Devices with notch (without Dynamic Island)
export const devicesWithNotch = [
  'iPhone10,3', // iPhone X
  'iPhone10,6', // iPhone X
  'iPhone11,2', // iPhone XS
  'iPhone11,4', // iPhone XS Max
  'iPhone11,6', // iPhone XS Max
  'iPhone11,8', // iPhone XR
  'iPhone12,1', // iPhone 11
  'iPhone12,3', // iPhone 11 Pro
  'iPhone12,5', // iPhone 11 Pro Max
  'iPhone13,1', // iPhone 12 mini
  'iPhone13,2', // iPhone 12
  'iPhone13,3', // iPhone 12 Pro
  'iPhone13,4', // iPhone 12 Pro Max
  'iPhone14,4', // iPhone 13 mini
  'iPhone14,5', // iPhone 13
  'iPhone14,6', // iPhone 13 Pro
  'iPhone14,7', // iPhone 13 Pro Max
  'iPhone14,8', // iPhone 14
];

export enum DeviceType {
  DYNAMIC_ISLAND = 'dynamicIsland',
  NOTCH = 'notch',
  STANDARD = 'standard',
}

export type DeviceAnimationConfig = {
  minWidthRatio: number; // Ratio of screen width for min width
  maxWidthRatio: number; // Ratio of screen width for max width
  expandedHeight: number; // Height of expanded notification
  borderRadius: number; // Border radius when expanded
  initialScale: number; // Initial scale for animation
  initialHeight: number; // Initial height before expansion
};

// Default animation configuration for Dynamic Island
const dynamicIslandConfig: DeviceAnimationConfig = {
  minWidthRatio: 0.3,
  maxWidthRatio: 0.9,
  expandedHeight: 75,
  borderRadius: 37,
  initialScale: 0.85,
  initialHeight: 38,
};

// Configuration for notch devices
const notchConfig: DeviceAnimationConfig = {
  minWidthRatio: 0.4,
  maxWidthRatio: 0.9,
  expandedHeight: 80,
  borderRadius: 25,
  initialScale: 0.9,
  initialHeight: 30,
};

// Standard devices (no notch, no dynamic island)
const standardConfig: DeviceAnimationConfig = {
  minWidthRatio: 0.3,
  maxWidthRatio: 0.9,
  expandedHeight: 70,
  borderRadius: 20,
  initialScale: 1,
  initialHeight: 0, // Starts fully hidden and then appears
};

// Special configurations for specific devices
const deviceSpecificConfigs: Record<string, Partial<DeviceAnimationConfig>> = {
  // iPhone 16 Pro specific adjustments
  'iPhone16,1': {
    minWidthRatio: 0.35,
    maxWidthRatio: 0.8,
    expandedHeight: 80,
    initialScale: 0.9,
  },
  'iPhone16,5': {
    minWidthRatio: 0.35,
    maxWidthRatio: 0.8,
    expandedHeight: 80,
    initialScale: 0.9,
  },
  // iPhone 16 Pro Max specific adjustments
  'iPhone16,2': {
    minWidthRatio: 0.25,
    maxWidthRatio: 0.75,
    expandedHeight: 80,
    initialScale: 0.9,
  },
  'iPhone16,6': {
    minWidthRatio: 0.25,
    maxWidthRatio: 0.75,
    expandedHeight: 80,
    initialScale: 0.9,
  },
  // iPhone 15/14 notch adjustments
  'iPhone15,4': {
    minWidthRatio: 0.5,
    maxWidthRatio: 0.85,
  },
  'iPhone14,8': {
    minWidthRatio: 0.5,
    maxWidthRatio: 0.85,
  },
};

export function detectDeviceType(deviceId: string | undefined): DeviceType {
  if (!deviceId) return DeviceType.STANDARD;

  if (devicesWithDynamicIsland.includes(deviceId)) {
    return DeviceType.DYNAMIC_ISLAND;
  }

  if (devicesWithNotch.includes(deviceId)) {
    return DeviceType.NOTCH;
  }

  return DeviceType.STANDARD;
}

export function hasDynamicIsland(deviceId: string | undefined): boolean {
  return devicesWithDynamicIsland.includes(deviceId || '');
}

export function hasNotch(deviceId: string | undefined): boolean {
  return devicesWithNotch.includes(deviceId || '');
}

export function getDeviceAnimationConfig(
  deviceId: string | undefined,
  deviceType?: DeviceType
): DeviceAnimationConfig {
  // Use provided device type or detect it
  const type = deviceType || detectDeviceType(deviceId);

  // Get base config based on device type
  let baseConfig: DeviceAnimationConfig;
  switch (type) {
    case DeviceType.DYNAMIC_ISLAND:
      baseConfig = dynamicIslandConfig;
      break;
    case DeviceType.NOTCH:
      baseConfig = notchConfig;
      break;
    default:
      baseConfig = standardConfig;
  }

  // Apply device-specific overrides if available
  const specificConfig = deviceId ? deviceSpecificConfigs[deviceId] || {} : {};

  // Merge base config with device-specific overrides
  return {
    ...baseConfig,
    ...specificConfig,
  };
}
