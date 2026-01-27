import { request } from '@/lib/api/request';

type UserData = {
  profile: { nickname: string };
  rank: { tier: string; tierPoint: number };
  levelInfo: { level: number; needExpPoint: number; remainedExpPoint: number };
};

export function login() {
  window.location.replace(`/api/auth/github`);
}

export async function logout(signal: AbortSignal) {
  try {
    await request('/api/auth/logout', undefined, { credentials: 'include', signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return;
    }

    // TODO: 에러 모달 출력
  }
}

export function handleOAuthCallback() {
  const hash = window.location.hash;

  if (!hash || hash.length <= 1) {
    return { ok: false, err: 'There is no hash.' };
  }

  const params = new URLSearchParams(hash.substring(1));

  const token = params.get('access_token');

  if (!token) {
    return { ok: false, err: 'There is no token.' };
  }

  const userRaw = params.get('user');

  if (!userRaw) {
    return { ok: false, err: 'There is no user data.' };
  }

  return { ok: true, accessToken: token, userData: JSON.parse(decodeURIComponent(userRaw)) };
}

export async function refreshAccessToken(signal: AbortSignal) {
  try {
    const data = await request<{ accessToken: string }>('/api/auth/refresh', undefined, {
      credentials: 'include',
      signal,
    });

    return data.accessToken;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return;
    }

    // TODO: 에러 모달 출력
  }
}

export async function fetchUserData(accessToken: string, signal: AbortSignal) {
  try {
    const data = await request<UserData>('/api/users/me', accessToken, {
      credentials: 'include',
      signal,
    });

    return data;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return;
    }

    // TODO: 에러 모달 출력
  }
}
