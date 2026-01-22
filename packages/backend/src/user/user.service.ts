import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatistics } from './entity';
import { UserProblemBank } from '../problem-bank/entity';
import {
  CategoryAnalysisDto,
  CategoryAnalysisItemDto,
  MatchStatsDto,
  MyPageResponseDto,
  ProblemStatsDto,
  ProfileDto,
  RankDto,
} from './dto/mypage-response.dto';
import { calculateLevel } from '../common/utils/level.util';
import { calculateTier } from '../common/utils/tier.util';

const STRONG_THRESHOLD = 70;
const MIN_PROBLEMS_FOR_ANALYSIS = 5;

interface ProblemStatsRaw {
  totalSolved: string;
  correctCount: string;
  incorrectCount: string;
  partialCount: string;
}

interface RankingRaw {
  ranking: string;
}

interface CategoryAnalysisRaw {
  categoryId: string;
  categoryName: string;
  totalCount: string;
  correctCount: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStatistics)
    private readonly userStatisticsRepository: Repository<UserStatistics>,
    @InjectRepository(UserProblemBank)
    private readonly userProblemBankRepository: Repository<UserProblemBank>,
  ) {}

  async getMyPageData(userId: number): Promise<MyPageResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['statistics'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const profile = this.buildProfile(user);
    const stats = user.statistics;
    const tierPoint = stats?.tierPoint ?? 0;
    const expPoint = stats?.expPoint ?? 0;

    const [ranking, categoryAnalysis] = await Promise.all([
      this.getUserRanking(tierPoint),
      this.getCategoryAnalysis(userId),
    ]);

    const rank = this.buildRank(tierPoint, ranking);
    const level = calculateLevel(expPoint);
    const matchStats = this.buildMatchStats(stats);
    const problemStats = await this.buildProblemStats(userId);

    return {
      profile,
      rank,
      level,
      matchStats,
      problemStats,
      categoryAnalysis,
    };
  }

  private buildProfile(user: User): ProfileDto {
    return {
      id: Number(user.id),
      nickname: user.nickname,
      profileImage: user.userProfile,
      email: user.email,
      oauthProvider: user.oauthProvider,
      createdAt: user.createdAt,
    };
  }

  private buildRank(tierPoint: number, ranking: number): RankDto {
    return {
      tier: calculateTier(tierPoint),
      tierPoint,
      ranking,
    };
  }

  private buildMatchStats(stats: UserStatistics | null): MatchStatsDto {
    const totalMatches = stats?.totalMatches ?? 0;
    const winCount = stats?.winCount ?? 0;
    const loseCount = stats?.loseCount ?? 0;
    const winRate = totalMatches > 0 ? Math.round((winCount / totalMatches) * 1000) / 10 : 0;

    return {
      totalMatches,
      winCount,
      loseCount,
      winRate,
    };
  }

  private async buildProblemStats(userId: number): Promise<ProblemStatsDto> {
    const result = await this.userProblemBankRepository
      .createQueryBuilder('upb')
      .select('COUNT(*)', 'totalSolved')
      .addSelect("SUM(CASE WHEN upb.answer_status = 'correct' THEN 1 ELSE 0 END)", 'correctCount')
      .addSelect(
        "SUM(CASE WHEN upb.answer_status = 'incorrect' THEN 1 ELSE 0 END)",
        'incorrectCount',
      )
      .addSelect("SUM(CASE WHEN upb.answer_status = 'partial' THEN 1 ELSE 0 END)", 'partialCount')
      .where('upb.user_id = :userId', { userId })
      .getRawOne<ProblemStatsRaw>();

    const totalSolved = Number(result?.totalSolved ?? 0);
    const correctCount = Number(result?.correctCount ?? 0);
    const incorrectCount = Number(result?.incorrectCount ?? 0);
    const partialCount = Number(result?.partialCount ?? 0);
    const correctRate = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 1000) / 10 : 0;

    return {
      totalSolved,
      correctCount,
      incorrectCount,
      partialCount,
      correctRate,
    };
  }

  private async getUserRanking(tierPoint: number): Promise<number> {
    const result = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .select('COUNT(*) + 1', 'ranking')
      .where('us.tier_point > :tierPoint', { tierPoint })
      .getRawOne<RankingRaw>();

    return Number(result?.ranking ?? 1);
  }

  private async getCategoryAnalysis(userId: number): Promise<CategoryAnalysisDto> {
    const rawResults = await this.userProblemBankRepository
      .createQueryBuilder('upb')
      .select('parent.id', 'categoryId')
      .addSelect('parent.name', 'categoryName')
      .addSelect('COUNT(upb.id)', 'totalCount')
      .addSelect("SUM(CASE WHEN upb.answer_status = 'correct' THEN 1 ELSE 0 END)", 'correctCount')
      .innerJoin('questions', 'q', 'upb.question_id = q.id')
      .innerJoin('category_questions', 'cq', 'q.id = cq.question_id')
      .innerJoin('categories', 'child', 'cq.category_id = child.id')
      .innerJoin('categories', 'parent', 'child.parent_id = parent.id')
      .where('upb.user_id = :userId', { userId })
      .groupBy('parent.id')
      .addGroupBy('parent.name')
      .having('COUNT(upb.id) >= :minCount', { minCount: MIN_PROBLEMS_FOR_ANALYSIS })
      .getRawMany<CategoryAnalysisRaw>();

    const all: CategoryAnalysisItemDto[] = rawResults.map((row) => {
      const totalCount = Number(row.totalCount);
      const correctCount = Number(row.correctCount);
      const correctRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 1000) / 10 : 0;

      return {
        categoryId: Number(row.categoryId),
        categoryName: row.categoryName,
        correctRate,
        totalCount,
        correctCount,
      };
    });

    const strong = all.filter((item) => item.correctRate >= STRONG_THRESHOLD);
    const weak = all.filter((item) => item.correctRate < STRONG_THRESHOLD);

    return { strong, weak, all };
  }
}
