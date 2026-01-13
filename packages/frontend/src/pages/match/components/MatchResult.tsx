export default function MatchResult() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-4">
      <div className="flex h-full w-full max-w-6xl flex-col items-stretch justify-center gap-4">
        {/* Winner Banner */}
        {/* Win color: bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400*/}
        {/* Lose color: bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-400*/}
        {/* Draw color: bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400*/}
        <div
          className={
            'flex flex-col items-center justify-center gap-1 border-4 border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-2 text-center'
          }
        >
          <div className="text-3xl font-black" style={{ fontFamily: '"Press Start 2P"' }}>
            <span className="text-emerald-400">VICTORY!</span>
            {/* Lose text: <span className="text-red-400">DEFEAT</span>*/}
            {/* Draw text: <span className="text-amber-400">DRAW</span>*/}
          </div>
          <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
            3 - 2
          </div>
        </div>

        {/* Players Summary */}
        <div className="flex gap-4">
          {/* Player 1 */}
          <div className="w-full border-4 border-cyan-400 bg-gradient-to-r from-slate-800/95 to-slate-900/95 p-4 shadow-2xl shadow-cyan-500/30">
            <div className="flex flex-col items-stretch justify-center gap-4">
              <div className="flex items-center justify-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-cyan-400 to-purple-500">
                  <i className="ri-user-star-line text-4xl text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <div
                    className="text-lg font-bold text-cyan-300"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    CodeMaster
                  </div>
                  <div
                    className="text-2xl font-bold text-emerald-400"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    300 PTS
                  </div>
                </div>
              </div>
              <div className="border-2 border-cyan-400 bg-cyan-500/20 py-1 text-center">
                <span
                  className="text-base font-bold text-cyan-300"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  3 WINS
                </span>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="w-full border-4 border-pink-400 bg-gradient-to-r from-slate-800/95 to-slate-900/95 p-4 shadow-2xl shadow-pink-500/30">
            <div className="flex flex-col items-stretch justify-center gap-4">
              <div className="flex items-center justify-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-pink-400 to-rose-500">
                  <i className="ri-user-star-line text-4xl text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <div
                    className="text-lg font-bold text-pink-300"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    ByteNinja
                  </div>
                  <div
                    className="text-2xl font-bold text-emerald-400"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    250 PTS
                  </div>
                </div>
              </div>
              <div className="border-2 border-pink-400 bg-pink-500/20 py-1 text-center">
                <span
                  className="text-base font-bold text-pink-300"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  3 WINS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-2 overflow-hidden border-4 border-purple-400 bg-gradient-to-r from-slate-800/95 to-slate-900/95 p-4 shadow-2xl shadow-purple-500/30">
          <h2
            className="flex items-center gap-2 text-base font-bold text-purple-300"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-file-list-3-line" />
            QUESTION HISTORY
          </h2>
          {/* Scroll Area */}
          <div className="flex flex-col items-stretch justify-start gap-2 overflow-y-auto bg-gradient-to-r from-slate-800/95 to-slate-900/95 pr-4 shadow-purple-500/30">
            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col items-stretch justify-center gap-2 border-2 border-slate-600 bg-slate-700/50 p-2">
              {/* Question Info */}
              <div className="flex items-center gap-2">
                <div className="border-2 border-purple-300 bg-purple-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Q1
                  </p>
                </div>
                <div className="border-2 border-cyan-300 bg-cyan-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Algorithm
                  </p>
                </div>
                <div className="border-2 border-amber-300 bg-amber-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Binary Search
                  </p>
                </div>
                <div className="border-2 border-emerald-300 bg-emerald-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    100 PTS
                  </p>
                </div>
                <div className="border-2 border-green-300 bg-green-500 px-2 py-1">
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                    Easy
                  </p>
                </div>
              </div>

              {/* Question Content */}
              <div
                className="text-lg leading-relaxed text-white"
                style={{ fontFamily: 'Orbitron' }}
              >
                What is the time complexity of binary search?
              </div>

              {/* Players Answer */}
              <div className="flex gap-4 text-xs">
                <div
                  className={
                    'flex w-full flex-col gap-1 border border-emerald-400 bg-emerald-500/20 p-2'
                  }
                >
                  <div className="font-bold text-cyan-300" style={{ fontFamily: 'Orbitron' }}>
                    You:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    Ologn
                  </div>
                </div>
                <div
                  className={'flex w-full flex-col gap-1 border border-red-400 bg-red-500/20 p-2'}
                >
                  <div className="font-bold text-pink-300" style={{ fontFamily: 'Orbitron' }}>
                    Opponent:
                  </div>
                  <div className="text-white" style={{ fontFamily: 'Orbitron' }}>
                    On
                  </div>
                </div>
              </div>

              {/* Best Answer */}
              <div className="gap-1 border border-amber-400 bg-amber-500/20 p-2">
                <span
                  className="text-xs font-bold text-amber-400"
                  style={{ fontFamily: 'Orbitron' }}
                >
                  <i className="ri-lightbulb-line mr-1" />
                  Answer: O(Log n)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            className="w-full border-4 border-cyan-300 bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-2xl font-bold text-white shadow-lg shadow-cyan-500/50 transition-all duration-200 hover:scale-105 hover:from-cyan-400 hover:to-blue-400"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-restart-line mr-2 text-2xl" />
            REMATCH
          </button>
          <button
            className="w-full border-4 border-red-300 bg-gradient-to-r from-red-500 to-rose-500 p-2 text-2xl font-bold text-white shadow-lg shadow-red-500/50 transition-all duration-200 hover:scale-105 hover:from-cyan-400 hover:to-rose-400"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-logout-box-line mr-2 text-2xl" />
            EXIT
          </button>
        </div>
      </div>
    </div>
  );
}
