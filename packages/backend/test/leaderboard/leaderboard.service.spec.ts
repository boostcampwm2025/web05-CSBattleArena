import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LeaderboardService } from '../../src/leaderboard/leaderboard.service';
import { UserStatistics } from '../../src/user/entity/user-statistics.entity';
import { UserProblemBank } from '../../src/problem-bank/entity/user-problem-bank.entity';
import { MatchType } from '../../src/leaderboard/dto/leaderboard-query.dto';
import {
  MultiLeaderboardResponseDto,
  SingleLeaderboardResponseDto,
} from '../../src/leaderboard/dto/leaderboard-response.dto';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let mockUserStatisticsRepository: any;
  let mockUserProblemBankRepository: any;

  const createMockQueryBuilder = (overrides = {}) => ({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getRawOne: jest.fn().mockResolvedValue(null),
    getCount: jest.fn().mockResolvedValue(0),
    getRawMany: jest.fn().mockResolvedValue([]),
    ...overrides,
  });

  beforeEach(async () => {
    mockUserStatisticsRepository = {
      createQueryBuilder: jest.fn(),
    };

    mockUserProblemBankRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(UserStatistics),
          useValue: mockUserStatisticsRepository,
        },
        {
          provide: getRepositoryToken(UserProblemBank),
          useValue: mockUserProblemBankRepository,
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Multi 모드 리더보드', () => {
    const setupMultiMocks = (rankings: any[], myStats: any, rankCount = 0) => {
      const rankingsQB = createMockQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue(rankings),
      });
      const myStatsQB = createMockQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue(myStats),
      });
      const rankCountQB = createMockQueryBuilder({
        getCount: jest.fn().mockResolvedValue(rankCount),
      });

      mockUserStatisticsRepository.createQueryBuilder
        .mockReturnValueOnce(rankingsQB)
        .mockReturnValueOnce(myStatsQB)
        .mockReturnValueOnce(rankCountQB);
    };

    it('랭킹 목록과 내 순위를 반환한다', async () => {
      const rankings = [
        { nickname: 'user1', userProfile: 'http://example.com/1.jpg', tierPoint: '2500', winCount: '50', loseCount: '10', tier: 'diamond' },
        { nickname: 'user2', userProfile: null, tierPoint: '2000', winCount: '40', loseCount: '15', tier: 'platinum' },
      ];
      const myStats = {
        nickname: 'testUser',
        userProfile: null,
        tierPoint: '1500',
        winCount: '20',
        loseCount: '10',
        tier: 'gold',
      };

      setupMultiMocks(rankings, myStats, 5);

      const result = await service.getLeaderboard(MatchType.MULTI, 1) as MultiLeaderboardResponseDto;

      expect(result.rankings).toHaveLength(2);
      expect(result.rankings[0].tierPoint).toBe(2500);
      expect(result.rankings[0].tier).toBe('diamond');
      expect(result.myRanking.rank).toBe(6);
      expect(result.myRanking.tierPoint).toBe(1500);
      expect(result.myRanking.tier).toBe('gold');
    });

    it('tierPoint가 가장 높으면 1등을 반환한다', async () => {
      const rankings = [
        { nickname: 'topUser', userProfile: null, tierPoint: '3000', winCount: '100', loseCount: '5', tier: 'diamond' },
      ];
      const myStats = {
        nickname: 'topUser',
        userProfile: null,
        tierPoint: '3000',
        winCount: '100',
        loseCount: '5',
        tier: 'diamond',
      };

      setupMultiMocks(rankings, myStats, 0);

      const result = await service.getLeaderboard(MatchType.MULTI, 1) as MultiLeaderboardResponseDto;

      expect(result.myRanking.rank).toBe(1);
    });

    it('내 통계 정보가 없으면 NotFoundException을 던진다', async () => {
      const rankings = [
        { nickname: 'user1', userProfile: null, tierPoint: '2500', winCount: '50', loseCount: '10', tier: 'diamond' },
      ];

      setupMultiMocks(rankings, null, 0);

      await expect(service.getLeaderboard(MatchType.MULTI, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Single 모드 리더보드', () => {
    const setupSingleMocks = (rankings: any[], myStats: any, rankCount = 0, problemCounts: any[] = [], myProblemCounts: any[] = []) => {
      const rankingsQB = createMockQueryBuilder({
        getRawMany: jest.fn().mockResolvedValue(rankings),
      });
      const myStatsQB = createMockQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue(myStats),
      });
      const rankCountQB = createMockQueryBuilder({
        getCount: jest.fn().mockResolvedValue(rankCount),
      });
      const problemCountsQB = createMockQueryBuilder({
        getRawMany: jest.fn()
          .mockResolvedValueOnce(problemCounts)
          .mockResolvedValueOnce(myProblemCounts),
      });

      mockUserStatisticsRepository.createQueryBuilder
        .mockReturnValueOnce(rankingsQB)
        .mockReturnValueOnce(myStatsQB)
        .mockReturnValueOnce(rankCountQB);

      mockUserProblemBankRepository.createQueryBuilder
        .mockReturnValueOnce(problemCountsQB)
        .mockReturnValueOnce(problemCountsQB);
    };

    it('랭킹 목록과 내 순위를 반환한다', async () => {
      const rankings = [
        { nickname: 'user1', userProfile: null, expPoint: '15000', userId: '1' },
        { nickname: 'user2', userProfile: null, expPoint: '12000', userId: '2' },
      ];
      const myStats = {
        nickname: 'testUser',
        userProfile: null,
        expPoint: '8000',
      };
      const problemCounts = [
        { userId: '1', solvedCount: '100', correctCount: '85' },
        { userId: '2', solvedCount: '80', correctCount: '60' },
      ];
      const myProblemCounts = [{ userId: '1', solvedCount: '50', correctCount: '40' }];

      setupSingleMocks(rankings, myStats, 2, problemCounts, myProblemCounts);

      const result = await service.getLeaderboard(MatchType.SINGLE, 1) as SingleLeaderboardResponseDto;

      expect(result.rankings).toHaveLength(2);
      expect(result.rankings[0].expPoint).toBe(15000);
      expect(result.rankings[0].level).toBe(150);
      expect(result.rankings[0].solvedCount).toBe(100);
      expect(result.myRanking.rank).toBe(3);
      expect(result.myRanking.level).toBe(80);
    });

    it('푼 문제가 없으면 solvedCount와 correctCount는 0을 반환한다', async () => {
      const rankings = [{ nickname: 'user1', userProfile: null, expPoint: '100', userId: '1' }];
      const myStats = {
        nickname: 'testUser',
        userProfile: null,
        expPoint: '100',
      };

      setupSingleMocks(rankings, myStats, 0, [], []);

      const result = await service.getLeaderboard(MatchType.SINGLE, 1) as SingleLeaderboardResponseDto;

      expect(result.rankings[0].solvedCount).toBe(0);
      expect(result.rankings[0].correctCount).toBe(0);
      expect(result.myRanking.solvedCount).toBe(0);
    });

    it('내 통계 정보가 없으면 NotFoundException을 던진다', async () => {
      const rankings = [{ nickname: 'user1', userProfile: null, expPoint: '15000', userId: '1' }];
      const problemCounts = [{ userId: '1', solvedCount: '100', correctCount: '85' }];

      setupSingleMocks(rankings, null, 0, problemCounts, []);

      await expect(service.getLeaderboard(MatchType.SINGLE, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('엣지 케이스', () => {
    it('유저가 없으면 빈 랭킹을 반환한다', async () => {
      const rankingsQB = createMockQueryBuilder({ getRawMany: jest.fn().mockResolvedValue([]) });
      const myStatsQB = createMockQueryBuilder({
        getRawOne: jest.fn().mockResolvedValue({
          nickname: 'testUser',
          userProfile: null,
          tierPoint: '1000',
          winCount: '10',
          loseCount: '5',
          tier: 'silver',
        }),
      });
      const rankCountQB = createMockQueryBuilder({
        getCount: jest.fn().mockResolvedValue(0),
      });

      mockUserStatisticsRepository.createQueryBuilder
        .mockReturnValueOnce(rankingsQB)
        .mockReturnValueOnce(myStatsQB)
        .mockReturnValueOnce(rankCountQB);

      const result = await service.getLeaderboard(MatchType.MULTI, 1) as MultiLeaderboardResponseDto;

      expect(result.rankings).toHaveLength(0);
      expect(result.myRanking.rank).toBe(1);
    });
  });
});
