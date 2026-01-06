import { createContext, useContext } from 'react';
import { useEffect, useState } from 'react';

import { getSocket } from '@/lib/socket';
import { useUser } from '@/feature/auth/useUser';

type MatchState = 'matching' | 'inGame';
type MatchAPI = {
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
};

const MatchCtx = createContext<MatchAPI | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  // TODO: 추후 OAuth2로 인증 방식 변경 후 user:info 이벤트 제거
  const {setUserData} = useUser();
  const [matchState, setMatchState] = useState<MatchState>('matching');

  useEffect(() => {
    const socket = getSocket();

    socket.on("user:info", setUserData);
    socket.connect();

    return () => {
      socket.off("user:info", setUserData);
      socket.disconnect();
    };
  }, []);

  return <MatchCtx.Provider value={{ matchState, setMatchState }}>{children}</MatchCtx.Provider>;
}

export function useMatch() {
  const ctx = useContext(MatchCtx);

  if (!ctx) {
    throw new Error();
  }

  return ctx;
}
