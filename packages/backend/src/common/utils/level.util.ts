type LevelInfo = { level: number; needExpPoint: number; remainedExpPoint: number };

export function calcExpToNextLevel(level: number) {
  const base = 100;
  const inc = 100;
  const max_inc = 50;

  return base + inc * (Math.min(level, max_inc) - 1);
}

export function calcLevel(totalExpPoint: number): LevelInfo {
  let level = 1;
  let remained = Math.max(0, Math.floor(totalExpPoint));

  while (remained > 0) {
    const need = calcExpToNextLevel(level);

    if (remained < need) {
      break;
    }

    level += 1;
    remained -= need;
  }

  return { level, needExpPoint: calcExpToNextLevel(level), remainedExpPoint: remained };
}
