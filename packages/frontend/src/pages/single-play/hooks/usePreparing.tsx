import { useEffect, useState } from 'react';

import { CategoryItem } from '@/pages/single-play/types/types';
import { fetchCategories } from '@/lib/api/single-play';

export function usePreparing() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();

    const getCategories = async () => {
      setIsLoading(true);

      try {
        const data = await fetchCategories(controller.signal);
        setCategories(data.categories);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return;
        }

        // TODO: 에러 발생 시 띄울 공통 모달 구현 및 에러 출력
      } finally {
        setIsLoading(false);
      }
    };

    void getCategories();

    return () => controller.abort();
  }, []);

  return { categories, isLoading };
}
