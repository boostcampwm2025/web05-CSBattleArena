import { MatchHistoryResponse, MyPageResponse, TierHistoryResponse } from '@/shared/type';

const API_BASE = '/api';

// 목 데이터용 타입 (임시)
type MyPageData = MyPageResponse & TierHistoryResponse & MatchHistoryResponse;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T>(
  url: string,
  accessToken: string | null,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, 'Unauthorized');
    }

    const errorData = (await response.json().catch(() => ({ message: 'Unknown error' }))) as {
      message?: string;
    };
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

// 개별 API 호출 함수들
async function fetchMyPageProfile(accessToken: string | null): Promise<MyPageResponse> {
  return fetchWithAuth<MyPageResponse>(`${API_BASE}/users/me`, accessToken);
}

async function fetchTierHistory(accessToken: string | null): Promise<TierHistoryResponse> {
  return fetchWithAuth<TierHistoryResponse>(`${API_BASE}/users/me/tier-history`, accessToken);
}

async function fetchMatchHistory(accessToken: string | null): Promise<MatchHistoryResponse> {
  return fetchWithAuth<MatchHistoryResponse>(`${API_BASE}/users/me/match-history`, accessToken);
}

export { fetchMyPageProfile, fetchTierHistory, fetchMatchHistory, ApiError };
export type { MyPageData };
