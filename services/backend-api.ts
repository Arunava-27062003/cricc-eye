import axios from 'axios';
import Constants from 'expo-constants';

import type {
  AuthEnvelope,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  UserEnvelope,
} from '@/types/auth';

const rawBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();
const DEFAULT_BACKEND_PORT = '4000';

function deriveBackendUrlFromExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri?.trim();

  if (!hostUri) {
    return '';
  }

  const [host] = hostUri.split(':');

  if (!host) {
    return '';
  }

  return `http://${host}:${DEFAULT_BACKEND_PORT}`;
}

function resolveBackendBaseUrl() {
  if (!rawBackendUrl || rawBackendUrl === 'auto') {
    return deriveBackendUrlFromExpoHost();
  }

  return rawBackendUrl.replace(/\/$/, '');
}

export const backendBaseUrl = resolveBackendBaseUrl();
export const hasConfiguredBackendUrl = Boolean(backendBaseUrl);

export const backendClient = axios.create({
  baseURL: backendBaseUrl,
  timeout: 15_000,
});

function withAuth(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function registerUser(input: RegisterInput) {
  const { data } = await backendClient.post<AuthEnvelope>('/api/auth/register', input);
  return data;
}

export async function loginUser(input: LoginInput) {
  const { data } = await backendClient.post<AuthEnvelope>('/api/auth/login', input);
  return data;
}

export async function getCurrentUser(token: string) {
  const { data } = await backendClient.get<UserEnvelope>('/api/users/me', withAuth(token));
  return data;
}

export async function updateCurrentUser(token: string, input: UpdateProfileInput) {
  const { data } = await backendClient.patch<UserEnvelope>('/api/users/me', input, withAuth(token));
  return data;
}

export function getRequestErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'We could not connect right now. Please try again in a moment.';
    }

    return error.response?.data?.message ?? error.message ?? 'Request failed.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

export function isUnauthorizedRequest(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
