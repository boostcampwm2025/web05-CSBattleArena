export class ProfileDto {
  id: number;
  nickname: string;
  profileImage: string | null;
  email: string | null;
  oauthProvider: 'google' | 'kakao' | 'naver' | 'github' | null;
  createdAt: Date;
}

export class RankDto {
  tier: string;
  tierPoint: number;
  ranking: number;
}

export class LevelDto {
  level: number;
  expPoint: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
}

export class MatchStatsDto {
  totalMatches: number;
  winCount: number;
  loseCount: number;
  winRate: number;
}

export class ProblemStatsDto {
  totalSolved: number;
  correctCount: number;
  incorrectCount: number;
  partialCount: number;
  correctRate: number;
}

export class CategoryAnalysisItemDto {
  categoryId: number;
  categoryName: string;
  correctRate: number;
  totalCount: number;
  correctCount: number;
}

export class CategoryAnalysisDto {
  strong: CategoryAnalysisItemDto[];
  weak: CategoryAnalysisItemDto[];
  all: CategoryAnalysisItemDto[];
}

export class MyPageResponseDto {
  profile: ProfileDto;
  rank: RankDto;
  level: LevelDto;
  matchStats: MatchStatsDto;
  problemStats: ProblemStatsDto;
  categoryAnalysis: CategoryAnalysisDto;
}
