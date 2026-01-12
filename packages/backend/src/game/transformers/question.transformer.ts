import { Question } from '../../quiz/entity';

/**
 * Question content 타입 정의
 */
interface QuestionContent {
  question?: string;
  options?: string[];
  A?: string;
  B?: string;
  C?: string;
  D?: string;
}

/**
 * Question content를 type에 따라 적절한 형식으로 변환
 */
function formatQuestionContent(
  question: Question,
):
  | { type: 'multiple'; question: string; option: string[] }
  | { type: 'short'; question: string }
  | { type: 'essay'; question: string } {
  // content가 string인 경우 JSON 파싱
  const content: QuestionContent | string =
    typeof question.content === 'string'
      ? (JSON.parse(question.content) as QuestionContent)
      : (question.content as QuestionContent);

  switch (question.questionType) {
    case 'multiple': {
      const contentObj = typeof content === 'string' ? { question: content } : content;

      return {
        type: 'multiple',
        question: contentObj.question ?? (typeof content === 'string' ? content : ''),
        option:
          contentObj.options ??
          [contentObj.A, contentObj.B, contentObj.C, contentObj.D].filter(
            (opt): opt is string => opt !== undefined,
          ),
      };
    }

    case 'short': {
      const contentObj = typeof content === 'string' ? { question: content } : content;

      return {
        type: 'short',
        question: contentObj.question ?? (typeof content === 'string' ? content : ''),
      };
    }

    case 'essay': {
      const contentObj = typeof content === 'string' ? { question: content } : content;

      return {
        type: 'essay',
        question: contentObj.question ?? (typeof content === 'string' ? content : ''),
      };
    }

    default:
      throw new Error(`Unknown question type: ${String(question.questionType)}`);
  }
}

/**
 * DB Question 엔티티를 클라이언트 API 형식으로 변환
 */
function transformQuestionForClient(
  question: Question,
  categories: { parent?: { name: string }; name: string },
): {
  category: string[];
  difficulty: string;
  content:
    | { type: 'multiple'; question: string; option: string[] }
    | { type: 'short'; question: string }
    | { type: 'essay'; question: string };
} {
  // difficulty를 문자열로 변환 (1 -> 'easy', 2 -> 'medium', 3 -> 'hard')
  const difficultyMap: { [key: number]: string } = {
    1: 'easy',
    2: 'medium',
    3: 'hard',
  };
  const difficultyStr = question.difficulty
    ? difficultyMap[question.difficulty] || 'medium'
    : 'medium';

  return {
    category: [categories.parent?.name || 'CS', categories.name],
    difficulty: difficultyStr,
    content: formatQuestionContent(question),
  };
}

/**
 * Category 조회 헬퍼 (QuizService에서 사용 예정)
 */
function getCategoriesForQuestion(
  _questionId: number,
  // categoryQuestionRepo, categoryRepo를 주입받아야 함
): { parent?: { name: string }; name: string } {
  // TODO: 실제 구현은 QuizService에서 CategoryQuestion과 Category를 조회
  // 임시로 기본값 반환
  return {
    parent: { name: 'Computer Science' },
    name: 'Data Structures',
  };
}

export { transformQuestionForClient, getCategoriesForQuestion };
