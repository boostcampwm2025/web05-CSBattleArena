import { useCallback, useEffect, useState } from 'react';
import { fetchMatchHistory } from '@/lib/api/my-page';
import { useUser } from '@/feature/auth/useUser';
import type { MatchHistoryItem } from '@/shared/type';

interface Page {
  matchHistory: MatchHistoryItem[];
  hasMore: boolean;
  nextCursor?: string;
}

export function useInfiniteMatchHistory(matchType: 'all' | 'multi' | 'single') {
  const { accessToken } = useUser();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 탭 변경 시 초기화
  const loadInitialDataCallback = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchMatchHistory(accessToken, {
        matchType,
        limit: 10,
      });
      setPages([data]);
      setHasNextPage(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, matchType]);

  useEffect(() => {
    setPages([]);
    setIsLoading(true);
    setHasNextPage(true);
    void loadInitialDataCallback();
  }, [loadInitialDataCallback]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isLoading || !accessToken) {
      return;
    }

    const lastPage = pages[pages.length - 1];

    if (!lastPage?.nextCursor) {
      return;
    }

    try {
      setIsFetchingNextPage(true);
      const data = await fetchMatchHistory(accessToken, {
        matchType,
        limit: 5,
        cursor: lastPage.nextCursor,
      });
      setPages((prev) => [...prev, data]);
      setHasNextPage(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [accessToken, matchType, pages, hasNextPage, isFetchingNextPage, isLoading]);

  return {
    data: { pages },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
}
