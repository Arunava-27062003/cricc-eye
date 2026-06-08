export interface UserProfile {
  bio?: string | null;
  favoriteTeam?: string | null;
  avatarUrl?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  profile: UserProfile | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthEnvelope {
  token: string;
  user: AuthUser;
}

export interface UserEnvelope {
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  favoriteTeam?: string;
  avatarUrl?: string;
}
