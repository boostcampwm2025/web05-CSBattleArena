import { useMyPage } from './hooks/useMyPage';
import { ProfileSection } from './components/ProfileSection';
import { StatsCard } from './components/StatsCard';
import { TierHistoryChart } from './components/TierHistoryChart';
import { RecentActivityList } from './components/RecentActivityList';
import type { MyPageData } from '@/lib/api/my-page';

// 임시 목 데이터 (디자인 확인용)
const MOCK_DATA: MyPageData = {
  profile: {
    nickname: 'SampleUser',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sample',
    email: 'sample@example.com',
    createdAt: '2024-01-01T00:00:00Z',
  },
  rank: {
    tier: 'Gold',
    tierPoint: 1250,
  },
  level: {
    level: 15,
    expForCurrentLevel: 750,
    expForNextLevel: 1000,
  },
  matchStats: {
    totalMatches: 50,
    winCount: 30,
    loseCount: 20,
    drawCount: 5,
    winRate: 60,
  },
  problemStats: {
    totalSolved: 120,
    correctCount: 90,
    incorrectCount: 20,
    partialCount: 10,
    correctRate: 75,
  },
  tierHistory: [
    { tier: 'Bronze', tierPoint: 500, changedAt: '2024-01-01T00:00:00Z' },
    { tier: 'Silver', tierPoint: 800, changedAt: '2024-02-01T00:00:00Z' },
    { tier: 'Gold', tierPoint: 1250, changedAt: '2024-03-01T00:00:00Z' },
  ],
  matchHistory: [
    {
      type: 'multi' as const,
      match: {
        opponent: {
          nickname: 'Player1',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1',
        },
        result: 'win' as const,
        myScore: 85,
        opponentScore: 70,
        tierPointChange: 25,
        playedAt: '2024-03-15T10:00:00Z',
      },
    },
    {
      type: 'single' as const,
      match: {
        category: { name: 'Algorithm' },
        expGained: 50,
        playedAt: '2024-03-14T15:00:00Z',
      },
    },
  ],
};

export default function MyPage() {
  const { profileData, tierHistoryData, matchHistoryData, isLoading, onClickBack } = useMyPage();

  // 각 데이터가 없을 때 목 데이터 사용 (디자인 확인용)
  const displayProfileData = profileData || MOCK_DATA;
  const displayTierHistory = tierHistoryData?.tierHistory || MOCK_DATA.tierHistory;
  const displayMatchHistory = matchHistoryData?.matchHistory || MOCK_DATA.matchHistory;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Header - Compact */}
        <header className="flex flex-shrink-0 items-center justify-between border-b-2 border-cyan-400 bg-slate-900/90 p-2">
          <button
            onClick={onClickBack}
            className="flex items-center gap-1 rounded border border-cyan-400 bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-400 transition-all duration-200 hover:scale-105 hover:bg-cyan-400/40"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-arrow-left-line" />
            <span>BACK</span>
          </button>

          <h1 className="text-xl font-bold text-cyan-400" style={{ fontFamily: 'Press Start 2P' }}>
            <i className="ri-user-line mr-2" />
            MY PAGE
          </h1>

          <div className="w-16" />
        </header>

        {/* Content - No Scroll */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-3">
            {isLoading && (
              <div className="text-center text-lg text-cyan-400" style={{ fontFamily: 'Orbitron' }}>
                Loading...
              </div>
            )}

            {/* Profile Section - Compact */}
            <div className="min-h-0 flex-[0.175]">
              <ProfileSection
                profile={displayProfileData.profile}
                rank={displayProfileData.rank}
                level={displayProfileData.level}
              />
            </div>

            {/* Main Content: Two Column Layout */}
            <div className="grid min-h-0 flex-[0.825] grid-cols-1 gap-4 lg:grid-cols-[1fr_500px]">
              {/* Left Column - Profile Information */}
              <div className="flex min-h-0 flex-col gap-3">
                {/* Stats Cards - Compact */}
                <div className="grid flex-shrink-0 grid-cols-1 gap-3 md:grid-cols-3">
                  <StatsCard
                    title="Problem Stats"
                    icon="ri-file-list-line"
                    borderColor="emerald-400"
                    stats={[
                      { label: 'Total Solved', value: displayProfileData.problemStats.totalSolved },
                      { label: 'Correct', value: displayProfileData.problemStats.correctCount },
                      {
                        label: 'Correct Rate',
                        value: `${displayProfileData.problemStats.correctRate}%`,
                      },
                    ]}
                  />

                  <StatsCard
                    title="Match Stats"
                    icon="ri-sword-line"
                    borderColor="pink-400"
                    stats={[
                      { label: 'Total Matches', value: displayProfileData.matchStats.totalMatches },
                      {
                        label: 'Win / Draw / Lose',
                        value: `${displayProfileData.matchStats.winCount}/ ${displayProfileData.matchStats.drawCount} / ${displayProfileData.matchStats.loseCount}`,
                      },
                      { label: 'Win Rate', value: `${displayProfileData.matchStats.winRate}%` },
                    ]}
                  />

                  <StatsCard
                    title="Ranking"
                    icon="ri-trophy-line"
                    borderColor="amber-400"
                    stats={[
                      { label: 'Current Tier', value: displayProfileData.rank.tier },
                      { label: 'Tier Point', value: displayProfileData.rank.tierPoint },
                      { label: 'Level', value: displayProfileData.level.level },
                    ]}
                  />
                </div>

                {/* Tier History Chart - Flexible Height */}
                <div className="min-h-0 flex-1">
                  <TierHistoryChart data={displayTierHistory} />
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="min-h-0">
                <RecentActivityList matchHistory={displayMatchHistory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
