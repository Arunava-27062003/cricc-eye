import type {
  MatchSummary,
  PlayerInfo,
  PlayerSummary,
  PlayerStat,
  ScoreFeedItem,
  SeriesInfoResponse,
  SeriesSummary,
  SquadTeam,
} from '@/types/cricket';

const playerStats = (batting: Partial<Record<string, string>>, bowling: Partial<Record<string, string>>): PlayerStat[] => {
  const formats = ['t20', 'odi'];
  const battingDefaults = { m: '24', inn: '22', runs: '648', hs: '89', avg: '36.0', sr: '142.4', '4s': '58', '6s': '21' };
  const bowlingDefaults = { m: '24', inn: '18', runs: '412', wkts: '19', avg: '21.6', econ: '7.4', sr: '17.5' };

  return formats.flatMap((matchtype) => [
    ...Object.entries({ ...battingDefaults, ...batting }).map(([stat, value]) => ({
      fn: 'batting',
      matchtype,
      stat,
      value,
    })),
    ...Object.entries({ ...bowlingDefaults, ...bowling }).map(([stat, value]) => ({
      fn: 'bowling',
      matchtype,
      stat,
      value,
    })),
  ]);
};

export const demoPlayers: PlayerSummary[] = [
  { id: 'demo-player-kohli', name: 'Virat Kohli', country: 'India', role: 'Batsman', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-rohit', name: 'Rohit Sharma', country: 'India', role: 'Batsman', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-bumrah', name: 'Jasprit Bumrah', country: 'India', role: 'Bowler', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-head', name: 'Travis Head', country: 'Australia', role: 'Batsman', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-cummins', name: 'Pat Cummins', country: 'Australia', role: 'Bowler', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-gill', name: 'Shubman Gill', country: 'India', role: 'Batsman', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-rizwan', name: 'Mohammad Rizwan', country: 'Pakistan', role: 'WK-Batsman', playerImg: 'https://h.cricapi.com/img/icon512.png' },
  { id: 'demo-player-shaheen', name: 'Shaheen Afridi', country: 'Pakistan', role: 'Bowler', playerImg: 'https://h.cricapi.com/img/icon512.png' },
];

const playerInfoMap: Record<string, PlayerInfo> = {
  'demo-player-kohli': {
    ...demoPlayers[0],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm medium',
    placeOfBirth: 'Delhi, India',
    stats: playerStats({ runs: '13250', hs: '183', avg: '57.2', sr: '93.5' }, { wkts: '5', econ: '6.2' }),
  },
  'demo-player-rohit': {
    ...demoPlayers[1],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm offbreak',
    placeOfBirth: 'Nagpur, India',
    stats: playerStats({ runs: '10888', hs: '264', avg: '49.3', sr: '91.8' }, { wkts: '9', econ: '5.5' }),
  },
  'demo-player-bumrah': {
    ...demoPlayers[2],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm fast',
    placeOfBirth: 'Ahmedabad, India',
    stats: playerStats({ runs: '128', hs: '16', avg: '8.0', sr: '82.0' }, { wkts: '149', avg: '23.1', econ: '4.7', sr: '29.2' }),
  },
  'demo-player-head': {
    ...demoPlayers[3],
    battingStyle: 'Left Handed Bat',
    bowlingStyle: 'Right-arm offbreak',
    placeOfBirth: 'Adelaide, Australia',
    stats: playerStats({ runs: '2875', hs: '152', avg: '44.2', sr: '101.4' }, { wkts: '14', econ: '5.8' }),
  },
  'demo-player-cummins': {
    ...demoPlayers[4],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm fast',
    placeOfBirth: 'Sydney, Australia',
    stats: playerStats({ runs: '482', hs: '37', avg: '14.6', sr: '92.1' }, { wkts: '136', avg: '27.4', econ: '5.2', sr: '31.4' }),
  },
  'demo-player-gill': {
    ...demoPlayers[5],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm offbreak',
    placeOfBirth: 'Fazilka, India',
    stats: playerStats({ runs: '2271', hs: '208', avg: '47.3', sr: '99.0' }, { wkts: '0', econ: '0' }),
  },
  'demo-player-rizwan': {
    ...demoPlayers[6],
    battingStyle: 'Right Handed Bat',
    bowlingStyle: 'Right-arm medium',
    placeOfBirth: 'Peshawar, Pakistan',
    stats: playerStats({ runs: '2088', hs: '104', avg: '48.1', sr: '127.4' }, { wkts: '0', econ: '0' }),
  },
  'demo-player-shaheen': {
    ...demoPlayers[7],
    battingStyle: 'Left Handed Bat',
    bowlingStyle: 'Left-arm fast',
    placeOfBirth: 'Khyber, Pakistan',
    stats: playerStats({ runs: '196', hs: '29', avg: '13.0', sr: '110.2' }, { wkts: '119', avg: '24.8', econ: '5.5', sr: '27.0' }),
  },
};

export const demoMatches: MatchSummary[] = [
  {
    id: 'demo-match-ind-aus',
    name: 'India vs Australia, 1st T20I, Demo Series 2026',
    matchType: 't20',
    status: 'India need 18 runs from 12 balls',
    venue: 'Wankhede Stadium, Mumbai',
    date: '2026-06-08',
    dateTimeGMT: '2026-06-08T14:00:00',
    teams: ['India', 'Australia'],
    teamInfo: [
      { name: 'India', shortname: 'IND', img: 'https://g.cricapi.com/iapi/31-637877061080567215.webp?w=48' },
      { name: 'Australia', shortname: 'AUS', img: 'https://g.cricapi.com/iapi/6-637877070670541994.webp?w=48' },
    ],
    score: [
      { r: 186, w: 6, o: 20, inning: 'Australia Inning 1' },
      { r: 169, w: 4, o: 18, inning: 'India Inning 1' },
    ],
    series_id: 'demo-series-global',
    hasSquad: true,
    matchStarted: true,
    matchEnded: false,
    tossWinner: 'India',
    tossChoice: 'bowl',
  },
  {
    id: 'demo-match-pak-sa',
    name: 'Pakistan vs South Africa, 2nd ODI, Demo Series 2026',
    matchType: 'odi',
    status: 'Pakistan won by 4 wickets',
    venue: 'National Stadium, Karachi',
    date: '2026-06-07',
    dateTimeGMT: '2026-06-07T09:30:00',
    teams: ['Pakistan', 'South Africa'],
    teamInfo: [
      { name: 'Pakistan', shortname: 'PAK', img: 'https://g.cricapi.com/iapi/66-637877075103037014.webp?w=48' },
      { name: 'South Africa', shortname: 'SA', img: 'https://g.cricapi.com/iapi/82-637877067928899419.webp?w=48' },
    ],
    score: [
      { r: 274, w: 9, o: 50, inning: 'South Africa Inning 1' },
      { r: 278, w: 6, o: 48.3, inning: 'Pakistan Inning 1' },
    ],
    series_id: 'demo-series-asia',
    hasSquad: true,
    matchStarted: true,
    matchEnded: true,
    matchWinner: 'Pakistan',
  },
  {
    id: 'demo-match-eng-nz',
    name: 'England vs New Zealand, Final, Demo Champions Cup',
    matchType: 't20',
    status: 'Match starts at Jun 10, 18:30 GMT',
    venue: 'Lord’s, London',
    date: '2026-06-10',
    dateTimeGMT: '2026-06-10T18:30:00',
    teams: ['England', 'New Zealand'],
    teamInfo: [
      { name: 'England', shortname: 'ENG', img: 'https://g.cricapi.com/iapi/23-637877073770208634.webp?w=48' },
      { name: 'New Zealand', shortname: 'NZ', img: 'https://g.cricapi.com/iapi/57-637877077352338294.webp?w=48' },
    ],
    score: [],
    series_id: 'demo-series-world',
    hasSquad: false,
    matchStarted: false,
    matchEnded: false,
  },
];

export const demoScoreFeed: ScoreFeedItem[] = [
  {
    id: 'demo-feed-1',
    dateTimeGMT: '2026-06-08T14:00:00',
    matchType: 't20',
    status: 'India need 18 runs from 12 balls',
    ms: 'live',
    t1: 'India [IND]',
    t2: 'Australia [AUS]',
    t1s: '169/4',
    t2s: '186/6',
    t1img: demoMatches[0].teamInfo?.[0].img,
    t2img: demoMatches[0].teamInfo?.[1].img,
    series: 'Demo Series 2026',
  },
  {
    id: 'demo-feed-2',
    dateTimeGMT: '2026-06-10T18:30:00',
    matchType: 't20',
    status: 'Match starts at Jun 10, 18:30 GMT',
    ms: 'fixture',
    t1: 'England [ENG]',
    t2: 'New Zealand [NZ]',
    series: 'Demo Champions Cup',
  },
  {
    id: 'demo-feed-3',
    dateTimeGMT: '2026-06-07T09:30:00',
    matchType: 'odi',
    status: 'Pakistan won by 4 wickets',
    ms: 'result',
    t1: 'Pakistan [PAK]',
    t2: 'South Africa [SA]',
    t1s: '278/6',
    t2s: '274/9',
    series: 'Asia ODI Demo 2026',
  },
];

export const demoSeries: SeriesSummary[] = [
  { id: 'demo-series-global', name: 'Demo Series 2026', startDate: '2026-06-08', endDate: 'Jun 14', odi: 0, t20: 3, test: 0, squads: 2, matches: 3 },
  { id: 'demo-series-asia', name: 'Asia ODI Demo 2026', startDate: '2026-06-01', endDate: 'Jun 09', odi: 3, t20: 0, test: 0, squads: 2, matches: 3 },
  { id: 'demo-series-world', name: 'Demo Champions Cup', startDate: '2026-06-10', endDate: 'Jun 20', odi: 0, t20: 5, test: 0, squads: 4, matches: 5 },
];

const demoSeriesMap: Record<string, SeriesInfoResponse> = {
  'demo-series-global': {
    info: { id: 'demo-series-global', name: 'Demo Series 2026', startdate: '2026-06-08', enddate: 'Jun 14', odi: 0, t20: 3, test: 0, squads: 2, matches: 3 },
    matchList: [demoMatches[0], demoMatches[2]],
  },
  'demo-series-asia': {
    info: { id: 'demo-series-asia', name: 'Asia ODI Demo 2026', startdate: '2026-06-01', enddate: 'Jun 09', odi: 3, t20: 0, test: 0, squads: 2, matches: 3 },
    matchList: [demoMatches[1]],
  },
  'demo-series-world': {
    info: { id: 'demo-series-world', name: 'Demo Champions Cup', startdate: '2026-06-10', enddate: 'Jun 20', odi: 0, t20: 5, test: 0, squads: 4, matches: 5 },
    matchList: [demoMatches[2]],
  },
};

const demoSquadsMap: Record<string, SquadTeam[]> = {
  'demo-match-ind-aus': [
    {
      teamName: 'India',
      shortname: 'IND',
      players: [playerInfoMap['demo-player-kohli'], playerInfoMap['demo-player-rohit'], playerInfoMap['demo-player-bumrah'], playerInfoMap['demo-player-gill']].map(
        ({ stats, placeOfBirth, ...player }) => player
      ),
    },
    {
      teamName: 'Australia',
      shortname: 'AUS',
      players: [playerInfoMap['demo-player-head'], playerInfoMap['demo-player-cummins']].map(({ stats, placeOfBirth, ...player }) => player),
    },
  ],
  'demo-match-pak-sa': [
    {
      teamName: 'Pakistan',
      shortname: 'PAK',
      players: [playerInfoMap['demo-player-rizwan'], playerInfoMap['demo-player-shaheen']].map(({ stats, placeOfBirth, ...player }) => player),
    },
    {
      teamName: 'South Africa',
      shortname: 'SA',
      players: [
        { id: 'demo-player-markram', name: 'Aiden Markram', country: 'South Africa', role: 'Batsman' },
        { id: 'demo-player-rabada', name: 'Kagiso Rabada', country: 'South Africa', role: 'Bowler' },
      ],
    },
  ],
};

export function getDemoCurrentMatches() {
  return demoMatches;
}

export function getDemoScoreFeed() {
  return demoScoreFeed;
}

export function getDemoSeries(search?: string) {
  const normalized = search?.trim().toLowerCase();
  return normalized ? demoSeries.filter((series) => series.name.toLowerCase().includes(normalized)) : demoSeries;
}

export function getDemoSeriesInfo(id: string) {
  return demoSeriesMap[id] ?? demoSeriesMap['demo-series-global'];
}

export function getDemoPlayers(search?: string) {
  const normalized = search?.trim().toLowerCase();
  return normalized ? demoPlayers.filter((player) => player.name.toLowerCase().includes(normalized)) : demoPlayers;
}

export function getDemoPlayerInfo(id: string) {
  return playerInfoMap[id] ?? playerInfoMap['demo-player-kohli'];
}

export function getDemoMatchInfo(id: string) {
  return demoMatches.find((match) => match.id === id) ?? demoMatches[0];
}

export function getDemoMatchSquad(id: string) {
  return demoSquadsMap[id] ?? demoSquadsMap['demo-match-ind-aus'];
}
