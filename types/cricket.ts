export interface ApiMeta {
  status: string;
  apikey?: string;
  info?: {
    totalRows?: number;
    offsetRows?: number;
    hitsToday?: number;
    hitsLimit?: number;
    [key: string]: number | string | undefined;
  };
}

export interface ApiResponse<T> extends ApiMeta {
  data: T;
  source?: DataSource;
  message?: string;
}

export type DataSource = 'live' | 'demo';

export interface DataEnvelope<T> {
  data: T;
  source: DataSource;
  message?: string;
}

export interface TeamInfo {
  name: string;
  shortname?: string;
  img?: string;
}

export interface MatchScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

export interface MatchSummary {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams: string[];
  teamInfo?: TeamInfo[];
  score?: MatchScore[];
  series_id?: string;
  fantasyEnabled?: boolean;
  bbbEnabled?: boolean;
  hasSquad?: boolean;
  matchStarted?: boolean;
  matchEnded?: boolean;
  tossWinner?: string;
  tossChoice?: string;
  matchWinner?: string;
}

export interface ScoreFeedItem {
  id: string;
  dateTimeGMT: string;
  matchType: string;
  status: string;
  ms: string;
  t1: string;
  t2: string;
  t1s?: string;
  t2s?: string;
  t1img?: string;
  t2img?: string;
  series: string;
}

export interface SeriesSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  odi: number;
  t20: number;
  test: number;
  squads: number;
  matches: number;
}

export interface SeriesInfo {
  id: string;
  name: string;
  startdate: string;
  enddate: string;
  odi: number;
  t20: number;
  test: number;
  squads: number;
  matches: number;
}

export interface SeriesInfoResponse {
  info: SeriesInfo;
  matchList: MatchSummary[];
}

export interface PlayerSummary {
  id: string;
  name: string;
  country?: string;
  role?: string;
  playerImg?: string;
}

export interface PlayerStat {
  fn: string;
  matchtype: string;
  stat: string;
  value: string;
}

export interface PlayerInfo extends PlayerSummary {
  battingStyle?: string;
  bowlingStyle?: string;
  placeOfBirth?: string;
  stats: PlayerStat[];
}

export interface SquadPlayer extends PlayerSummary {
  battingStyle?: string;
  bowlingStyle?: string;
}

export interface SquadTeam {
  teamName: string;
  shortname?: string;
  img?: string;
  players: SquadPlayer[];
}

export type SavedItemType = 'match' | 'series' | 'player';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle: string;
  image?: string;
  meta?: string;
}
