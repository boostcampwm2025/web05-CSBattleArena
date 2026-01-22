export interface LevelInfo {
  level: number;
  expPoint: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
}

export function calculateLevel(expPoint: number): LevelInfo {
  const level = Math.floor(expPoint / 100);
  const expForCurrentLevel = expPoint % 100;
  const expForNextLevel = 100 - expForCurrentLevel;

  return { level, expPoint, expForCurrentLevel, expForNextLevel };
}
