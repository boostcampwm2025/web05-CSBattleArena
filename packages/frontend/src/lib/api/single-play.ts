import { GetCategoriesRes } from '@/pages/single-play/types/types';

import { request } from './request';

export function fetchCategories(signal?: AbortSignal) {
  return request<GetCategoriesRes>('api/singleplay/categories', { signal });
}
