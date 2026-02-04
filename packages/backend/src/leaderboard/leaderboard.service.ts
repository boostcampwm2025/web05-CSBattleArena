import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserStatistics } from '../user/entity/user-statistics.entity';
import { UserProblemBank } from '../problem-bank/entity/user-problem-bank.entity';
import { Tier } from '../tier/entity/tier.entity';
import { MatchType } from './dto/leaderboard-query.dto';
import { calcLevel } from '../common/utils/level.util';
import {
  MultiLeaderboardResponseDto,
  MultiMyRankingDto,
  MultiRankingItemDto,
  SingleLeaderboardResponseDto,
  SingleMyRankingDto,
  SingleRankingItemDto,
} from './dto/leaderboard-response.dto';

const LEADERBOARD_LIMIT = 100;

interface MultiRankingRaw {
  nickname: string;
  userProfile: string | null;
  tierPoint: string;
  winCount: string;
  loseCount: string;
  tier: string;
}

interface SingleRankingRaw {
  nickname: string;
  userProfile: string | null;
  expPoint: string;
  solvedCount: string;
  correctCount: string;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserStatistics)
    private readonly userStatisticsRepository: Repository<UserStatistics>,
  ) {}

  async getLeaderboard(
    type: MatchType,
    userId: number,
  ): Promise<MultiLeaderboardResponseDto | SingleLeaderboardResponseDto> {
    if (type === MatchType.MULTI) {
      return this.getMultiLeaderboard(userId);
    }

    return this.getSingleLeaderboard(userId);
  }

  private async getMultiLeaderboard(userId: number): Promise<MultiLeaderboardResponseDto> {
    const rankings = await this.getMultiRankings();
    const myRanking = await this.getMultiMyRanking(userId);

    return { rankings, myRanking };
  }

  private async getMultiRankings(): Promise<MultiRankingItemDto[]> {
    const results = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .innerJoin('us.user', 'u')
      .innerJoin(
        Tier,
        't',
        't.minPoints <= us.tierPoint AND (t.maxPoints >= us.tierPoint OR t.maxPoints IS NULL)',
      )
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.tierPoint AS "tierPoint"',
        'us.winCount AS "winCount"',
        'us.loseCount AS "loseCount"',
        't.name AS tier',
      ])
      .orderBy('us.tierPoint', 'DESC')
      .addOrderBy(
        'CASE WHEN us.winCount + us.loseCount > 0 THEN us.winCount * 1.0 / (us.winCount + us.loseCount) ELSE 0 END',
        'DESC',
      )
      .addOrderBy('us.winCount + us.loseCount', 'DESC')
      .limit(LEADERBOARD_LIMIT)
      .getRawMany<MultiRankingRaw>();

    const items = results.map((item) => ({
      nickname: item.nickname,
      userProfile: item.userProfile,
      tierPoint: Number(item.tierPoint),
      winCount: Number(item.winCount),
      loseCount: Number(item.loseCount),
      tier: item.tier,
    }));

    return this.assignMultiRanks(items);
  }

  private assignMultiRanks(items: Omit<MultiRankingItemDto, 'rank'>[]): MultiRankingItemDto[] {
    const getWinRate = (item: Omit<MultiRankingItemDto, 'rank'>) => {
      const total = item.winCount + item.loseCount;

      return total > 0 ? item.winCount / total : 0;
    };

    const getTotalGames = (item: Omit<MultiRankingItemDto, 'rank'>) =>
      item.winCount + item.loseCount;

    return items.reduce<MultiRankingItemDto[]>((acc, item, idx) => {
      const prev = acc[idx - 1];
      const isSameRank =
        prev &&
        item.tierPoint === prev.tierPoint &&
        getWinRate(item) === getWinRate(prev) &&
        getTotalGames(item) === getTotalGames(prev);

      const rank = isSameRank ? prev.rank : idx + 1;

      return [...acc, { rank, ...item }];
    }, []);
  }

  private async getMultiMyRanking(userId: number): Promise<MultiMyRankingDto> {
    const myStats = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .innerJoin('us.user', 'u')
      .innerJoin(
        Tier,
        't',
        't.minPoints <= us.tierPoint AND (t.maxPoints >= us.tierPoint OR t.maxPoints IS NULL)',
      )
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.tierPoint AS "tierPoint"',
        'us.winCount AS "winCount"',
        'us.loseCount AS "loseCount"',
        't.name AS tier',
      ])
      .where('us.userId = :userId', { userId })
      .getRawOne<MultiRankingRaw>();

    if (!myStats) {
      throw new NotFoundException('내 랭킹 정보를 찾을 수 없습니다.');
    }

    const tierPoint = Number(myStats.tierPoint);
    const winCount = Number(myStats.winCount);
    const loseCount = Number(myStats.loseCount);
    const totalGames = winCount + loseCount;

    const winRateExpr =
      'CASE WHEN us.winCount + us.loseCount > 0 THEN us.winCount * 1.0 / (us.winCount + us.loseCount) ELSE 0 END';
    const myWinRateExpr = totalGames > 0 ? ':winCount * 1.0 / :totalGames' : '0';

    const result = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .select('COUNT(*) + 1', 'rank')
      .where('us.tierPoint > :tierPoint')
      .orWhere(
        new Brackets((qb) => {
          qb.where('us.tierPoint = :tierPoint').andWhere(`${winRateExpr} > ${myWinRateExpr}`);
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('us.tierPoint = :tierPoint')
            .andWhere(`${winRateExpr} = ${myWinRateExpr}`)
            .andWhere('us.winCount + us.loseCount > :totalGames');
        }),
      )
      .setParameters({ tierPoint, winCount, totalGames })
      .getRawOne<{ rank: string }>();

    const rank = result ? Number(result.rank) : 0;

    return {
      rank,
      nickname: myStats.nickname,
      userProfile: myStats.userProfile,
      tierPoint,
      winCount,
      loseCount,
      tier: myStats.tier,
    };
  }

  private async getSingleLeaderboard(userId: number): Promise<SingleLeaderboardResponseDto> {
    const rankings = await this.getSingleRankings();
    const myRanking = await this.getSingleMyRanking(userId);

    return { rankings, myRanking };
  }

  private async getSingleRankings(): Promise<SingleRankingItemDto[]> {
    const results = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .innerJoin('us.user', 'u')
      .leftJoin(
        (qb) =>
          qb
            .select('pb.userId', 'odbc')
            .addSelect('COUNT(*)', 'solved_count')
            .addSelect(
              "SUM(CASE WHEN pb.answerStatus = 'correct' THEN 1 ELSE 0 END)",
              'correct_count',
            )
            .from(UserProblemBank, 'pb')
            .innerJoin('pb.match', 'm')
            .where("m.matchType = 'single'")
            .groupBy('pb.userId'),
        'pb_stats',
        'us.userId = pb_stats.odbc',
      )
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.expPoint AS "expPoint"',
        'COALESCE(pb_stats.solved_count, 0) AS "solvedCount"',
        'COALESCE(pb_stats.correct_count, 0) AS "correctCount"',
      ])
      .orderBy('us.expPoint', 'DESC')
      .addOrderBy(
        'CASE WHEN COALESCE(pb_stats.solved_count, 0) > 0 THEN COALESCE(pb_stats.correct_count, 0) * 1.0 / pb_stats.solved_count ELSE 0 END',
        'DESC',
      )
      .addOrderBy('COALESCE(pb_stats.solved_count, 0)', 'DESC')
      .limit(LEADERBOARD_LIMIT)
      .getRawMany<SingleRankingRaw>();

    const items = results.map((item) => ({
      nickname: item.nickname,
      userProfile: item.userProfile,
      expPoint: Number(item.expPoint),
      level: calcLevel(Number(item.expPoint)).level,
      solvedCount: Number(item.solvedCount),
      correctCount: Number(item.correctCount),
    }));

    return this.assignSingleRanks(items);
  }

  private assignSingleRanks(items: Omit<SingleRankingItemDto, 'rank'>[]): SingleRankingItemDto[] {
    const getCorrectRate = (item: Omit<SingleRankingItemDto, 'rank'>) =>
      item.solvedCount > 0 ? item.correctCount / item.solvedCount : 0;

    return items.reduce<SingleRankingItemDto[]>((acc, item, idx) => {
      const prev = acc[idx - 1];
      const isSameRank =
        prev &&
        item.expPoint === prev.expPoint &&
        getCorrectRate(item) === getCorrectRate(prev) &&
        item.solvedCount === prev.solvedCount;

      const rank = isSameRank ? prev.rank : idx + 1;

      return [...acc, { rank, ...item }];
    }, []);
  }

  private async getSingleMyRanking(userId: number): Promise<SingleMyRankingDto> {
    const myStats = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .innerJoin('us.user', 'u')
      .leftJoin(
        (qb) =>
          qb
            .select('pb.userId', 'odbc')
            .addSelect('COUNT(*)', 'solved_count')
            .addSelect(
              "SUM(CASE WHEN pb.answerStatus = 'correct' THEN 1 ELSE 0 END)",
              'correct_count',
            )
            .from(UserProblemBank, 'pb')
            .innerJoin('pb.match', 'm')
            .where("m.matchType = 'single'")
            .groupBy('pb.userId'),
        'pb_stats',
        'us.userId = pb_stats.odbc',
      )
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.expPoint AS "expPoint"',
        'COALESCE(pb_stats.solved_count, 0) AS "solvedCount"',
        'COALESCE(pb_stats.correct_count, 0) AS "correctCount"',
      ])
      .where('us.userId = :userId', { userId })
      .getRawOne<SingleRankingRaw>();

    if (!myStats) {
      throw new NotFoundException('내 랭킹 정보를 찾을 수 없습니다.');
    }

    const expPoint = Number(myStats.expPoint);
    const solvedCount = Number(myStats.solvedCount);
    const correctCount = Number(myStats.correctCount);

    const correctRateExpr =
      'CASE WHEN COALESCE(pb_stats.solved_count, 0) > 0 THEN COALESCE(pb_stats.correct_count, 0) * 1.0 / pb_stats.solved_count ELSE 0 END';
    const myCorrectRateExpr = solvedCount > 0 ? ':correctCount * 1.0 / :solvedCount' : '0';

    const result = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .leftJoin(
        (qb) =>
          qb
            .select('pb.userId', 'odbc')
            .addSelect('COUNT(*)', 'solved_count')
            .addSelect(
              "SUM(CASE WHEN pb.answerStatus = 'correct' THEN 1 ELSE 0 END)",
              'correct_count',
            )
            .from(UserProblemBank, 'pb')
            .innerJoin('pb.match', 'm')
            .where("m.matchType = 'single'")
            .groupBy('pb.userId'),
        'pb_stats',
        'us.userId = pb_stats.odbc',
      )
      .select('COUNT(*) + 1', 'rank')
      .where('us.expPoint > :expPoint')
      .orWhere(
        new Brackets((qb) => {
          qb.where('us.expPoint = :expPoint').andWhere(`${correctRateExpr} > ${myCorrectRateExpr}`);
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('us.expPoint = :expPoint')
            .andWhere(`${correctRateExpr} = ${myCorrectRateExpr}`)
            .andWhere('COALESCE(pb_stats.solved_count, 0) > :solvedCount');
        }),
      )
      .setParameters({ expPoint, correctCount, solvedCount })
      .getRawOne<{ rank: string }>();

    const rank = result ? Number(result.rank) : 0;

    return {
      rank,
      nickname: myStats.nickname,
      userProfile: myStats.userProfile,
      expPoint,
      level: calcLevel(expPoint).level,
      solvedCount,
      correctCount,
    };
  }
}
