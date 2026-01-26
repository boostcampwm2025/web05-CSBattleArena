import { UserLevel, UserProfile, UserRank } from '@/shared/type';

type ProfileSectionProps = {
  profile: UserProfile;
  rank: UserRank;
  level: UserLevel;
};

export function ProfileSection({ profile, rank, level }: ProfileSectionProps) {
  const expPercentage = (level.expForCurrentLevel / level.expForNextLevel) * 100;
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="flex items-center gap-4 border-2 border-cyan-400 bg-gradient-to-r from-slate-800/90 to-slate-900/90 p-3">
      {/* User Info */}
      <div className="flex gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-cyan-400 to-purple-500">
          <i className="ri-user-star-line text-3xl text-white" />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <h2 className="text-xl font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
            {profile.nickname}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-amber-400" style={{ fontFamily: 'Orbitron' }}>
              <i className="ri-vip-crown-line mr-1" />
              {rank.tier}
            </span>
            <span className="text-sm font-bold text-pink-400" style={{ fontFamily: 'Orbitron' }}>
              LV.{level.level}
            </span>
            <span className="text-sm font-bold text-yellow-300" style={{ fontFamily: 'Orbitron' }}>
              ⭐ {rank.tierPoint.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Member Since */}
      <div
        className="ml-auto text-xs text-cyan-400"
        style={{ fontFamily: 'Orbitron', whiteSpace: 'nowrap' }}
      >
        Member Since
        <br />
        {memberSince}
      </div>

      {/* Experience Bar */}
      <div className="flex w-72 flex-shrink-0 flex-col gap-1">
        <div
          className="flex justify-between text-sm text-cyan-300"
          style={{ fontFamily: 'Orbitron' }}
        >
          <span className="font-bold">EXP TO NEXT LEVEL</span>
          <span>
            {level.expForCurrentLevel} / {level.expForNextLevel}
          </span>
        </div>

        <div className="relative h-4 w-full overflow-hidden border border-cyan-500 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
            style={{ width: `${expPercentage}%` }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ fontFamily: 'Orbitron' }}
          >
            {Math.round(expPercentage)}%
          </div>
        </div>
      </div>
    </div>
  );
}
