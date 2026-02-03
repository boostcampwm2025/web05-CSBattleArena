import { Question as QuestionEntity } from '../../quiz/entity';
import { SCORE_MAP } from '../../quiz/quiz.constants';
import { mapDifficulty, mapDifficultyDisplay } from '../../common/utils/difficulty.util';

/**
 * DB Question 엔티티를 클라이언트 API 형식으로 변환
 * 설계 문서 명세: type이 최상위에 위치
 */
function transformQuestionForClient(
  question: QuestionEntity,
  category: string[],
): {
  category: string[];
  difficulty: string;
  point: number;
  content:
    | { type: 'multiple'; question: string; option: string[] }
    | { type: 'short'; question: string }
    | { type: 'essay'; question: string };
} {
  const difficulty = mapDifficultyDisplay(question.difficulty);
  const point = getPointScore(question.difficulty);

  switch (question.questionType) {
    case 'multiple': {
      const content = parseContent(question.content);

      return {
        category,
        difficulty,
        point,
        content: {
          type: 'multiple',
          question: content.question || '',
          option: content.options
            ? [content.options.A, content.options.B, content.options.C, content.options.D]
            : [],
        },
      };
    }

    case 'short': {
      const questionText =
        typeof question.content === 'string' ? question.content : JSON.stringify(question.content);

      return {
        category,
        difficulty,
        point,
        content: {
          type: 'short',
          question: questionText,
        },
      };
    }

    case 'essay': {
      const questionText =
        typeof question.content === 'string' ? question.content : JSON.stringify(question.content);

      return {
        category,
        difficulty,
        point,
        content: {
          type: 'essay',
          question: questionText,
        },
      };
    }

    default:
      throw new Error(`Unknown question type: ${String(question.questionType)}`);
  }
}

/**
 * content 파싱 헬퍼
 */
function parseContent(content: string | object): {
  question?: string;
  options?: { A: string; B: string; C: string; D: string };
} {
  if (typeof content === 'string') {
    return JSON.parse(content) as {
      question?: string;
      options?: { A: string; B: string; C: string; D: string };
    };
  }

  return content as {
    question?: string;
    options?: { A: string; B: string; C: string; D: string };
  };
}

/**
 * 난이도에 따른 만점 점수 계산
 */
function getPointScore(numDifficulty: number | null): number {
  const difficulty = mapDifficulty(numDifficulty);

  return SCORE_MAP[difficulty];
}

export { transformQuestionForClient };
