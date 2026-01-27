import {
  calculateExpectedScore,
  calculateKFactor,
  calculateEloChange,
  calculateNewRating,
  calculateMatchEloUpdate,
  ELO_CONFIG,
} from '../src/common/utils/elo.util';

describe('ELO Utility Functions', () => {
  describe('calculateExpectedScore', () => {
    it('동일한 ELO일 때 승리 확률은 50%여야 함', () => {
      const expected = calculateExpectedScore(1000, 1000);
      expect(expected).toBeCloseTo(0.5, 2);
    });

    it('ELO가 400 높을 때 승리 확률은 약 91%여야 함', () => {
      const expected = calculateExpectedScore(1400, 1000);
      expect(expected).toBeCloseTo(0.91, 2);
    });

    it('ELO가 400 낮을 때 승리 확률은 약 9%여야 함', () => {
      const expected = calculateExpectedScore(1000, 1400);
      expect(expected).toBeCloseTo(0.09, 2);
    });
  });

  describe('calculateKFactor', () => {
    it('신규 유저 (30경기 미만)는 K-factor 40을 반환해야 함', () => {
      expect(calculateKFactor(1000, 10)).toBe(ELO_CONFIG.K_FACTOR_BEGINNER);
      expect(calculateKFactor(1500, 29)).toBe(ELO_CONFIG.K_FACTOR_BEGINNER);
    });

    it('중급 유저는 K-factor 32를 반환해야 함', () => {
      expect(calculateKFactor(1000, 30)).toBe(ELO_CONFIG.K_FACTOR_INTERMEDIATE);
      expect(calculateKFactor(2000, 50)).toBe(ELO_CONFIG.K_FACTOR_INTERMEDIATE);
    });

    it('고급 유저 (ELO 2400+)는 K-factor 16을 반환해야 함', () => {
      expect(calculateKFactor(2400, 30)).toBe(ELO_CONFIG.K_FACTOR_ADVANCED);
      expect(calculateKFactor(2800, 100)).toBe(ELO_CONFIG.K_FACTOR_ADVANCED);
    });
  });

  describe('calculateEloChange', () => {
    it('동일 ELO 유저가 승리하면 약 +16 변동 (K=32 기준)', () => {
      const change = calculateEloChange(1000, 1000, true, 30);
      expect(change).toBe(16); // 32 * (1 - 0.5) = 16
    });

    it('동일 ELO 유저가 패배하면 약 -16 변동 (K=32 기준)', () => {
      const change = calculateEloChange(1000, 1000, false, 30);
      expect(change).toBe(-16); // 32 * (0 - 0.5) = -16
    });

    it('약한 유저가 강한 유저를 이기면 많은 점수를 얻어야 함', () => {
      const change = calculateEloChange(1000, 1400, true, 30);
      expect(change).toBeGreaterThan(25); // 예상 승률이 낮았으므로 큰 보상
    });

    it('강한 유저가 약한 유저를 이기면 적은 점수를 얻어야 함', () => {
      const change = calculateEloChange(1400, 1000, true, 30);
      expect(change).toBeLessThan(5); // 예상 승률이 높았으므로 작은 보상
    });
  });

  describe('calculateNewRating', () => {
    it('현재 ELO에 변동량을 더해야 함', () => {
      expect(calculateNewRating(1000, 20)).toBe(1020);
      expect(calculateNewRating(1500, -15)).toBe(1485);
    });

    it('ELO는 최소 0이어야 함', () => {
      expect(calculateNewRating(50, -100)).toBe(0);
      expect(calculateNewRating(0, -10)).toBe(0);
    });
  });

  describe('calculateMatchEloUpdate', () => {
    it('동일 ELO 매치의 승패 결과를 정확히 계산해야 함', () => {
      const result = calculateMatchEloUpdate(1000, 1000, 30, 30);

      expect(result.winnerNewRating).toBe(1016);
      expect(result.loserNewRating).toBe(984);
      expect(result.winnerChange).toBe(16);
      expect(result.loserChange).toBe(-16);
    });

    it('약한 유저(1000)가 강한 유저(1400)를 이긴 경우', () => {
      const result = calculateMatchEloUpdate(1000, 1400, 30, 30);

      expect(result.winnerChange).toBeGreaterThan(25); // 큰 상승
      expect(result.loserChange).toBeLessThan(-5); // 작은 하락
      expect(result.winnerNewRating).toBeGreaterThan(1025);
      expect(result.loserNewRating).toBeLessThan(1395);
    });

    it('강한 유저(1400)가 약한 유저(1000)를 이긴 경우', () => {
      const result = calculateMatchEloUpdate(1400, 1000, 30, 30);

      expect(result.winnerChange).toBeLessThan(5); // 작은 상승
      expect(result.loserChange).toBeGreaterThan(-30); // 약한 유저는 큰 하락이지만 -30 이상
      expect(result.loserChange).toBeLessThan(0); // 음수
      expect(result.winnerNewRating).toBeLessThan(1405);
      expect(result.loserNewRating).toBeGreaterThan(970);
    });

    it('신규 유저는 K-factor가 높아 변동폭이 커야 함', () => {
      const beginner = calculateMatchEloUpdate(1000, 1000, 10, 30);
      const intermediate = calculateMatchEloUpdate(1000, 1000, 30, 30);

      expect(Math.abs(beginner.winnerChange)).toBeGreaterThan(Math.abs(intermediate.winnerChange));
    });
  });
});