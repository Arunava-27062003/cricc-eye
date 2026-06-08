import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { RemoteImage } from '@/components/remote-image';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { useSavedStore } from '@/store/saved-store';
import type { SavedItem, SavedItemType } from '@/types/cricket';

function getRoute(type: SavedItemType, id: string) {
  if (type === 'match') {
    return { pathname: '/matches/[id]' as const, params: { id } };
  }

  if (type === 'series') {
    return { pathname: '/series/[id]' as const, params: { id } };
  }

  return { pathname: '/players/[id]' as const, params: { id } };
}

function SavedList({ title, items }: { title: string; items: SavedItem[] }) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  if (!items.length) {
    return null;
  }

  return (
    <PageSection>
      <SectionHeader title={title} subtitle={`${items.length} saved`} />
      {items.map((item) => (
        <Pressable key={`${item.type}-${item.id}`} onPress={() => router.push(getRoute(item.type, item.id))} style={styles.card}>
          <RemoteImage uri={item.image} label={item.title} size={46} />
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
          </View>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        </Pressable>
      ))}
    </PageSection>
  );
}

export function SavedScreen() {
  const styles = useThemedStyles(createStyles);
  const savedItems = useSavedStore((state) => state.savedItems);

  const matches = savedItems.filter((item) => item.type === 'match');
  const series = savedItems.filter((item) => item.type === 'series');
  const players = savedItems.filter((item) => item.type === 'player');

  return (
    <Page>
      <PageSection>
        <SectionHeader title="Saved board" subtitle="Keep your favorite matches, series, and players in one place." />
      </PageSection>

      {savedItems.length ? (
        <>
          <SavedList title="Matches" items={matches} />
          <SavedList title="Series" items={series} />
          <SavedList title="Players" items={players} />
        </>
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Save a match, player, or series from any card and it will stay pinned here."
        />
      )}
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      padding: 14,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 13,
    },
    meta: {
      color: theme.textSoft,
      fontSize: 12,
    },
    type: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: '800',
    },
  });
