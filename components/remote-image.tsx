import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';

interface RemoteImageProps {
  uri?: string;
  label: string;
  size?: number;
}

export function RemoteImage({ uri, label, size = 42 }: RemoteImageProps) {
  const styles = useThemedStyles(createStyles);

  if (!uri) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.fallbackText}>{label.slice(0, 2).toUpperCase()}</Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surfaceMuted,
    },
    fallbackText: {
      color: theme.text,
      fontWeight: '800',
    },
  });
