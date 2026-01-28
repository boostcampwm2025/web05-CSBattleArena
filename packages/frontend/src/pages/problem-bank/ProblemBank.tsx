import { useScene } from '@/feature/useScene.tsx';
import ProblemDetailModal from './components/ProblemDetailModal';
import CategoryFilterModal from './components/CategoryFilterModal';
import { useProblemBank } from './hooks/useProblemBank';

export default function ProblemBank() {
  const { setScene } = useScene();
  const {
    items,
    statistics,
    categories,
    totalPages,
    currentPage,
    error,
    filters,
    // UI States
    selectedProblem,
    setSelectedProblem,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    searchInput,
    setSearchInput,
    // Actions
    toggleBookmark,
    goToPage,
    handleDifficultyChange,
    handleResultChange,
    handleBookmarkFilterChange,
    applySearch,
    handleCategoryApply,
    handleCategoryRemove,
  } = useProblemBank();

  // 페이지네이션 버튼 생성 (현재 페이지 기준 ±2 범위)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // 총 페이지가 7개 이하면 모두 표시
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const range = 2; // 현재 페이지 앞뒤로 2개씩

    // 항상 첫 페이지 표시
    pages.push(1);

    // 시작 범위 계산
    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    // 첫 페이지와 시작 범위 사이에 간격이 있으면 ... 추가
    if (start > 2) {
      pages.push('...');
    }

    // 현재 페이지 주변 범위 추가
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // 끝 범위와 마지막 페이지 사이에 간격이 있으면 ... 추가
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // 항상 마지막 페이지 표시
    pages.push(totalPages);

    return pages;
  };

  // 선택된 카테고리 정보 가져오기
  const selectedCategories = categories.filter((cat) =>
    (filters.categoryIds || []).includes(cat.id),
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b-4 border-cyan-400 bg-gradient-to-r from-slate-800/95 to-slate-900/95 p-4">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setScene('home')}
            className="border-2 border-slate-400 bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 font-bold text-white transition-all duration-200 hover:scale-105 hover:from-slate-500 hover:to-slate-600"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-arrow-left-line mr-2" />
            BACK
          </button>
          <h1
            className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text px-4 py-2 text-3xl font-black text-transparent"
            style={{ fontFamily: 'Orbitron' }}
          >
            <i className="ri-database-2-line mr-3" />
            PROBLEM BANK
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="w-64 rounded border-2 border-cyan-400 bg-slate-900/90 px-4 py-2 text-sm text-cyan-400 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              style={{ fontFamily: 'Orbitron' }}
            />
          </div>
          <button
            type="submit"
            className="border-2 border-cyan-400 bg-cyan-400/20 px-4 py-2 text-sm font-bold text-cyan-400 transition-all duration-200 hover:bg-cyan-400/40"
            style={{ fontFamily: 'Orbitron' }}
          >
            SEARCH
          </button>
        </form>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col overflow-hidden p-4">
          {/* Filter Section */}
          <div className="mb-4 space-y-4 rounded border-2 border-purple-400 bg-slate-900/90 p-4 backdrop-blur-sm">
            {/* Category Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-cyan-400" style={{ fontFamily: 'Orbitron' }}>
                CATEGORY:
              </span>

              {/* 선택된 카테고리 태그들 */}
              {selectedCategories.length > 0 ? (
                <>
                  {selectedCategories.map((category) => (
                    <span
                      key={category.id}
                      className="flex items-center gap-1 rounded border border-cyan-400 bg-cyan-400/20 px-2 py-1 text-xs text-cyan-400"
                      style={{ fontFamily: 'Orbitron' }}
                    >
                      {category.name.toUpperCase()}
                      <button
                        onClick={() => handleCategoryRemove(category.id)}
                        className="ml-1 text-cyan-400 hover:text-cyan-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-xs text-gray-400" style={{ fontFamily: 'Orbitron' }}>
                  No category filter
                </span>
              )}

              {/* 필터 추가 버튼 */}
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="ml-2 rounded border border-purple-400 bg-transparent px-3 py-1 text-xs text-purple-400 transition-colors hover:bg-purple-400/20"
                style={{ fontFamily: 'Orbitron' }}
              >
                + ADD FILTER
              </button>
            </div>

            {/* Difficulty & Result */}
            <div className="flex flex-wrap items-center gap-4 border-t border-purple-400/30 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400" style={{ fontFamily: 'Orbitron' }}>
                  DIFFICULTY:
                </span>
                <button
                  onClick={() => handleDifficultyChange(null)}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.difficulty === undefined
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  ALL
                </button>
                <button
                  onClick={() => handleDifficultyChange('easy')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.difficulty === 'easy'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  EASY
                </button>
                <button
                  onClick={() => handleDifficultyChange('medium')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.difficulty === 'medium'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  MEDIUM
                </button>
                <button
                  onClick={() => handleDifficultyChange('hard')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.difficulty === 'hard'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  HARD
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cyan-400" style={{ fontFamily: 'Orbitron' }}>
                  RESULT:
                </span>
                <button
                  onClick={() => handleResultChange(null)}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.result === undefined
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  ALL
                </button>
                <button
                  onClick={() => handleResultChange('correct')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.result === 'correct'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  CORRECT
                </button>
                <button
                  onClick={() => handleResultChange('incorrect')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.result === 'incorrect'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  INCORRECT
                </button>
                <button
                  onClick={() => handleResultChange('partial')}
                  className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                    filters.result === 'partial'
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  PARTIAL
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleBookmarkFilterChange(filters.isBookmarked === true ? null : true)
                  }
                  className={`rounded border px-3 py-1 text-xs transition-colors ${
                    filters.isBookmarked === true
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                      : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                  }`}
                  style={{ fontFamily: 'Orbitron' }}
                >
                  {filters.isBookmarked === true ? '⭐ BOOKMARKED ONLY' : '☆ SHOW BOOKMARKED'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div className="rounded border-2 border-cyan-400 bg-slate-900/90 p-4 backdrop-blur-sm">
                <div className="text-xs text-cyan-400" style={{ fontFamily: 'Orbitron' }}>
                  TOTAL SOLVED
                </div>
                <div
                  className="mt-1 text-2xl font-bold text-white"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  {statistics.totalSolved}
                </div>
              </div>

              <div className="rounded border-2 border-green-400 bg-slate-900/90 p-4 backdrop-blur-sm">
                <div className="text-xs text-green-400" style={{ fontFamily: 'Orbitron' }}>
                  CORRECT
                </div>
                <div
                  className="mt-1 text-2xl font-bold text-white"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  {statistics.correctCount}
                </div>
              </div>

              <div className="rounded border-2 border-pink-400 bg-slate-900/90 p-4 backdrop-blur-sm">
                <div className="text-xs text-pink-400" style={{ fontFamily: 'Orbitron' }}>
                  INCORRECT
                </div>
                <div
                  className="mt-1 text-2xl font-bold text-white"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  {statistics.incorrectCount}
                </div>
              </div>

              <div className="rounded border-2 border-yellow-400 bg-slate-900/90 p-4 backdrop-blur-sm">
                <div className="text-xs text-yellow-400" style={{ fontFamily: 'Orbitron' }}>
                  PARTIAL
                </div>
                <div
                  className="mt-1 text-2xl font-bold text-white"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  {statistics.partialCount}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-3 rounded border-2 border-red-400 bg-slate-900/90 p-4 text-center text-red-400 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Problem Table */}
          {!error && (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded border-2 border-cyan-400 bg-slate-900/90 backdrop-blur-sm">
              {/* Table Header */}
              <div
                className="grid shrink-0 grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-cyan-400/30 px-6 py-2 text-xs text-cyan-400"
                style={{ fontFamily: 'Orbitron' }}
              >
                <div className="w-8">STAT</div>
                <div className="min-w-0">TITLE</div>
                <div className="w-48">TAGS</div>
                <div className="w-20">LEVEL</div>
                <div className="w-44">SOLVED AT</div>
                <div className="w-8 text-right">MARK</div>
              </div>

              {/* Table Body */}
              <div className="scrollbar-hide flex-1 divide-y divide-cyan-400/10 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No problems found</div>
                ) : (
                  items.map((problem) => (
                    <div
                      key={problem.id}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 transition-colors hover:bg-purple-900/20"
                    >
                      {/* Result */}
                      <div className="flex w-8 items-center justify-center">
                        {problem.answerStatus === 'correct' ? (
                          <span className="text-xl text-green-400">✓</span>
                        ) : problem.answerStatus === 'incorrect' ? (
                          <span className="text-xl text-red-400">✗</span>
                        ) : (
                          <span className="text-xl text-yellow-400">◐</span>
                        )}
                      </div>

                      {/* Title */}
                      <button
                        onClick={() => setSelectedProblem(problem)}
                        className="min-w-0 cursor-pointer text-left text-sm text-white hover:text-cyan-400"
                      >
                        {problem.questionContent}
                      </button>

                      {/* Tags */}
                      <div className="flex w-48 flex-wrap items-center gap-1">
                        {problem.categories.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded border border-cyan-400 bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-400"
                            style={{ fontFamily: 'Orbitron' }}
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.categories.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{problem.categories.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="flex w-20 items-center">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            problem.difficulty === 'easy'
                              ? 'bg-green-500/20 text-green-400'
                              : problem.difficulty === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}
                          style={{ fontFamily: 'Orbitron' }}
                        >
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </div>

                      {/* Solved At */}
                      <div
                        className="flex w-44 items-center whitespace-nowrap text-xs text-gray-400"
                        style={{ fontFamily: 'Orbitron' }}
                      >
                        {new Date(problem.solvedAt).toLocaleString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>

                      {/* Bookmark */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleBookmark(problem.id, problem.isBookmarked);
                        }}
                        className="flex w-8 items-center justify-center text-lg transition-colors hover:scale-110"
                      >
                        {problem.isBookmarked ? (
                          <span className="text-yellow-400">⭐</span>
                        ) : (
                          <span className="text-gray-600 hover:text-gray-400">☆</span>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!error && totalPages > 0 && (
            <div className="mt-6 flex shrink-0 items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`h-8 rounded border px-3 text-sm transition-colors ${
                  currentPage === 1
                    ? 'cursor-not-allowed border-gray-600 bg-transparent text-gray-600'
                    : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                }`}
                style={{ fontFamily: 'Orbitron' }}
              >
                ◀
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) =>
                typeof page === 'string' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-purple-400"
                    style={{ fontFamily: 'Orbitron' }}
                  >
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-8 w-8 rounded border ${
                      page === currentPage
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                        : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                    } text-sm transition-colors`}
                    style={{ fontFamily: 'Orbitron' }}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`h-8 rounded border px-3 text-sm transition-colors ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed border-gray-600 bg-transparent text-gray-600'
                    : 'border-purple-400 bg-transparent text-purple-400 hover:bg-purple-400/20'
                }`}
                style={{ fontFamily: 'Orbitron' }}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onBookmarkToggle={toggleBookmark}
        />
      )}

      {/* Category Filter Modal */}
      {isCategoryModalOpen && (
        <CategoryFilterModal
          categories={categories}
          selectedCategoryIds={filters.categoryIds || []}
          onApply={handleCategoryApply}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
    </div>
  );
}
