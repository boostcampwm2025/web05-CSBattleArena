import { createContext, useContext } from 'react';
import { useState } from 'react';

import { UserData } from '@/shared/type';

type UserAPI = {
  // 사용자 데이터
  userData: UserData | undefined;
  setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;

  // Access Token
  accessToken: string | undefined;
  setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const UserCtx = createContext<UserAPI | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  return (
    <UserCtx.Provider value={{ userData, setUserData, accessToken, setAccessToken }}>
      {children}
    </UserCtx.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserCtx);

  if (!ctx) {
    throw new Error();
  }

  return ctx;
}
