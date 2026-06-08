import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { DataSourceBanner } from '@/components/data-source-banner';
import { EmptyState } from '@/components/empty-state';
import { Page, PageSection } from '@/components/page';
import { SearchBar } from '@/components/search-bar';
import { SectionHeader } from '@/components/section-header';
import { SeriesCard } from '@/features/series/series-card';
import { useSeriesQuery } from '@/hooks/use-cricket-data';
import { formatSeriesBreakdown } from '@/services/formatters';
import { useSavedStore } from '@/store/saved-store';
import type { SeriesSummary } from '@/types/cricket';

function saveSeriesPayload(series: SeriesSummary) {
  return {
    id: series.id,
    type: 'series' as const,
    title: series.name,
    subtitle: formatSeriesBreakdown(series),
    meta: `${series.startDate} - ${series.endDate}`,
  };
}

export function SeriesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { toggleSaved, isSaved } = useSavedStore();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const seriesQuery = useSeriesQuery(debouncedSearch);
  const seriesResult = seriesQuery.data;
  const seriesList = seriesResult?.data ?? [];

  return (
    <Page
      refreshControlProps={{
        refreshing: seriesQuery.isRefetching,
        onRefresh: () => void seriesQuery.refetch(),
      }}>
      <PageSection>
        <SectionHeader title="Series hub" subtitle="Search tours, leagues, and long-running competitions." />
        <SearchBar placeholder="Search a series or tour" value={search} onChangeText={setSearch} />
      </PageSection>

      {seriesResult?.message ? (
        <PageSection>
          <DataSourceBanner message={seriesResult.message} />
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeader
          title={debouncedSearch ? `Results for "${debouncedSearch}"` : 'Active series'}
          subtitle={`${seriesList.length} series loaded`}
        />
        {seriesList.length ? (
          seriesList.slice(0, 18).map((series, index) => (
            <SeriesCard
              key={series.id}
              series={series}
              index={index}
              saved={isSaved(series.id, 'series')}
              onPress={() => router.push({ pathname: '/series/[id]', params: { id: series.id } })}
              onToggleSave={() => toggleSaved(saveSeriesPayload(series))}
            />
          ))
        ) : (
          <EmptyState title="No series found" description="Try a broader search term or refresh the feed." />
        )}
      </PageSection>
    </Page>
  );
}
