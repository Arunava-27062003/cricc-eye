import { StyleSheet, TextInput, View } from 'react-native';

import type { AppTheme } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/hooks/use-app-theme';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}

export function SearchBar({ placeholder, value, onChangeText }: SearchBarProps) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.shell}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSoft}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    shell: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      paddingHorizontal: 16,
      paddingVertical: 2,
    },
    input: {
      height: 52,
      color: theme.text,
      fontSize: 15,
    },
  });
