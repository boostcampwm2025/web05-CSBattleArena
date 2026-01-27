/**
 * 기본 ELO 설정
 */
export const ELO_CONFIG = {
  INITIAL_RATING: 1000, // 초기 ELO
  K_FACTOR_BEGINNER: 40, // 신규 유저 (30경기 미만)
  K_FACTOR_INTERMEDIATE: 32, // 중급 유저
  K_FACTOR_ADVANCED: 16, // 고급 유저 (ELO 2400+)
  BEGINNER_GAME_THRESHOLD: 30, // 신규 유저 판정 기준 (경기 수)
  ADVANCED_ELO_THRESHOLD: 2400, // 고급 유저 판정 기준 (ELO)
} as const;

/**
 * 승리 예상 확률 계산
 *
 * @param playerRating - 플레이어의 ELO
 * @param opponentRating - 상대의 ELO
 * @returns 승리 예상 확률 (0~1)
 *
 * 공식: 1 / (1 + 10^((상대ELO - 내ELO) / 400))
 */
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * K-factor 계산 (ELO 변동폭 결정)
 *
 * @param currentRating - 현재 ELO
 * @param totalGames - 총 경기 수
 * @returns K-factor
 */
export function calculateKFactor(currentRating: number, totalGames: number): number {
  // 신규 유저: 빠른 레이팅 조정
  if (totalGames < ELO_CONFIG.BEGINNER_GAME_THRESHOLD) {
    return ELO_CONFIG.K_FACTOR_BEGINNER;
  }

  // 고급 유저: 레이팅 안정화
  if (currentRating >= ELO_CONFIG.ADVANCED_ELO_THRESHOLD) {
    return ELO_CONFIG.K_FACTOR_ADVANCED;
  }

  // 중급 유저: 표준 K-factor
  return ELO_CONFIG.K_FACTOR_INTERMEDIATE;
}

/**
 * ELO 변동량 계산
 *
 * @param playerRating - 플레이어의 현재 ELO
 * @param opponentRating - 상대의 현재 ELO
 * @param playerWon - 플레이어가 승리했는지 여부
 * @param totalGames - 플레이어의 총 경기 수
 * @returns ELO 변동량 (양수: 증가, 음수: 감소)
 *
 * 공식: K * (실제결과 - 예상승률)
 * - 실제결과: 승리=1, 패배=0
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  playerWon: boolean,
  totalGames: number,
): number {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const actualScore = playerWon ? 1 : 0;
  const kFactor = calculateKFactor(playerRating, totalGames);

  return Math.round(kFactor * (actualScore - expectedScore));
}

/**
 * 새로운 ELO 계산
 *
 * @param currentRating - 현재 ELO
 * @param eloChange - ELO 변동량
 * @returns 새로운 ELO (최소값: 0)
 */
export function calculateNewRating(currentRating: number, eloChange: number): number {
  return Math.max(0, currentRating + eloChange);
}

/**
 * 양 플레이어의 ELO 업데이트 계산
 *
 * @param winnerRating - 승자의 현재 ELO
 * @param loserRating - 패자의 현재 ELO
 * @param winnerTotalGames - 승자의 총 경기 수
 * @param loserTotalGames - 패자의 총 경기 수
 * @returns { winnerNewRating, loserNewRating, winnerChange, loserChange }
 */
export function calculateMatchEloUpdate(
  winnerRating: number,
  loserRating: number,
  winnerTotalGames: number,
  loserTotalGames: number,
): {
  winnerNewRating: number;
  loserNewRating: number;
  winnerChange: number;
  loserChange: number;
} {
  const winnerChange = calculateEloChange(winnerRating, loserRating, true, winnerTotalGames);
  const loserChange = calculateEloChange(loserRating, winnerRating, false, loserTotalGames);

  return {
    winnerNewRating: calculateNewRating(winnerRating, winnerChange),
    loserNewRating: calculateNewRating(loserRating, loserChange),
    winnerChange,
    loserChange,
  };
}
