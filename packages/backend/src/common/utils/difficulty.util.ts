export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 숫자 난이도(1-5)를 문자열 난이도로 매핑
 * 1-2: easy, 3: medium, 4-5: hard
 *
 * @param numDifficulty - 숫자 난이도 (1-5), null인 경우 medium 반환
 * @returns 문자열 난이도
 */
export function mapDifficulty(numDifficulty: number | null): Difficulty {
  if (!numDifficulty) {
    return 'medium';
  }

  if (numDifficulty <= 2) {
    return 'easy';
  }

  if (numDifficulty === 3) {
    return 'medium';
  }

  return 'hard';
}

/**
 * 문자열 난이도를 대문자로 표시 (UI용)
 *
 * @param numDifficulty - 숫자 난이도 (1-5)
 * @returns 대문자 난이도 문자열 ('Easy' | 'Medium' | 'Hard')
 */
export function mapDifficultyDisplay(numDifficulty: number | null): string {
  const difficulty = mapDifficulty(numDifficulty);

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

/**
 * 문자열 난이도를 숫자 범위로 변환
 *
 * @param difficulty - 문자열 난이도
 * @returns 숫자 범위 { min, max }
 */
export function getDifficultyRange(difficulty: Difficulty): { min: number; max: number } {
  switch (difficulty) {
    case 'easy':
      return { min: 1, max: 2 };
    case 'medium':
      return { min: 3, max: 3 };
    case 'hard':
      return { min: 4, max: 5 };
  }
}
