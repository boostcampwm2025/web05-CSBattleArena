import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistics } from '../user/entity/user-statistics.entity';
import { UserProblemBank } from '../problem-bank/entity/user-problem-bank.entity';
import { MatchType } from './dto/leaderboard-query.dto';
import {
  MultiLeaderboardResponseDto,
  MultiMyRankingDto,
  MultiRankingItemDto,
  SingleLeaderboardResponseDto,
  SingleMyRankingDto,
  SingleRankingItemDto,
} from './dto/leaderboard-response.dto';

const LEADERBOARD_LIMIT = 100;

interface SingleRankingRaw {
  nickname: string;
  userProfile: string | null;
  expPoint: string;
  userId: string;
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
      .leftJoinAndSelect('us.user', 'u')
      .select([
        'u.nickname AS nickname',
        'u.userProfile AS "userProfile"',
        'us.tierPoint AS "tierPoint"',
        'us.winCount AS "winCount"',
        'us.loseCount AS "loseCount"',
      ])
      .orderBy('us.tierPoint', 'DESC')
      .limit(LEADERBOARD_LIMIT)
      .getRawMany<MultiRankingItemDto>();

    return results.map((item) => ({
      nickname: item.nickname,
      userProfile: item.userProfile,
      tierPoint: Number(item.tierPoint) || 0,
      winCount: Number(item.winCount) || 0,
      loseCount: Number(item.loseCount) || 0,
    }));
  }

  private async getMultiMyRanking(userId: number): Promise<MultiMyRankingDto> {
    const myStats = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.user', 'u')
      .where('us.userId = :userId', { userId })
      .getOne();

    const rank = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .where('us.tierPoint > :tierPoint', { tierPoint: myStats?.tierPoint || 0 })
      .getCount();

    return {
      rank: rank + 1,
      nickname: myStats?.user?.nickname || '',
      userProfile: myStats?.user?.userProfile || null,
      tierPoint: Number(myStats?.tierPoint) || 0,
      winCount: Number(myStats?.winCount) || 0,
      loseCount: Number(myStats?.loseCount) || 0,
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
      .leftJoinAndSelect('us.user', 'u')
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

      return {
        nickname: item.nickname,
        userProfile: item.userProfile,
        expPoint: Number(item.expPoint) || 0,
        solvedCount: counts.solvedCount,
        correctCount: counts.correctCount,
      };
    });
  }

  private async getSingleMyRanking(userId: number): Promise<SingleMyRankingDto> {
    const myStats = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.user', 'u')
      .where('us.userId = :userId', { userId })
      .getOne();

    const rank = await this.userStatisticsRepository
      .createQueryBuilder('us')
      .where('us.expPoint > :expPoint', { expPoint: myStats?.expPoint || 0 })
      .getCount();

    const problemCounts = await this.getProblemCounts([userId]);
    const counts = problemCounts.get(userId) || { solvedCount: 0, correctCount: 0 };

    return {
      rank: rank + 1,
      nickname: myStats?.user?.nickname || '',
      userProfile: myStats?.user?.userProfile || null,
      expPoint: Number(myStats?.expPoint) || 0,
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
