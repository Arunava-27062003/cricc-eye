import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { RemoteImage } from '@/components/remote-image';
import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import type { PlayerSummary } from '@/types/cricket';

interface PlayerCardProps {
  player: PlayerSummary;
  index?: number;
  saved?: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}

export function PlayerCard({ player, index = 0, saved = false, onPress, onToggleSave }: PlayerCardProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Animated.View entering={FadeInDown.delay(index * 35).springify()} layout={LinearTransition.springify()}>
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.profile}>
            <RemoteImage uri={player.playerImg} label={player.name} size={48} />
            <View style={styles.copy}>
              <Text style={styles.name}>{player.name}</Text>
              <Text style={styles.meta}>{player.role ?? player.country ?? 'Player profile'}</Text>
              {player.country ? <Text style={styles.country}>{player.country}</Text> : null}
            </View>
          </View>
          <Pressable
            hitSlop={10}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}>
            <Text style={[styles.saveText, saved && styles.savedText]}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    profile: {
      flex: 1,
      flexDirection: 'row',
      gap: 12,
    },
    copy: {
      flex: 1,
      justifyContent: 'center',
      gap: 4,
    },
    name: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },
    meta: {
      color: theme.textMuted,
      fontSize: 13,
    },
    country: {
      color: theme.textSoft,
      fontSize: 12,
    },
    saveText: {
      color: theme.textMuted,
      fontWeight: '700',
    },
    savedText: {
      color: theme.primary,
    },
  });
