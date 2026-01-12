import { Injectable } from '@nestjs/common';
import { IMatchQueue, Match } from './interfaces/matchmaking.interface';
import { InMemoryMatchQueue } from './queue/in-memory-queue';
import { UserInfo } from '../game/interfaces/user.interface';
import { Server } from 'socket.io';
import { GameSessionManager } from '../game/game-session-manager';

@Injectable()
export class MatchmakingService {
  private readonly matchQueue: IMatchQueue;
  private readonly sessionManager: GameSessionManager;
  private readonly userToSessionId = new Map<string, string>();

  constructor() {
    this.matchQueue = new InMemoryMatchQueue();
  }

  startGame(
    roomId: string,
    player1Id: string,
    player1SocketId: string,
    player1Info: UserInfo,
    player2Id: string,
    player2SocketId: string,
    player2Info: UserInfo,
    _server: Server,
  ): void {
    this.sessionManager.createGameSession(
      roomId,
      player1Id,
      player1SocketId,
      player1Info,
      player2Id,
      player2SocketId,
      player2Info,
    );
  }

  addToQueue(userId: string): Match | null {
    const sessionId = `session-${userId}-${Date.now()}`;
    this.userToSessionId.set(userId, sessionId);

    return this.matchQueue.add(userId);
  }

  removeFromQueue(userId: string): void {
    this.matchQueue.remove(userId);
    this.userToSessionId.delete(userId);
  }

  getQueueSize(): number {
    return this.matchQueue.getQueueSize();
  }

  getSessionId(userId: string): string | undefined {
    return this.userToSessionId.get(userId);
  }
}
