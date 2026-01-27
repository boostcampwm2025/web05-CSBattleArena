import { useState } from 'react';

interface Player {
  rank: number;
  username: string;
  tier: string;
  score: number;
  wins: number;
  losses: number;
  winRate: number;
}

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');

  const mockPlayers: Player[] = [
    { rank: 1, username: 'CodeNinja', tier: 'Master', score: 9847, wins: 342, losses: 58, winRate: 85.5 },
    { rank: 2, username: 'AlgoKing', tier: 'Master', score: 9521, wins: 318, losses: 72, winRate: 81.5 },
    { rank: 3, username: 'ByteWarrior', tier: 'Diamond', score: 8934, wins: 289, losses: 91, winRate: 76.1 },
    { rank: 4, username: 'DataMaster', tier: 'Diamond', score: 8672, wins: 276, losses: 104, winRate: 72.6 },
    { rank: 5, username: 'LogicLord', tier: 'Diamond', score: 8445, wins: 265, losses: 115, winRate: 69.7 },
    { rank: 6, username: 'StackOverflow', tier: 'Platinum', score: 7923, wins: 241, losses: 139, winRate: 63.4 },
    { rank: 7, username: 'RecursiveGenius', tier: 'Platinum', score: 7654, wins: 228, losses: 152, winRate: 60.0 },
    { rank: 8, username: 'BinaryBoss', tier: 'Platinum', score: 7321, wins: 215, losses: 165, winRate: 56.6 },
    { rank: 9, username: 'HashHero', tier: 'Gold', score: 6987, wins: 198, losses: 182, winRate: 52.1 },
    { rank: 10, username: 'TreeTraverser', tier: 'Gold', score: 6543, wins: 184, losses: 196, winRate: 48.4 },
    { rank: 11, username: 'GraphGuru', tier: 'Gold', score: 6234, wins: 172, losses: 208, winRate: 45.3 },
    { rank: 12, username: 'SortSensei', tier: 'Silver', score: 5876, wins: 159, losses: 221, winRate: 41.8 },
    { rank: 13, username: 'SearchSage', tier: 'Silver', score: 5543, wins: 147, losses: 233, winRate: 38.7 },
    { rank: 14, username: 'LoopLegend', tier: 'Silver', score: 5234, wins: 136, losses: 244, winRate: 35.8 },
    { rank: 15, username: 'ArrayAce', tier: 'Bronze', score: 4987, wins: 125, losses: 255, winRate: 32.9 },
  ];

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Master': 'from-red-500 to-orange-500',
      'Diamond': 'from-cyan-400 to-blue-500',
      'Platinum': 'from-emerald-400 to-teal-500',
      'Gold': 'from-amber-400 to-yellow-500',
      'Silver': 'from-slate-300 to-slate-400',
      'Bronze': 'from-orange-600 to-amber-700',
    };
    return colors[tier] || 'from-gray-400 to-gray-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const navigateTo = (path: string) => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(path);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-b-4 border-cyan-400 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateTo('/')}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold py-2 px-4 border-2 border-slate-400 transition-all duration-200 hover:scale-105 whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              BACK
            </button>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400" style={{ fontFamily: 'Press Start 2P, cursive' }}>
              <i className="ri-trophy-line mr-3"></i>
              LEADERBOARD
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100%-80px)] overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            {/* Period Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-cyan-300 font-bold text-sm mr-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>PERIOD:</span>
              {(['daily', 'weekly', 'monthly', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`font-bold py-2 px-4 border-2 transition-all duration-200 hover:scale-105 whitespace-nowrap cursor-pointer text-sm ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-300'
                      : 'bg-slate-700/50 text-slate-300 border-slate-500 hover:border-cyan-400'
                  }`}
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-4 border-cyan-400 shadow-2xl shadow-cyan-500/30">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-slate-900/80 border-b-2 border-cyan-400">
              <div className="text-cyan-300 font-bold text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>RANK</div>
              <div className="col-span-2 text-cyan-300 font-bold text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>PLAYER</div>
              <div className="text-cyan-300 font-bold text-sm text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>TIER</div>
              <div className="text-cyan-300 font-bold text-sm text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>SCORE</div>
              <div className="text-cyan-300 font-bold text-sm text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>W/L</div>
              <div className="text-cyan-300 font-bold text-sm text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>WIN RATE</div>
            </div>

            {/* Table Body */}
            <div className="divide-y-2 divide-slate-700">
              {mockPlayers.map((player) => (
                <div
                  key={player.rank}
                  className={`grid grid-cols-7 gap-4 px-6 py-4 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer ${
                    player.rank <= 3 ? 'bg-gradient-to-r from-amber-900/20 to-transparent' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className="text-2xl font-black text-amber-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {getRankIcon(player.rank)}
                    </span>
                  </div>

                  {/* Player */}
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center border-2 border-white">
                      <i className="ri-user-star-line text-xl text-white"></i>
                    </div>
                    <span className="text-white font-bold text-base" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {player.username}
                    </span>
                  </div>

                  {/* Tier */}
                  <div className="flex items-center justify-center">
                    <span className={`bg-gradient-to-r ${getTierColor(player.tier)} text-white font-bold py-1 px-3 border-2 border-white text-sm whitespace-nowrap`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {player.tier}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-base" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {player.score.toLocaleString()}
                    </span>
                  </div>

                  {/* W/L */}
                  <div className="flex items-center justify-center">
                    <span className="text-white font-bold text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <span className="text-green-400">{player.wins}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-red-400">{player.losses}</span>
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className="flex items-center justify-center">
                    <span className="text-pink-400 font-bold text-base" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {player.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retro corner decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-cyan-400 opacity-50"></div>
      <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-pink-400 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-purple-400 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-400 opacity-50"></div>
    </div>
  );
}
