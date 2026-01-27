export class ProfileDto {
  nickname: string;
  profileImage: string | null;
  email: string | null;
  createdAt: Date;
}

export class RankDto {
  tier: string;
  tierPoint: number;
}

export class LevelDto {
  level: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
}

export class MatchStatsDto {
  totalMatches: number;
  winCount: number;
  loseCount: number;
  drawCount: number;
  winRate: number;
}

export class ProblemStatsDto {
  totalSolved: number;
  correctCount: number;
  incorrectCount: number;
  partialCount: number;
  correctRate: number;
}

export class MyPageResponseDto {
  profile: ProfileDto;
  rank: RankDto;
  level: LevelDto;
  matchStats: MatchStatsDto;
  problemStats: ProblemStatsDto;
}
