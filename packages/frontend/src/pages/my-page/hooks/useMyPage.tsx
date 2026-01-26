import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@/feature/auth/useUser';
import { useScene } from '@/feature/useScene';
import { ApiError, fetchMyPageData, MyPageData } from '@/lib/api/my-page';

export function useMyPage() {
  const { accessToken } = useUser();
  const { setScene } = useScene();
  const [data, setData] = useState<MyPageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const myPageData = await fetchMyPageData(accessToken);
      setData(myPageData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setScene('home');

        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);

      // eslint-disable-next-line no-console
      console.error('Failed to load my page data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, setScene]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onClickBack = useCallback(() => {
    setScene('home');
  }, [setScene]);

  return { data, isLoading, error, onClickBack };
}
