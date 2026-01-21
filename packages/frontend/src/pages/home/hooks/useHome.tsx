import { useUser } from '@/feature/auth/useUser';
import { useCallback, useState } from 'react';

export function useHome() {
  const { userData } = useUser();

  const [isOpenLoginModal, setIsOpenLoginModal] = useState<boolean>(true);

  const onClickMyPageBtn = useCallback(() => {}, []);

  const onClickLogoutBtn = useCallback(() => {}, []);

  return { userData, isOpenLoginModal, setIsOpenLoginModal, onClickMyPageBtn, onClickLogoutBtn };
}
