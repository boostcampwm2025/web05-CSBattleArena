import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizService } from '../../src/quiz/quiz.service';
import { Question as QuestionEntity } from '../../src/quiz/entity';
import { ClovaClientService } from '../../src/quiz/clova/clova-client.service';

describe('QuizService', () => {
  let service: QuizService;

  const mockQuestionRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockClovaClient = {
    callClova: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockQuestionRepository,
        },
        {
          provide: ClovaClientService,
          useValue: mockClovaClient,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  describe('generateQuestion', () => {
    it('should return 5 questions from DB with balanced difficulty and type', async () => {
      // Mock DB data with new structure
      const easyMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'HTTP와 HTTPS의 차이는?', options: { A: '보안 여부', B: '속도', C: '포트', D: '프로토콜' } },
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const easyShort = {
        id: 2,
        questionType: 'short' as const,
        content: '서브쿼리란?',
        correctAnswer: '쿼리 안의 쿼리',
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'TCP와 UDP의 차이는?', options: { A: '연결형 vs 비연결형', B: '동일함', C: '차이 없음', D: '모름' } },
        correctAnswer: 'A',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'JOIN이란?',
        correctAnswer: '테이블 결합',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'B+tree를 설명하세요',
        correctAnswer: 'B+tree는 균형 잡힌 트리 구조입니다.',
        difficulty: 4,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generateQuestion();

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('multiple_choice');
      expect(result[0].question).toBe('HTTP와 HTTPS의 차이는?');
      expect(result[0].difficulty).toBe('easy');
      expect(result[4].type).toBe('essay');
      expect(result[4].difficulty).toBe('hard');
    });

    it('should convert difficulty correctly', async () => {
      const easyMultiple = {
        id: 1,
        difficulty: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        isActive: true,
      };

      const easyShort = {
        id: 2,
        difficulty: 2,
        questionType: 'short' as const,
        content: 'Q2',
        correctAnswer: 'Answer2',
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        difficulty: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        difficulty: 3,
        questionType: 'short' as const,
        content: 'Q4',
        correctAnswer: 'Answer4',
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        difficulty: 5,
        questionType: 'essay' as const,
        content: 'Q5',
        correctAnswer: 'Essay answer',
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generateQuestion();

      expect(result[0].difficulty).toBe('easy');
      expect(result[1].difficulty).toBe('easy');
      expect(result[2].difficulty).toBe('medium');
      expect(result[3].difficulty).toBe('medium');
      expect(result[4].difficulty).toBe('hard');
    });

    it('should handle short answer questions', async () => {
      const easyMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const easyShort = {
        id: 2,
        questionType: 'short' as const,
        content: '서브쿼리란?',
        correctAnswer: '쿼리 안의 쿼리',
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'JOIN이란?',
        correctAnswer: '테이블 결합',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'Essay question',
        correctAnswer: 'Essay answer',
        difficulty: 5,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generateQuestion();

      expect(result[1].type).toBe('short_answer');
      if (result[1].type === 'short_answer') {
        expect(result[1].answer).toBe('쿼리 안의 쿼리');
        expect(result[1].keywords).toBeUndefined();
      }
    });

    it('should handle essay questions', async () => {
      const easyMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const easyShort = {
        id: 2,
        questionType: 'short' as const,
        content: 'Q2',
        correctAnswer: 'Answer',
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'Q4',
        correctAnswer: 'Answer',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'B+tree를 설명하세요',
        correctAnswer: 'B+tree는 균형 잡힌 트리 구조입니다.',
        difficulty: 5,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generateQuestion();

      expect(result[4].type).toBe('essay');
      if (result[4].type === 'essay') {
        expect(result[4].sampleAnswer).toBe('B+tree는 균형 잡힌 트리 구조입니다.');
        expect(result[4].keywords).toBeUndefined();
      }
    });

    it('should handle null difficulty as medium', async () => {
      const easyMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        difficulty: null,
        isActive: true,
      };

      const easyShort = {
        id: 2,
        questionType: 'short' as const,
        content: 'Q2',
        correctAnswer: 'Answer',
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'Q4',
        correctAnswer: 'Answer',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'Q5',
        correctAnswer: 'Essay answer',
        difficulty: 5,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generateQuestion();

      expect(result[0].difficulty).toBe('medium');
    });

    it('should throw error when less than 5 questions available', async () => {
      const fallbackQuestion = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([]) // easy multiple - empty
          .mockResolvedValueOnce([]) // easy short - empty
          .mockResolvedValueOnce([]) // medium multiple - empty
          .mockResolvedValueOnce([]) // medium short - empty
          .mockResolvedValueOnce([]) // hard essay - empty
          .mockResolvedValueOnce([fallbackQuestion]), // fallback query - only 1 question
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.generateQuestion()).rejects.toThrow(
        '질문 생성에 실패했습니다',
      );
    });

    it('should throw error when JSON parsing fails for multiple choice', async () => {
      const invalidMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: 'Invalid content - should be object', // Invalid: string instead of object
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const easyShort = {
        id: 2,
        questionType: 'short' as const,
        content: 'Q2',
        correctAnswer: 'Answer',
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'Q4',
        correctAnswer: 'Answer',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'Q5',
        correctAnswer: 'Essay answer',
        difficulty: 5,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([invalidMultiple])
          .mockResolvedValueOnce([easyShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.generateQuestion()).rejects.toThrow(
        '질문 생성 중 오류가 발생했습니다',
      );
    });

    it('should throw error when correctAnswer is missing for short answer', async () => {
      const easyMultiple = {
        id: 1,
        questionType: 'multiple' as const,
        content: { question: 'Q1', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'A',
        difficulty: 1,
        isActive: true,
      };

      const invalidShort = {
        id: 2,
        questionType: 'short' as const,
        content: 'Q2',
        correctAnswer: '', // Invalid: empty correctAnswer
        difficulty: 2,
        isActive: true,
      };

      const mediumMultiple = {
        id: 3,
        questionType: 'multiple' as const,
        content: { question: 'Q3', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
        correctAnswer: 'B',
        difficulty: 3,
        isActive: true,
      };

      const mediumShort = {
        id: 4,
        questionType: 'short' as const,
        content: 'Q4',
        correctAnswer: 'Answer',
        difficulty: 3,
        isActive: true,
      };

      const hardEssay = {
        id: 5,
        questionType: 'essay' as const,
        content: 'Q5',
        correctAnswer: 'Essay answer',
        difficulty: 5,
        isActive: true,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce([easyMultiple])
          .mockResolvedValueOnce([invalidShort])
          .mockResolvedValueOnce([mediumMultiple])
          .mockResolvedValueOnce([mediumShort])
          .mockResolvedValueOnce([hardEssay]),
      };

      mockQuestionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.generateQuestion()).rejects.toThrow(
        '질문 생성 중 오류가 발생했습니다',
      );
    });
  });

  describe('gradeSubjectiveQuestion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should grade short answer question with correct and incorrect answers', async () => {
      const question = {
        type: 'short_answer' as const,
        question: '서브쿼리란?',
        difficulty: 'easy' as const,
        answer: '쿼리 안의 쿼리',
      };

      const submissions = [
        { playerId: 'player1', answer: '쿼리 안의 쿼리', submittedAt: Date.now() },
        { playerId: 'player2', answer: '복잡한 쿼리', submittedAt: Date.now() },
      ];

      const mockGradeResult = {
        grades: [
          {
            playerId: 'player1',
            isCorrect: true,
            score: 10,
            feedback: '정확합니다! 서브쿼리는 쿼리 내부에 중첩된 쿼리를 의미합니다.',
          },
          {
            playerId: 'player2',
            isCorrect: false,
            score: 0,
            feedback: '서브쿼리는 단순히 복잡한 것이 아니라, 쿼리 내부에 포함된 또 다른 쿼리를 의미합니다.',
          },
        ],
      };

      mockClovaClient.callClova.mockResolvedValue(mockGradeResult);

      const result = await service.gradeSubjectiveQuestion(question, submissions);

      expect(mockClovaClient.callClova).toHaveBeenCalledWith({
        systemPrompt: expect.stringContaining('채점하고'),
        userMessage: expect.stringContaining('short_answer'),
        jsonSchema: expect.any(Object),
      });

      expect(result).toHaveLength(2);
      expect(result[0].playerId).toBe('player1');
      expect(result[0].answer).toBe('쿼리 안의 쿼리');
      expect(result[0].isCorrect).toBe(true);
      expect(result[0].score).toBe(10);
      expect(result[1].playerId).toBe('player2');
      expect(result[1].answer).toBe('복잡한 쿼리');
      expect(result[1].isCorrect).toBe(false);
      expect(result[1].score).toBe(0);
    });

    it('should grade essay question with partial scores', async () => {
      const question = {
        type: 'essay' as const,
        question: 'B+tree의 특징과 장점을 설명하세요',
        difficulty: 'hard' as const,
        sampleAnswer:
          'B+tree는 균형 잡힌 트리 구조로, 모든 데이터가 리프 노드에만 저장됩니다. 검색, 삽입, 삭제의 시간 복잡도가 O(log n)으로 효율적이며, 범위 검색에 유리합니다.',
      };

      const submissions = [
        {
          playerId: 'player1',
          answer:
            'B+tree는 균형 트리이고 데이터가 리프 노드에만 있습니다. 검색이 O(log n)이고 범위 검색에 좋습니다.',
          submittedAt: Date.now(),
        },
        {
          playerId: 'player2',
          answer: 'B+tree는 균형 트리입니다.',
          submittedAt: Date.now(),
        },
        {
          playerId: 'player3',
          answer: 'B+tree는 트리 구조입니다.',
          submittedAt: Date.now(),
        },
      ];

      const mockGradeResult = {
        grades: [
          {
            playerId: 'player1',
            isCorrect: true,
            score: 9,
            feedback:
              '핵심 개념을 잘 이해하고 있습니다. 균형 유지, 데이터 저장 위치, 시간 복잡도, 범위 검색 모두 언급했습니다. 조금 더 구체적으로 설명하면 완벽합니다.',
          },
          {
            playerId: 'player2',
            isCorrect: false,
            score: 3,
            feedback:
              '균형 트리라는 것은 맞지만, 핵심 특징인 데이터 저장 위치(리프 노드), 시간 복잡도, 범위 검색 장점을 놓쳤습니다.',
          },
          {
            playerId: 'player3',
            isCorrect: false,
            score: 1,
            feedback:
              '너무 일반적인 답변입니다. B+tree의 구체적인 특징(균형 유지, 리프 노드 데이터 저장, O(log n) 복잡도, 범위 검색 효율성)을 설명해야 합니다.',
          },
        ],
      };

      mockClovaClient.callClova.mockResolvedValue(mockGradeResult);

      const result = await service.gradeSubjectiveQuestion(question, submissions);

      expect(mockClovaClient.callClova).toHaveBeenCalledWith({
        systemPrompt: expect.stringContaining('채점하고'),
        userMessage: expect.stringContaining('essay'),
        jsonSchema: expect.objectContaining({
          properties: expect.objectContaining({
            grades: expect.objectContaining({
              items: expect.objectContaining({
                properties: expect.objectContaining({
                  score: expect.objectContaining({
                    description: expect.stringContaining('0~10점 사이의 부분 점수'),
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      expect(result).toHaveLength(3);
      expect(result[0].playerId).toBe('player1');
      expect(result[0].answer).toBe(submissions[0].answer);
      expect(result[0].isCorrect).toBe(true);
      expect(result[0].score).toBe(9);
      expect(result[1].playerId).toBe('player2');
      expect(result[1].answer).toBe(submissions[1].answer);
      expect(result[1].isCorrect).toBe(false);
      expect(result[1].score).toBe(3);
      expect(result[2].playerId).toBe('player3');
      expect(result[2].answer).toBe(submissions[2].answer);
      expect(result[2].isCorrect).toBe(false);
      expect(result[2].score).toBe(1);
    });

    it('should handle essay question with score exactly 7 (boundary case)', async () => {
      const question = {
        type: 'essay' as const,
        question: 'TCP와 UDP의 차이를 설명하세요',
        difficulty: 'medium' as const,
        sampleAnswer: 'TCP는 연결 지향적이고 신뢰성을 보장하며, UDP는 비연결 지향적이고 빠르지만 신뢰성을 보장하지 않습니다.',
      };

      const submissions = [{ playerId: 'player1', answer: 'TCP는 연결 지향이고 UDP는 비연결 지향입니다.', submittedAt: Date.now() }];

      const mockGradeResult = {
        grades: [
          {
            playerId: 'player1',
            isCorrect: true,
            score: 7,
            feedback:
              '기본적인 차이점을 이해하고 있습니다. 신뢰성, 속도, 사용 사례 등을 추가로 언급하면 더 완벽한 답변이 됩니다.',
          },
        ],
      };

      mockClovaClient.callClova.mockResolvedValue(mockGradeResult);

      const result = await service.gradeSubjectiveQuestion(question, submissions);

      expect(result[0].score).toBe(7);
      expect(result[0].isCorrect).toBe(true);
    });

    it('should include question type in user message', async () => {
      const shortAnswerQuestion = {
        type: 'short_answer' as const,
        question: 'Test question',
        difficulty: 'easy' as const,
        answer: 'Test answer',
      };

      const submissions = [{ playerId: 'player1', answer: 'Test answer', submittedAt: Date.now() }];

      mockClovaClient.callClova.mockResolvedValue({
        grades: [
          { playerId: 'player1', isCorrect: true, score: 10, feedback: 'Good!' },
        ],
      });

      await service.gradeSubjectiveQuestion(shortAnswerQuestion, submissions);

      const callArgs = mockClovaClient.callClova.mock.calls[0][0];
      expect(callArgs.userMessage).toContain('[문제 타입] short_answer');
      expect(callArgs.userMessage).toContain('[문제] Test question');
      expect(callArgs.userMessage).toContain('[정답] Test answer');
    });

    it('should use sampleAnswer for essay questions in user message', async () => {
      const essayQuestion = {
        type: 'essay' as const,
        question: 'Essay question',
        difficulty: 'hard' as const,
        sampleAnswer: 'This is a sample answer',
      };

      const submissions = [{ playerId: 'player1', answer: 'Student answer', submittedAt: Date.now() }];

      mockClovaClient.callClova.mockResolvedValue({
        grades: [
          {
            playerId: 'player1',
            isCorrect: true,
            score: 8,
            feedback: 'Good!',
          },
        ],
      });

      await service.gradeSubjectiveQuestion(essayQuestion, submissions);

      const callArgs = mockClovaClient.callClova.mock.calls[0][0];
      expect(callArgs.userMessage).toContain('[정답] This is a sample answer');
    });
  });
});
