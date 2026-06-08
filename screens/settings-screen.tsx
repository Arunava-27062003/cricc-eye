import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Page, PageSection } from '@/components/page';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme, ThemeMode } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { useThemeStore } from '@/store/theme-store';

export function SettingsScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <Page>
      <PageSection>
        <SectionHeader title="Settings" subtitle="Control how the app looks and feels." />
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather color={styles.backIcon.color} name="arrow-left" size={16} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </PageSection>

      <PageSection>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Appearance</Text>
          <Text style={styles.settingsNote}>Switch between the light and dark app themes.</Text>
          <View style={styles.toggleRow}>
            {(['dark', 'light'] as ThemeMode[]).map((value) => {
              const active = mode === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setMode(value)}
                  style={[styles.toggleButton, active && styles.toggleButtonActive]}>
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {value === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </PageSection>
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    backText: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    backIcon: {
      color: theme.textMuted,
    },
    settingsCard: {
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      padding: 16,
    },
    settingsTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    settingsNote: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    toggleButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceRaised,
      minHeight: 56,
      paddingHorizontal: 16,
    },
    toggleButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryMuted,
    },
    toggleText: {
      color: theme.textMuted,
      fontSize: 16,
      fontWeight: '700',
    },
    toggleTextActive: {
      color: theme.mode === 'light' ? theme.primary : theme.text,
    },
  });
