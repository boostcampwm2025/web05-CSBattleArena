import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@/feature/auth/useUser';
import { useScene } from '@/feature/useScene';
import {
  ApiError,
  fetchMatchHistory,
  fetchMyPageProfile,
  fetchTierHistory,
} from '@/lib/api/my-page';
import type { MatchHistoryResponse, MyPageResponse, TierHistoryResponse } from '@/shared/type';

export function useMyPage() {
  const { accessToken } = useUser();
  const { setScene } = useScene();

  // 각 API 응답을 독립적으로 관리
  const [profileData, setProfileData] = useState<MyPageResponse | null>(null);
  const [tierHistoryData, setTierHistoryData] = useState<TierHistoryResponse | null>(null);
  const [matchHistoryData, setMatchHistoryData] = useState<MatchHistoryResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // 프로필 데이터 로딩
  const loadProfileData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const data = await fetchMyPageProfile(accessToken);
      setProfileData(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setScene('home');

        return;
      }

      // eslint-disable-next-line no-console
      console.error('Failed to load profile data:', err);
    }
  }, [accessToken, setScene]);

  // 티어 히스토리 데이터 로딩
  const loadTierHistory = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const data = await fetchTierHistory(accessToken);
      setTierHistoryData(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load tier history:', err);
    }
  }, [accessToken]);

  // 매치 히스토리 데이터 로딩
  const loadMatchHistory = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const data = await fetchMatchHistory(accessToken);
      setMatchHistoryData(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load match history:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);

    // 3개의 API를 독립적으로 호출 (각각 완료되는 대로 렌더링)
    void Promise.all([loadProfileData(), loadTierHistory(), loadMatchHistory()]).finally(() => {
      setIsLoading(false);
    });
  }, [accessToken, loadProfileData, loadTierHistory, loadMatchHistory]);

  const onClickBack = useCallback(() => {
    setScene('home');
  }, [setScene]);

  return {
    profileData,
    tierHistoryData,
    matchHistoryData,
    isLoading,
    onClickBack,
  };
}
