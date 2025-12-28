export interface GlobalStatsValue {
  totalHaikusGenerated: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
}

export interface IGlobalStatsRepository {
  incrementHaikuCount(): Promise<void>;
  incrementGamePlayed(won: boolean): Promise<void>;
  getGlobalStats(): Promise<GlobalStatsValue>;
}

export const IGlobalStatsRepositoryToken = 'IGlobalStatsRepository';
