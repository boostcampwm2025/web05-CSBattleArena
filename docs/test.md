# 라운드 진행 로직 구현 계획 (도메인 분리 포함)

## 📋 구현 개요

CS 지식 1대1 대결 서비스의 라운드 진행 로직을 WebSocket 기반으로 구현하며, 동시에 match 도메인을 matchmaking과 game으로 분리하여 단일 책임 원칙을 준수합니다.

**사용자 선택사항:**
- 타이머: 빠른 템포 (3초 준비, 20/30/45초 문제, 7초 결과)
- 재접속: 미지원 (연결 끊김 시 패배 처리)
- DB 저장: 매치 종료 시 일괄 저장
- 타임아웃: 빈 답안 자동 제출

## 🏗️ 도메인 분리 리팩토링

### 현재 문제점
현재 `match` 도메인이 **매칭(큐 관리)**과 **게임 진행(라운드, 점수)** 두 가지 책임을 가지고 있습니다.

### 분리 전략
- **Gateway**: 하나로 유지 (`/ws` 네임스페이스) → 클라이언트 영향 최소화
- **Service & Module**: `matchmaking`과 `game`으로 도메인 분리
- **Entity**: 공통 엔티티는 독립된 `match/entity` 디렉토리 유지

### 새로운 디렉토리 구조

```
/packages/backend/src/
├── matchmaking/                     # 매칭 도메인 (새로 생성)
│   ├── matchmaking.service.ts      # 큐 관리, 플레이어 매칭
│   ├── matchmaking.module.ts
│   ├── queue/
│   │   ├── in-memory-queue.ts      # (기존 match/queues에서 이동)
│   │   └── queue.session.ts        # (기존 match/queues에서 이동)
│   └── interfaces/
│       └── matchmaking.interface.ts # (기존 match-queue.interface 이동)
│
├── game/                            # 게임 진행 도메인 (새로 생성)
│   ├── game.gateway.ts             # WebSocket 이벤트 (기존 match.gateway 이동/수정)
│   ├── game.service.ts             # 게임 로직, DB 저장 (기존 match.service 이동/수정)
│   ├── game.module.ts
│   ├── game-session-manager.ts     # (기존 match-session-manager 이동/수정)
│   ├── round-progression.service.ts # 라운드 진행 오케스트레이터 (새로 생성) 
│   ├── round-timer.ts              # 타이머 관리 (새로 생성) ?? 틱마다 이벤트로 줘야하지 않나?
│   ├── round-timer.constants.ts    # 타이머 상수 (새로 생성)
│   ├── transformers/
│   │   └── question.transformer.ts # (새로 생성)
│   └── interfaces/
│       ├── game.interfaces.ts      # (기존 match.interfaces 이동/수정)
│       └── user.interface.ts       # (기존에서 이동)
│
└── match/                           # 공통 엔티티만 유지 (기존 디렉토리 정리)
    └── entity/
        ├── match.entity.ts
        ├── round.entity.ts
        └── round-answer.entity.ts
```

## 🎯 타이머 설정 상수

```typescript
// packages/backend/src/game/round-timer.constants.ts (새로 생성)
export const ROUND_DURATIONS = {
  READY: 3,                                    // 준비 카운트다운
  QUESTION: { easy: 20, medium: 30, hard: 45 }, // 난이도별 문제 풀이 시간
  REVIEW: 7,                                   // 결과 확인
  TICK_INTERVAL: 1                             // 시간 동기화 (1초마다)
};
```

## 🔧 핵심 컴포넌트

### 1. Matchmaking 도메인 (매칭 관련)

#### `matchmaking.service.ts` (기존 match.service 분리)
```typescript
@Injectable()
export class MatchmakingService {
  constructor(private readonly queue: InMemoryMatchQueue) {}

  addToQueue(userId: string, userInfo: UserInfo): Match | null {
    return this.queue.add(userId);
  }

  removeFromQueue(userId: string): void {
    this.queue.remove(userId);
  }

  getQueueSize(): number {
    return this.queue.getQueueSize();
  }
}
```

#### `matchmaking.module.ts`
```typescript
@Module({
  providers: [MatchmakingService, InMemoryMatchQueue],
  exports: [MatchmakingService],
})
export class MatchmakingModule {}
```

### 2. Game 도메인 (게임 진행 관련)

#### `game.gateway.ts` (기존 match.gateway 이동/수정)
**역할**: 모든 WebSocket 이벤트 처리 (매칭 + 게임)
```typescript
@WebSocketGateway({ namespace: '/ws', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly matchmakingService: MatchmakingService,  // 매칭 서비스 주입
    private readonly gameService: GameService,                // 게임 서비스 주입
    private readonly sessionManager: GameSessionManager,
    private readonly roundProgression: RoundProgressionService,
  ) {}

  // 매칭 이벤트
  @SubscribeMessage('match:enqueue')
  handleMatchEnqueue(@ConnectedSocket() client: Socket) { ... }

  @SubscribeMessage('match:dequeue')
  handleMatchDequeue(@ConnectedSocket() client: Socket) { ... }

  // 게임 이벤트
  @SubscribeMessage('submit:answer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { answer: string },
    @Ack() ack: (res: any) => void
  ) { ... }

  handleDisconnect(client: Socket) { ... }
}
```

#### `game.service.ts` (기존 match.service 분리)
**역할**: 게임 로직, 그레이딩, DB 저장
```typescript
@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Round) private roundRepo: Repository<Round>,
    @InjectRepository(RoundAnswer) private answerRepo: Repository<RoundAnswer>,
    private readonly quizService: QuizService,
    private readonly sessionManager: GameSessionManager,
  ) {}

  async submitAnswer(roomId: string, playerId: string, answer: string): Promise<void>
  async processGrading(roomId: string): Promise<RoundResult>
  async saveMatchToDatabase(roomId: string): Promise<void>
  // ... 기타 게임 로직
}
```

#### `round-progression.service.ts` (새로 생성)
**역할**: 라운드 진행 오케스트레이터
```typescript
@Injectable()
export class RoundProgressionService {
  constructor(
    private readonly roundTimer: RoundTimer,
    private readonly gameService: GameService,
    private readonly sessionManager: GameSessionManager,
    private readonly server: Server,  // WebSocket Server 주입
  ) {}

  async startRoundSequence(roomId: string): Promise<void>
  private async phaseReady(roomId: string): Promise<void>
  private async phaseQuestion(roomId: string): Promise<void>
  private async phaseGrading(roomId: string): Promise<void>
  private async phaseReview(roomId: string): Promise<void>
  private async transitionToNextRound(roomId: string): Promise<void>
  private async finishGame(roomId: string): Promise<void>
  private handleQuestionTimeout(roomId: string): void
}
```

#### `round-timer.ts` (새로 생성)
**역할**: 모든 타이머 관리
```typescript
@Injectable()
export class RoundTimer {
  private timers: Map<string, {
    readyTimer?: NodeJS.Timeout;
    questionTimer?: NodeJS.Timeout;
    tickInterval?: NodeJS.Timeout;
    reviewTimer?: NodeJS.Timeout;
  }> = new Map();

  startReadyCountdown(roomId: string, duration: number, callback: () => void): void
  startQuestionTimer(roomId: string, duration: number, onTimeout: () => void): void
  startTickInterval(roomId: string, totalDuration: number, onTick: (remained: number) => void): void
  startReviewTimer(roomId: string, duration: number, callback: () => void): void
  clearQuestionTimer(roomId: string): void
  clearAllTimers(roomId: string): void
}
```

#### `game-session-manager.ts` (기존 match-session-manager 이동/수정)
**추가 메서드**:
```typescript
setPhase(roomId: string, phase: RoundPhase): void
getPhase(roomId: string): RoundPhase
hasPlayerSubmitted(roomId: string, playerId: string): boolean
```

#### `transformers/question.transformer.ts` (새로 생성)
```typescript
export function transformQuestionForClient(
  question: Question,
  categories: { parent?: Category; name: string }
): RoundStartQuestionPayload {
  return {
    category: [categories.parent?.name || 'CS', categories.name],
    difficulty: question.difficulty,
    type: question.questionType,
    content: formatQuestionContent(question)
  };
}
```

#### `game.module.ts`
```typescript
@Module({
  imports: [
    MatchmakingModule,  // 매칭 서비스 사용
    QuizModule,
    TypeOrmModule.forFeature([Match, Round, RoundAnswer])
  ],
  providers: [
    GameGateway,
    GameService,
    GameSessionManager,
    RoundProgressionService,
    RoundTimer,
  ],
  exports: [GameSessionManager]
})
export class GameModule {}
```

## 📡 WebSocket 이벤트 구현 명세

### 1. `round:ready` (S→C)
**발송 시점**: 각 라운드 시작 전 3초 카운트다운
```typescript
// RoundProgressionService.phaseReady()
server.to(roomId).emit('round:ready', {
  durationSec: 3,
  roundIndex: session.currentRound,
  totalRounds: session.totalRounds
});
```

### 2. `round:start` (S→C)
**발송 시점**: 준비 카운트다운 종료 후
```typescript
// RoundProgressionService.phaseQuestion()
const question = roundData.question;
const categories = await getCategoriesForQuestion(question.id);

server.to(roomId).emit('round:start', {
  durationSec: ROUND_DURATIONS.QUESTION[question.difficulty],
  question: transformQuestionForClient(question, categories)
});
```

### 3. `round:tick` (S→C)
**발송 시점**: 문제 출제 중 매 1초마다 (시간 동기화)
```typescript
// RoundTimer.startTickInterval()
let remainedSec = totalDuration;
const interval = setInterval(() => {
  onTick(remainedSec);  // → server.to(roomId).emit('round:tick', { remainedSec })
  remainedSec--;
  if (remainedSec < 0) clearInterval(interval);
}, 1000);
```

### 4. `opponent:submitted` (S→C)
**발송 시점**: 상대가 답안 제출했을 때
```typescript
// GameGateway.handleSubmitAnswer()
const opponentSocketId = getOpponentSocketId(roomId, userId);
server.to(opponentSocketId).emit('opponent:submitted', {});
```

### 5. `round:end` (S→C)
**발송 시점**: 그레이딩 완료 후
```typescript
// RoundProgressionService.phaseReview()
// 각 플레이어에게 개별 전송 (my/opponent 관점)
server.to(player1SocketId).emit('round:end', {
  durationSec: 7,
  results: {
    my: { submitted, delta, total, correct },
    opponent: { submitted, delta, total, correct }
  },
  solution: { bestAnswer, explanation }
});
```

### 6. `submit:answer` (C→S, ack)
**수신 처리**:
```typescript
// GameGateway.handleSubmitAnswer()
@SubscribeMessage('submit:answer')
async handleSubmitAnswer(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { answer: string },
  @Ack() ack: (res: any) => void
) {
  try {
    await gameService.submitAnswer(roomId, userId, data.answer);

    // 상대에게 알림
    server.to(opponentSocketId).emit('opponent:submitted', {});

    // 양쪽 제출 시 즉시 그레이딩
    if (sessionManager.isAllSubmitted(roomId)) {
      roundTimer.clearQuestionTimer(roomId);
      await roundProgression.phaseGrading(roomId);
    }

    ack({ ok: true });
  } catch (error) {
    ack({ ok: false, error: error.message });
  }
}
```

## 🎮 라운드 진행 플로우

```
매치 시작 (match:found)
    ↓
┌──────────────────────────────────┐
│ Round Loop (1-5)                  │
│                                   │
│  1. Ready Phase (3초)             │
│     emit: round:ready             │
│     countdown...                  │
│                                   │
│  2. Question Phase (20/30/45초)   │
│     emit: round:start             │
│     start tick interval (1초마다)  │
│     wait for submissions          │
│     - 양쪽 제출 → 즉시 그레이딩    │
│     - 타임아웃 → 빈 답안 자동 제출 │
│                                   │
│  3. Grading Phase                 │
│     stop tick interval            │
│     grade answers                 │
│     calculate scores              │
│                                   │
│  4. Review Phase (7초)            │
│     emit: round:end               │
│     show results...               │
│                                   │
└──────────────────────────────────┘
    ↓
매치 종료
emit: game:finished
DB 저장 (Match, Rounds, RoundAnswers)
세션 정리
```

## 💾 데이터베이스 저장 전략

**매치 종료 시 일괄 저장** (사용자 선택)

```typescript
// GameService.saveMatchToDatabase()
async saveMatchToDatabase(roomId: string): Promise<void> {
  const session = sessionManager.getGameSession(roomId);
  const finalResult = this.calculateFinalResult(roomId);

  await this.connection.transaction(async (manager) => {
    // 1. Match 엔티티 생성
    const match = manager.create(Match, {
      player1Id: parseUserId(session.player1Id),
      player2Id: parseUserId(session.player2Id),
      winnerId: finalResult.winnerId ? parseUserId(finalResult.winnerId) : null,
      matchType: 'multi'
    });
    const savedMatch = await manager.save(match);

    // 2. 모든 Round 및 RoundAnswer 저장
    for (const [roundNum, roundData] of session.rounds.entries()) {
      const round = manager.create(Round, {
        matchId: savedMatch.id,
        questionId: roundData.question.id,
        roundNumber: roundNum
      });
      const savedRound = await manager.save(round);

      // 3. 각 플레이어의 RoundAnswer 저장
      for (const [playerId, submission] of Object.entries(roundData.submissions)) {
        const grade = roundData.result.grades.find(g => g.playerId === playerId);

        const roundAnswer = manager.create(RoundAnswer, {
          userId: parseUserId(playerId),
          roundId: savedRound.id,
          userAnswer: submission?.answer || '',
          score: grade.score,
          answerStatus: grade.isCorrect ? 'correct' : 'incorrect',
          aiFeedback: grade.feedback
        });
        await manager.save(roundAnswer);
      }
    }
  });
}
```

**호출 시점**: `RoundProgressionService.finishGame()` 메서드에서 `game:finished` 이벤트 발송 전

## ⚠️ 에러 처리

### 1. 플레이어 연결 끊김
```typescript
// GameGateway.handleDisconnect()
handleDisconnect(client: Socket) {
  const roomId = sessionManager.getRoomBySocketId(client.id);
  if (!roomId) return;

  // 타이머 정리
  roundTimer.clearAllTimers(roomId);

  // 상대방 승리 처리
  const disconnectedPlayerId = sessionManager.getUserId(client.id);
  const winnerId = getOpponentId(roomId, disconnectedPlayerId);

  // DB 저장 (연결 끊김 기록)
  await gameService.saveMatchToDatabase(roomId);

  // 상대에게 알림
  const opponentSocketId = getOpponentSocketId(roomId, disconnectedPlayerId);
  server.to(opponentSocketId).emit('opponent:disconnected', {
    winnerId,
    reason: 'disconnect'
  });

  // 세션 정리
  sessionManager.deleteGameSession(roomId);
}
```

### 2. 타임아웃 처리
```typescript
// RoundProgressionService.handleQuestionTimeout()
handleQuestionTimeout(roomId: string) {
  const session = sessionManager.getGameSession(roomId);

  // 제출하지 않은 플레이어는 빈 답안 자동 제출
  if (!sessionManager.hasPlayerSubmitted(roomId, session.player1Id)) {
    gameService.submitAnswer(roomId, session.player1Id, '');
  }
  if (!sessionManager.hasPlayerSubmitted(roomId, session.player2Id)) {
    gameService.submitAnswer(roomId, session.player2Id, '');
  }

  // 그레이딩으로 진행
  await this.phaseGrading(roomId);
}
```

### 3. 중복 제출 방지
```typescript
// GameService.submitAnswer()
async submitAnswer(roomId: string, playerId: string, answer: string) {
  if (sessionManager.hasPlayerSubmitted(roomId, playerId)) {
    throw new Error('Already submitted');
  }

  if (sessionManager.getPhase(roomId) !== 'question') {
    throw new Error('Cannot submit answer outside question phase');
  }

  // 제출 처리...
}
```

### 4. 타이머 메모리 누수 방지
```typescript
// RoundTimer.clearAllTimers()
clearAllTimers(roomId: string) {
  const timerSet = this.timers.get(roomId);
  if (!timerSet) return;

  if (timerSet.readyTimer) clearTimeout(timerSet.readyTimer);
  if (timerSet.questionTimer) clearTimeout(timerSet.questionTimer);
  if (timerSet.tickInterval) clearInterval(timerSet.tickInterval);
  if (timerSet.reviewTimer) clearTimeout(timerSet.reviewTimer);

  this.timers.delete(roomId);
}
```

## 📝 구현 순서

### Phase 1: 도메인 분리 (리팩토링)
1. `matchmaking/` 디렉토리 생성
2. `matchmaking.service.ts`, `matchmaking.module.ts` 생성
3. `queue/` 디렉토리를 matchmaking으로 이동
4. `game/` 디렉토리 생성
5. 기존 `match.gateway.ts`를 `game.gateway.ts`로 이동 및 수정
6. 기존 `match.service.ts`를 `game.service.ts`로 이동 및 수정
7. 기존 `match-session-manager.ts`를 `game-session-manager.ts`로 이동
8. `app.module.ts` 수정 (MatchModule → GameModule 임포트)

### Phase 2: 라운드 진행 인프라 구축
1. `game/round-timer.constants.ts` 생성 - 타이머 상수 정의
2. `game/interfaces/game.interfaces.ts` 수정 - 새 이벤트 인터페이스 추가
3. `game/round-timer.ts` 생성 - 타이머 관리 로직
4. `game/game-session-manager.ts` 수정 - phase 관련 메서드 추가

### Phase 3: 라운드 진행 서비스
1. `game/round-progression.service.ts` 생성
2. 4단계 phase 메서드 구현 (ready, question, grading, review)
3. 타이머 콜백 연결
4. `game.module.ts`에 RoundProgressionService 등록

### Phase 4: 게이트웨이 통합
1. `game.gateway.ts` 수정 - RoundProgressionService 통합
2. `submit:answer` 이벤트에 ack 응답 추가
3. `handleDisconnect()` 개선
4. 매칭 완료 후 `roundProgression.startRoundSequence()` 호출

### Phase 5: Question 변환
1. `game/transformers/question.transformer.ts` 생성
2. Category 조회 로직 구현 (QuizService에 메서드 추가 또는 직접 조회)
3. 문제 content 포맷팅

### Phase 6: 데이터베이스 저장
1. `game.module.ts` - TypeORM 리포지토리 추가
2. `game.service.ts` - `saveMatchToDatabase()` 구현
3. 트랜잭션 처리

### Phase 7: 에러 처리 및 테스트
1. 연결 끊김 핸들러
2. 타임아웃 핸들러
3. 유효성 검증 추가
4. 통합 테스트

## ✅ 검증 방법

### 수동 테스트 체크리스트
1. [ ] 두 클라이언트 접속 → 매칭 성공
2. [ ] `round:ready` 이벤트 수신 (3초)
3. [ ] `round:start` 이벤트 수신 (문제 표시)
4. [ ] `round:tick` 이벤트 매 초마다 수신 (시간 동기화)
5. [ ] 답안 제출 시 ack 응답 수신
6. [ ] 상대 제출 시 `opponent:submitted` 수신
7. [ ] 양쪽 제출 후 `round:end` 수신 (점수 확인)
8. [ ] 5라운드 진행 후 게임 종료
9. [ ] DB에 Match, Round, RoundAnswer 저장 확인
10. [ ] 타임아웃 시나리오 (답안 미제출 → 빈 답안 자동 제출)
11. [ ] 연결 끊김 시나리오
12. [ ] 중복 제출 방지

### DB 검증
```sql
-- Match 확인
SELECT * FROM matches ORDER BY id DESC LIMIT 1;

-- Rounds 확인
SELECT * FROM rounds WHERE match_id = [match_id];

-- RoundAnswers 확인
SELECT * FROM round_answers WHERE round_id IN
  (SELECT id FROM rounds WHERE match_id = [match_id]);
```

## 🔑 주요 파일 목록

### 새로 생성할 파일
**Matchmaking 도메인:**
- `/packages/backend/src/matchmaking/matchmaking.service.ts`
- `/packages/backend/src/matchmaking/matchmaking.module.ts`
- `/packages/backend/src/matchmaking/interfaces/matchmaking.interface.ts`

**Game 도메인:**
- `/packages/backend/src/game/game.module.ts`
- `/packages/backend/src/game/round-timer.constants.ts`
- `/packages/backend/src/game/round-timer.ts`
- `/packages/backend/src/game/round-progression.service.ts`
- `/packages/backend/src/game/transformers/question.transformer.ts`

### 이동/수정할 파일
**Matchmaking으로 이동:**
- `/packages/backend/src/match/queues/` → `/packages/backend/src/matchmaking/queue/`

**Game으로 이동:**
- `/packages/backend/src/match/match.gateway.ts` → `/packages/backend/src/game/game.gateway.ts`
- `/packages/backend/src/match/match.service.ts` → `/packages/backend/src/game/game.service.ts`
- `/packages/backend/src/match/match-session-manager.ts` → `/packages/backend/src/game/game-session-manager.ts`
- `/packages/backend/src/match/interfaces/match.interfaces.ts` → `/packages/backend/src/game/interfaces/game.interfaces.ts`
- `/packages/backend/src/match/interfaces/user.interface.ts` → `/packages/backend/src/game/interfaces/user.interface.ts`

**수정만:**
- `/packages/backend/src/app.module.ts` - GameModule 임포트
- `/packages/backend/src/match/entity/*.ts` - 유지 (공통 엔티티)

### 삭제할 파일/디렉토리
- `/packages/backend/src/match/match.module.ts` (더 이상 필요 없음)

## 🎯 핵심 구현 포인트

1. **도메인 분리**: matchmaking과 game으로 명확히 분리하여 단일 책임 원칙 준수
2. **타이머 생명주기**: 모든 타이머는 RoundTimer 클래스에서 중앙 관리, 게임 종료나 연결 끊김 시 반드시 정리
3. **상태 머신**: currentPhase를 통해 명확한 상태 전환 관리 (ready → question → grading → review)
4. **시간 동기화**: `round:tick` 이벤트를 1초마다 발송하여 클라이언트 타이머와 동기화
5. **이벤트 발송**: 각 플레이어에게 my/opponent 관점으로 개인화된 데이터 전송
6. **타임아웃 처리**: 빈 답안 자동 제출로 게임 진행 보장
7. **DB 저장**: 매치 종료 시 트랜잭션으로 일괄 저장하여 데이터 무결성 보장
8. **Gateway 통합**: 하나의 Gateway에서 matchmaking과 game 서비스를 모두 사용하여 클라이언트 변경 최소화
