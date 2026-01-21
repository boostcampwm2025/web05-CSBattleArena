import { useCallback, useEffect, useState } from 'react';
import {
  Category,
  ProblemBankFilters,
  ProblemBankItem,
  ProblemBankStatistics,
} from '@/shared/type';
import {
  fetchCategories,
  fetchProblemBank,
  fetchStatistics,
  updateBookmark,
} from '@/lib/api/problem-bank';

export function useProblemBank() {
  const [items, setItems] = useState<ProblemBankItem[]>([]);
  const [statistics, setStatistics] = useState<ProblemBankStatistics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Partial<ProblemBankFilters>>({
    page: 1,
    limit: 10,
    categoryIds: [],
    search: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProblemBank(filters);
      setItems(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problem bank';
      setError(errorMessage);
      console.error('Failed to load problem bank:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await fetchStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const toggleBookmark = useCallback(async (problemId: number, currentBookmarkState: boolean) => {
    const newBookmarkState = !currentBookmarkState;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === problemId ? { ...item, isBookmarked: newBookmarkState } : item,
      ),
    );

    try {
      await updateBookmark(problemId, newBookmarkState);
    } catch (err) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === problemId ? { ...item, isBookmarked: currentBookmarkState } : item,
        ),
      );
      console.error('Failed to update bookmark:', err);
      setError('Failed to update bookmark');
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ProblemBankFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadStatistics();
    void loadCategories();
  }, [loadStatistics, loadCategories]);

  return {
    items,
    statistics,
    categories,
    totalPages,
    currentPage,
    isLoading,
    error,
    filters,
    loadData,
    toggleBookmark,
    updateFilters,
    goToPage,
  };
}
