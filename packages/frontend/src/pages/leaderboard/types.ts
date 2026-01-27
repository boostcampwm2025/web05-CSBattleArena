export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MultiRankingItem {
  rank: number;
  nickname: string;
  userProfile: string | null;
  tierPoint: number;
  winCount: number;
  loseCount: number;
  tier: string;
}

export type MyMultiRanking = MultiRankingItem;

export interface SingleRankingItem {
  rank: number;
  nickname: string;
  userProfile: string | null;
  expPoint: number;
  level: number;
  solvedCount: number;
  correctCount: number;
}

export type MySingleRanking = SingleRankingItem;

export interface MultiLeaderboardResponse {
  rankings: MultiRankingItem[];
  myRanking: MyMultiRanking;
}

export interface SingleLeaderboardResponse {
  rankings: SingleRankingItem[];
  myRanking: MySingleRanking;
}

export type LeaderboardType = 'multi' | 'single';

export type LeaderboardResponse<T extends LeaderboardType> = T extends 'multi'
  ? MultiLeaderboardResponse
  : SingleLeaderboardResponse;
