import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Page, PageSection } from '@/components/page';
import { SectionHeader } from '@/components/section-header';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/hooks/use-app-theme';
import {
  getCurrentUser,
  getRequestErrorMessage,
  hasConfiguredBackendUrl,
  isUnauthorizedRequest,
  loginUser,
  updateCurrentUser,
  registerUser,
} from '@/services/backend-api';
import { useAuthStore } from '@/store/auth-store';
import type { AuthEnvelope, AuthUser } from '@/types/auth';

type AuthMode = 'login' | 'register';

function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  keyboardType,
  secureTextEntry,
  multiline,
  trailingActionIcon,
  onTrailingActionPress,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'url';
  secureTextEntry?: boolean;
  multiline?: boolean;
  trailingActionIcon?: ComponentProps<typeof Feather>['name'];
  onTrailingActionPress?: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, multiline && styles.inputRowMultiline]}>
        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          multiline={multiline}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          secureTextEntry={secureTextEntry}
          style={[styles.input, styles.inputInner, multiline && styles.inputMultiline]}
          value={value}
        />
        {trailingActionIcon && onTrailingActionPress ? (
          <Pressable onPress={onTrailingActionPress} style={styles.trailingActionButton}>
            <Feather color={styles.trailingActionIcon.color} name={trailingActionIcon} size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function applyUserToForm(user: AuthUser | null, setDisplayName: (value: string) => void, setFavoriteTeam: (value: string) => void, setBio: (value: string) => void, setAvatarUrl: (value: string) => void) {
  setDisplayName(user?.displayName ?? '');
  setFavoriteTeam(user?.profile?.favoriteTeam ?? '');
  setBio(user?.profile?.bio ?? '');
  setAvatarUrl(user?.profile?.avatarUrl ?? '');
}

export function ProfileScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const queryClient = useQueryClient();
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const meQuery = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => getCurrentUser(token!),
    enabled: hydrated && hasConfiguredBackendUrl && Boolean(token),
    retry: false,
  });

  const handleAuthSuccess = (response: AuthEnvelope) => {
    setSession(response);
    queryClient.setQueryData(['auth', 'me', response.token], { user: response.user });
    setPassword('');
    setShowPassword(false);
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: handleAuthSuccess,
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: handleAuthSuccess,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (input: { displayName: string; favoriteTeam: string; bio: string; avatarUrl: string }) =>
      updateCurrentUser(token!, input),
    onSuccess: (response) => {
      updateUser(response.user);
      queryClient.setQueryData(['auth', 'me', token], response);
    },
  });

  useEffect(() => {
    if (meQuery.data?.user) {
      updateUser(meQuery.data.user);
    }
  }, [meQuery.data?.user, updateUser]);

  useEffect(() => {
    if (meQuery.error && isUnauthorizedRequest(meQuery.error)) {
      clearSession();
    }
  }, [clearSession, meQuery.error]);

  const activeUser = meQuery.data?.user ?? storedUser;

  useEffect(() => {
    applyUserToForm(activeUser, setDisplayName, setFavoriteTeam, setBio, setAvatarUrl);
  }, [activeUser]);

  const authBusy = loginMutation.isPending || registerMutation.isPending;
  const authError = loginMutation.error ?? registerMutation.error;
  const profileError = updateProfileMutation.error ?? meQuery.error;
  const initials = useMemo(
    () =>
      activeUser?.displayName
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'CR',
    [activeUser?.displayName]
  );

  const submitAuth = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (authMode === 'register') {
      registerMutation.mutate({
        email: normalizedEmail,
        password,
        displayName: displayName.trim(),
      });
      return;
    }

    loginMutation.mutate({
      email: normalizedEmail,
      password,
    });
  };

  const submitProfile = () => {
    updateProfileMutation.mutate({
      displayName: displayName.trim(),
      favoriteTeam: favoriteTeam.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
    });
  };

  if (!hydrated) {
    return (
      <Page scroll={false}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <PageSection>
        <SectionHeader
          title="Profile"
          subtitle="Manage your account and app preferences."
        />
      </PageSection>

      {!hasConfiguredBackendUrl ? (
        <PageSection>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Account services are unavailable</Text>
            <Text style={styles.noticeText}>Please try again later to sign in or create an account.</Text>
          </View>
        </PageSection>
      ) : null}

      {!token ? (
        <PageSection>
          <View style={styles.surfaceCard}>
            <Text style={styles.cardTitle}>Your cricket profile</Text>
            <Text style={styles.cardText}>Sign in or create an account to save and manage your profile.</Text>

            <View style={styles.segmentedRow}>
              {(['login', 'register'] as AuthMode[]).map((value) => {
                const active = authMode === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setAuthMode(value)}
                    style={[styles.segmentButton, active && styles.segmentButtonActive]}>
                    <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                      {value === 'login' ? 'Sign in' : 'Register'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {authMode === 'register' ? (
              <ProfileField
                autoCapitalize="words"
                label="Display name"
                onChangeText={setDisplayName}
                placeholder="Your name"
                value={displayName}
              />
            ) : null}

            <ProfileField
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />
            <ProfileField
              label="Password"
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              secureTextEntry={!showPassword}
              trailingActionIcon={showPassword ? 'eye-off' : 'eye'}
              onTrailingActionPress={() => setShowPassword((value) => !value)}
              value={password}
            />

            {authError ? <Text style={styles.errorText}>{getRequestErrorMessage(authError)}</Text> : null}
            {authError ? <Text style={styles.helperText}>Please try again in a moment.</Text> : null}

            <Pressable
              disabled={
                authBusy ||
                !hasConfiguredBackendUrl ||
                !email.trim() ||
                !password.trim() ||
                (authMode === 'register' && displayName.trim().length < 2)
              }
              onPress={submitAuth}
              style={[
                styles.primaryButton,
                (authBusy ||
                  !hasConfiguredBackendUrl ||
                  !email.trim() ||
                  !password.trim() ||
                  (authMode === 'register' && displayName.trim().length < 2)) &&
                  styles.buttonDisabled,
              ]}>
              <Text style={styles.primaryButtonText}>
                {authBusy ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            </Pressable>
          </View>
        </PageSection>
      ) : (
        <>
          <PageSection>
            <View style={styles.surfaceCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.profileCopy}>
                  <Text style={styles.cardTitle}>{activeUser?.displayName ?? 'Cricket fan'}</Text>
                  <Text style={styles.cardText}>{activeUser?.email ?? 'Signed in'}</Text>
                </View>
              </View>

              <View style={styles.inlineActions}>
                <Pressable onPress={() => router.push('/settings')} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Settings</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    clearSession();
                    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
                  }}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Sign out</Text>
                </Pressable>
              </View>
            </View>
          </PageSection>

          <PageSection>
            <View style={styles.surfaceCard}>
              <Text style={styles.cardTitle}>Edit profile</Text>
              <Text style={styles.cardText}>
                Keep your public details and team preference up to date.
              </Text>

              <ProfileField
                autoCapitalize="words"
                label="Display name"
                onChangeText={setDisplayName}
                placeholder="Your name"
                value={displayName}
              />
              <ProfileField
                autoCapitalize="words"
                label="Favorite team"
                onChangeText={setFavoriteTeam}
                placeholder="India, Australia, England..."
                value={favoriteTeam}
              />
              <ProfileField
                label="Avatar URL"
                keyboardType="url"
                onChangeText={setAvatarUrl}
                placeholder="https://example.com/avatar.png"
                value={avatarUrl}
              />
              <ProfileField
                autoCapitalize="sentences"
                label="Bio"
                multiline
                onChangeText={setBio}
                placeholder="A short intro for your profile"
                value={bio}
              />

              {profileError ? <Text style={styles.errorText}>{getRequestErrorMessage(profileError)}</Text> : null}

              <Pressable
                disabled={updateProfileMutation.isPending || meQuery.isFetching}
                onPress={submitProfile}
                style={[styles.primaryButton, (updateProfileMutation.isPending || meQuery.isFetching) && styles.buttonDisabled]}>
                <Text style={styles.primaryButtonText}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save profile'}
                </Text>
              </Pressable>
            </View>
          </PageSection>
        </>
      )}
    </Page>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noticeCard: {
      gap: 8,
      borderWidth: 1,
      borderColor: theme.warning,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      padding: 16,
    },
    noticeTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
    },
    noticeText: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 21,
    },
    surfaceCard: {
      gap: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      padding: 16,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
    },
    cardText: {
      color: theme.textMuted,
      fontSize: 14,
      lineHeight: 21,
    },
    segmentedRow: {
      flexDirection: 'row',
      gap: 10,
    },
    segmentButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceRaised,
    },
    segmentButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryMuted,
    },
    segmentLabel: {
      color: theme.textMuted,
      fontSize: 15,
      fontWeight: '700',
    },
    segmentLabelActive: {
      color: theme.mode === 'light' ? theme.primary : theme.text,
    },
    fieldGroup: {
      gap: 8,
    },
    fieldLabel: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surfaceRaised,
      color: theme.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surfaceRaised,
      paddingLeft: 14,
      paddingRight: 8,
    },
    inputRowMultiline: {
      alignItems: 'flex-start',
      paddingTop: 12,
      paddingBottom: 12,
    },
    inputInner: {
      flex: 1,
      borderWidth: 0,
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingRight: 8,
    },
    inputMultiline: {
      minHeight: 112,
      textAlignVertical: 'top',
    },
    placeholder: {
      color: theme.textSoft,
    },
    errorText: {
      color: theme.danger,
      fontSize: 13,
      lineHeight: 19,
    },
    helperText: {
      color: theme.textSoft,
      fontSize: 12,
      lineHeight: 18,
    },
    trailingActionButton: {
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      paddingHorizontal: 10,
    },
    trailingActionIcon: {
      color: theme.primary,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
    },
    primaryButtonText: {
      color: theme.mode === 'light' ? '#FFFFFF' : '#06121B',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryButton: {
      minHeight: 44,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surfaceRaised,
      paddingHorizontal: 14,
    },
    secondaryButtonText: {
      color: theme.textMuted,
      fontSize: 14,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatarBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primaryMuted,
    },
    avatarText: {
      color: theme.mode === 'light' ? theme.primary : theme.text,
      fontSize: 20,
      fontWeight: '900',
    },
    profileCopy: {
      flex: 1,
      gap: 4,
    },
    inlineActions: {
      flexDirection: 'row',
      gap: 10,
    },
  });
