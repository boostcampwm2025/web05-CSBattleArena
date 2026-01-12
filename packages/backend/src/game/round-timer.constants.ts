export const ROUND_DURATIONS = {
  READY: 3, // 준비 카운트다운 (초)
  QUESTION: {
    easy: 20, // 쉬운 문제 (초)
    medium: 30, // 보통 문제 (초)
    hard: 45, // 어려운 문제 (초)
  },
  REVIEW: 7, // 결과 확인 (초)
  TICK_INTERVAL: 1, // 시간 동기화 틱 간격 (초)
} as const;

export type Difficulty = 'easy' | 'medium' | 'hard';
