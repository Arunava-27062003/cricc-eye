import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { DataSourceBanner } from '@/components/data-source-banner';
import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { PlayerCard } from '@/features/players/player-card';
import { useThemedStyles } from '@/hooks/use-app-theme';
import { usePlayersQuery } from '@/hooks/use-cricket-data';
import { useSavedStore } from '@/store/saved-store';
import type { PlayerSummary } from '@/types/cricket';

function savePlayerPayload(player: PlayerSummary) {
  return {
    id: player.id,
    type: 'player' as const,
    title: player.name,
    subtitle: player.country ?? 'Player profile',
    image: player.playerImg,
    meta: player.role,
  };
}

export function SearchScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { recentSearches, addRecentSearch, toggleSaved, isSaved } = useSavedStore();
  const [search, setSearch] = useState('virat');
  const [debouncedSearch, setDebouncedSearch] = useState('virat');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      addRecentSearch(debouncedSearch);
    }
  }, [addRecentSearch, debouncedSearch]);

  const playersQuery = usePlayersQuery(debouncedSearch);
  const playersResult = playersQuery.data;
  const players = playersResult?.data ?? [];

  return (
    <Page
      refreshControlProps={{
        refreshing: playersQuery.isRefetching,
        onRefresh: () => void playersQuery.refetch(),
      }}>
      <PageSection>
        <SectionHeader title="Player search" subtitle="Jump from search straight into career stats and profile data." />
        <SearchBar placeholder="Search players" value={search} onChangeText={setSearch} />
      </PageSection>

      {playersResult?.message ? (
        <PageSection>
          <DataSourceBanner message={playersResult.message} />
        </PageSection>
      ) : null}

      {recentSearches.length ? (
        <PageSection>
          <SectionHeader title="Recent lookups" />
          <View style={styles.chips}>
            {recentSearches.map((item) => (
              <Pressable key={item} onPress={() => setSearch(item)} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeader title="Results" subtitle={`${players.length} players loaded`} />
        {players.length ? (
          players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              saved={isSaved(player.id, 'player')}
              onPress={() => router.push({ pathname: '/players/[id]', params: { id: player.id } })}
              onToggleSave={() => toggleSaved(savePlayerPayload(player))}
            />
          ))
        ) : (
          <EmptyState title="No players found" description="Try a shorter search term or check the spelling." />
        )}
      </PageSection>
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    chipText: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
  });
