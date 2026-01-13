export interface GlobalStatsValue {
  totalHaikusGenerated: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  // Hint tracking
  totalEmoticonScratches: number;
  totalHaikuReveals: number;
  // Daily tracking
  todayHaikusGenerated: number;
  todayEmoticonScratches: number;
  todayHaikuReveals: number;
  todayGamesPlayed: number;
  todayGamesWon: number;
  currentDay: string;
}

export interface HintStats {
  emoticonScratches: number;
  haikuReveals: number;
}

export interface IGlobalStatsRepository {
  incrementHaikuCount(): Promise<void>;
  incrementGamePlayed(won: boolean, hints?: HintStats): Promise<void>;
  getGlobalStats(): Promise<GlobalStatsValue>;
}

export const IGlobalStatsRepositoryToken = 'IGlobalStatsRepository';
