import {
  GetCategoriesRes,
  GetQuestionsRes,
  SubmitAnswerReq,
  SubmitAnswerRes,
} from '@/pages/single-play/types/types';

import { request } from './request';

export function fetchCategories(accessToken: string | undefined, signal?: AbortSignal) {
  return request<GetCategoriesRes>('/api/singleplay/categories', accessToken, { signal });
}

export function fetchQuestion(
  accessToken: string | undefined,
  categoryIds: number[],
  signal?: AbortSignal,
) {
  return request<GetQuestionsRes>('/api/singleplay/question', accessToken, {
    query: { categoryId: categoryIds },
    signal,
  });
}

export function submitAnswer(
  accessToken: string | undefined,
  payload: SubmitAnswerReq,
  signal?: AbortSignal,
) {
  return request<SubmitAnswerRes>('/api/singleplay/submit', accessToken, {
    method: 'POST',
    body: payload,
    signal,
  });
}
