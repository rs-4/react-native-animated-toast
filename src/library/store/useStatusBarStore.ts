import { create } from 'zustand';

/**
 * Store for managing StatusBar visibility across the app
 * This is used by the notification components to hide the status bar
 * during notifications for a seamless effect with the device notch or Dynamic Island
 */
type StatusBarStore = {
  /** Whether the StatusBar should be hidden */
  hidden: boolean;
  /** Set the hidden state of the StatusBar */
  setHidden: (hidden: boolean) => void;
};

/**
 * Store to manage StatusBar visibility
 * Used by notification components to properly integrate with device features
 */
export const useStatusBarStore = create<StatusBarStore>((set) => ({
  hidden: false,
  setHidden: (hidden: boolean) => set({ hidden }),
}));
