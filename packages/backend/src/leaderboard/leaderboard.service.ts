import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistics } from '../user/entity/user-statistics.entity';
import { UserProblemBank } from '../problem-bank/entity/user-problem-bank.entity';
import { Tier } from '../tier/entity/tier.entity';
import { MatchType } from './dto/leaderboard-query.dto';
import { calculateLevel } from '../common/utils/level.util';
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
  userId: string;
}

interface SingleMyStatsRaw {
  nickname: string;
  userProfile: string | null;
  expPoint: string;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserStatistics)
    private readonly userStatisticsRepository: Repository<UserStatistics>,
    @InjectRepository(UserProblemBank)
    private readonly userProblemBankRepository: Repository<UserProblemBank>,
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
      .limit(LEADERBOARD_LIMIT)
      .getRawMany<MultiRankingRaw>();

    return results.map((item) => ({
      nickname: item.nickname,
      userProfile: item.userProfile,
      tierPoint: Number(item.tierPoint),
      winCount: Number(item.winCount),
      loseCount: Number(item.loseCount),
      tier: item.tier,
    }));
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

    const rank = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .where('us.tierPoint > :tierPoint', { tierPoint: myStats.tierPoint })
      .getCount();

    return {
      rank: rank + 1,
      nickname: myStats.nickname,
      userProfile: myStats.userProfile,
      tierPoint: Number(myStats.tierPoint),
      winCount: Number(myStats.winCount),
      loseCount: Number(myStats.loseCount),
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
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.expPoint AS "expPoint"',
        'us.userId AS "userId"',
      ])
      .orderBy('us.expPoint', 'DESC')
      .limit(LEADERBOARD_LIMIT)
      .getRawMany<SingleRankingRaw>();

    const userIds = results.map((r) => Number(r.userId));
    const problemCounts = await this.getProblemCounts(userIds);

    return results.map((item) => {
      const counts = problemCounts.get(Number(item.userId)) || { solvedCount: 0, correctCount: 0 };
      const expPoint = Number(item.expPoint);

      return {
        nickname: item.nickname,
        userProfile: item.userProfile,
        expPoint,
        level: calculateLevel(expPoint).level,
        solvedCount: counts.solvedCount,
        correctCount: counts.correctCount,
      };
    });
  }

  private async getSingleMyRanking(userId: number): Promise<SingleMyRankingDto> {
    const myStats = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .innerJoin('us.user', 'u')
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.expPoint AS "expPoint"',
      ])
      .where('us.userId = :userId', { userId })
      .getRawOne<SingleMyStatsRaw>();

    if (!myStats) {
      throw new NotFoundException('내 랭킹 정보를 찾을 수 없습니다.');
    }

    const expPoint = Number(myStats.expPoint);

    const rank = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .where('us.expPoint > :expPoint', { expPoint })
      .getCount();

    const problemCounts = await this.getProblemCounts([userId]);
    const counts = problemCounts.get(userId) || { solvedCount: 0, correctCount: 0 };

    return {
      rank: rank + 1,
      nickname: myStats.nickname,
      userProfile: myStats.userProfile,
      expPoint,
      level: calculateLevel(expPoint).level,
      solvedCount: counts.solvedCount,
      correctCount: counts.correctCount,
    };
  }

  private async getProblemCounts(
    userIds: number[],
  ): Promise<Map<number, { solvedCount: number; correctCount: number }>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const results = await this.userProblemBankRepository
      .createQueryBuilder('pb')
      .leftJoin('pb.match', 'm')
      .select('pb.userId', 'userId')
      .addSelect('COUNT(*)', 'solvedCount')
      .addSelect("SUM(CASE WHEN pb.answerStatus = 'correct' THEN 1 ELSE 0 END)", 'correctCount')
      .where('pb.userId IN (:...userIds)', { userIds })
      .andWhere("m.matchType = 'single'")
      .groupBy('pb.userId')
      .getRawMany<{ userId: string; solvedCount: string; correctCount: string }>();

    const map = new Map<number, { solvedCount: number; correctCount: number }>();

    for (const result of results) {
      map.set(Number(result.userId), {
        solvedCount: Number(result.solvedCount) || 0,
        correctCount: Number(result.correctCount) || 0,
      });
    }

    return map;
  }
}
