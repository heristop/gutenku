export interface GlobalStatsValue {
  totalHaikusGenerated: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  // Hint tracking
  totalEmoticonScratches: number;
  totalHaikuReveals: number;
  totalRoundHints: number;
  // Daily tracking
  todayHaikusGenerated: number;
  todayEmoticonScratches: number;
  todayHaikuReveals: number;
  todayRoundHints: number;
  todayGamesPlayed: number;
  todayGamesWon: number;
  currentDay: string;
}

export interface HintStats {
  emoticonScratches: number;
  haikuReveals: number;
  roundHints: number;
}

export interface IGlobalStatsRepository {
  incrementHaikuCount(): Promise<void>;
  incrementGamePlayed(won: boolean, hints?: HintStats): Promise<void>;
  getGlobalStats(): Promise<GlobalStatsValue>;
}

export const IGlobalStatsRepositoryToken = 'IGlobalStatsRepository';
