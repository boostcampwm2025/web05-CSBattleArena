import { BadRequestException } from '@nestjs/common';

export interface AnswerSubmission {
  questionId: number;
  answer: string;
  submittedAt: number;
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export class SinglePlayGame {
  private readonly _userId: string;
  private readonly _categoryIds: number[];
  private readonly _questionIds: number[];
  private readonly _answers: Map<number, AnswerSubmission>;
  private readonly _scores: Map<number, number>;
  private _status: 'playing' | 'completed';
  private readonly _createdAt: number;

  constructor(userId: string, categoryIds: number[], questionIds: number[]) {
    this._userId = userId;
    this._categoryIds = categoryIds;
    this._questionIds = questionIds;
    this._answers = new Map();
    this._scores = new Map();
    this._status = 'playing';
    this._createdAt = Date.now();
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get categoryIds(): number[] {
    return [...this._categoryIds];
  }

  get questionIds(): number[] {
    return [...this._questionIds];
  }

  get status(): 'playing' | 'completed' {
    return this._status;
  }

  get createdAt(): number {
    return this._createdAt;
  }

  get answers(): ReadonlyMap<number, AnswerSubmission> {
    return this._answers;
  }

  /**
   * 문제가 이 게임에서 발급된 것인지 검증
   */
  validateQuestion(questionId: number): void {
    if (this._status === 'completed') {
      throw new BadRequestException('이미 완료된 게임입니다.');
    }

    if (!this._questionIds.includes(questionId)) {
      throw new BadRequestException('요청하지 않은 문제입니다.');
    }
  }

  /**
   * 이미 답변한 문제인지 확인
   */
  hasAnswered(questionId: number): boolean {
    return this._answers.has(questionId);
  }

  /**
   * 답안 제출
   */
  submitAnswer(
    questionId: number,
    answer: string,
    isCorrect: boolean,
    score: number,
    feedback: string,
  ): void {
    this.validateQuestion(questionId);

    const submission: AnswerSubmission = {
      questionId,
      answer,
      submittedAt: Date.now(),
      isCorrect,
      score,
      feedback,
    };

    this._answers.set(questionId, submission);
    this._scores.set(questionId, score);
  }

  /**
   * 총점 계산
   */
  getTotalScore(): number {
    let total = 0;

    for (const score of this._scores.values()) {
      total += score;
    }

    return total;
  }

  /**
   * 정답 개수 계산
   */
  getCorrectAnswersCount(): number {
    let count = 0;

    for (const answer of this._answers.values()) {
      if (answer.isCorrect) {
        count++;
      }
    }

    return count;
  }

  /**
   * 게임 통계 조회
   */
  getStats() {
    return {
      totalQuestions: this._questionIds.length,
      answeredQuestions: this._answers.size,
      correctAnswers: this.getCorrectAnswersCount(),
      totalScore: this.getTotalScore(),
    };
  }

  /**
   * 게임 완료 처리
   */
  complete(): void {
    this._status = 'completed';
  }

  /**
   * 게임이 완료되었는지 확인
   */
  isCompleted(): boolean {
    return this._status === 'completed';
  }

  /**
   * 모든 문제를 풀었는지 확인
   */
  isAllAnswered(): boolean {
    return this._answers.size === this._questionIds.length;
  }
}
