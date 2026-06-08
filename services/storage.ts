import AsyncStorage from 'expo-sqlite/kv-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const webStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

export const persistStorage: StateStorage = {
  getItem: (key) => {
    if (Platform.OS === 'web') {
      return webStorage.getItem(key);
    }

    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === 'web') {
      webStorage.setItem(key, value);
      return;
    }

    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === 'web') {
      webStorage.removeItem(key);
      return;
    }

    return AsyncStorage.removeItem(key);
  },
};
