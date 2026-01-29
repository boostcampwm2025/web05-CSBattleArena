type StatItem = {
  label: string;
  value: string | number;
};

type StatsCardProps = {
  title: string;
  icon: string;
  borderColor: string;
  stats: StatItem[];
};

const colorMap: Record<string, string> = {
  'emerald-400': '#34d399',
  'pink-400': '#f472b6',
  'amber-400': '#fbbf24',
};

export function StatsCard({ title, icon, borderColor, stats }: StatsCardProps) {
  const colorValue = colorMap[borderColor] || '#06b6d4';

  return (
    <div
      className="flex flex-col gap-2 border-2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-3"
      style={{ borderColor: colorValue }}
    >
      <div className="flex items-center gap-2">
        <i className={`${icon} text-lg`} style={{ color: colorValue }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
          {title}
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-[10px] text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
              {stat.label}
            </span>
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
