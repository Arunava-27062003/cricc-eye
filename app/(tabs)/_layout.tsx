import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '@/components/tab-icon';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: styles.scene,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live',
          tabBarIcon: ({ focused }) => <TabIcon variant="live" label="Live" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="series"
        options={{
          title: 'Series',
          tabBarIcon: ({ focused }) => <TabIcon variant="series" label="Series" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon variant="search" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon variant="saved" label="Saved" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon variant="profile" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (theme: AppTheme, bottomInset: number) =>
  StyleSheet.create({
    scene: {
    backgroundColor: theme.background,
    },
    tabBar: {
     position: 'absolute',
     left: 14,
     right: 14,
     bottom: Math.max(12, bottomInset + 6),
     height: 72 + bottomInset,
     paddingHorizontal: 14,
     paddingTop: 12,
     paddingBottom: Math.max(12, bottomInset),
     borderRadius: 24,
     backgroundColor: theme.surface,
     borderTopWidth: 0,
     borderWidth: 1,
     borderColor: theme.mode === 'light' ? '#E9EDF3' : theme.border,
     shadowColor: '#000000',
     shadowOpacity: theme.mode === 'light' ? 0.12 : 0.3,
     shadowOffset: { width: 0, height: 10 },
     shadowRadius: 20,
     elevation: 14,
   },
   tabBarItem: {
     justifyContent: 'center',
     alignItems: 'center',
   },
  });
