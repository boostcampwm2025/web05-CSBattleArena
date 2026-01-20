import { Injectable, NotFoundException } from '@nestjs/common';
import { SinglePlayGame } from './domain/single-play-game';

/**
 * 싱글 플레이 게임 세션을 관리하는 Repository
 * 도메인 모델(SinglePlayGame)의 라이프사이클을 관리
 */
@Injectable()
export class SinglePlaySessionManager {
  private games = new Map<string, SinglePlayGame>();

  /**
   * 새로운 게임 시작
   */
  createGame(userId: string, categoryIds: number[], questionIds: number[]): SinglePlayGame {
    // 이미 진행 중인 게임이 있으면 제거
    if (this.games.has(userId)) {
      this.games.delete(userId);
    }

    const game = new SinglePlayGame(userId, categoryIds, questionIds);
    this.games.set(userId, game);

    return game;
  }

  /**
   * 게임 조회
   */
  findGame(userId: string): SinglePlayGame | null {
    return this.games.get(userId) || null;
  }

  /**
   * 게임 조회 (없으면 에러)
   */
  findGameOrThrow(userId: string): SinglePlayGame {
    const game = this.games.get(userId);

    if (!game) {
      throw new NotFoundException('게임 세션을 찾을 수 없습니다. 먼저 문제를 요청해주세요.');
    }

    return game;
  }

  /**
   * 게임 삭제
   */
  deleteGame(userId: string): boolean {
    return this.games.delete(userId);
  }

  /**
   * 모든 게임 조회 (관리자용)
   */
  getAllGames(): SinglePlayGame[] {
    return Array.from(this.games.values());
  }
}
