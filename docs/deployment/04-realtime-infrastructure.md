# 4. 실시간 인프라

> WebSocket, 매칭 시스템, 세션 관리를 위한 인프라 설계

## 인프라 선택: Redis 도입 여부

### 현재 단계: In-Memory (단일 WAS)

현재 비용 최적화 단계에서는 **WAS 서버 1대**로 운영하므로, In-Memory 방식으로 충분합니다.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        현재 구성 (Redis 없이 운영)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ✅ 단일 서버에서는 In-Memory로 충분                                        │
│                                                                              │
│   Client ──────────▶ WAS Server (단일)                                      │
│                          │                                                   │
│                          ├── Socket.IO                                       │
│                          ├── In-Memory 매칭 큐                               │
│                          └── In-Memory 세션 관리                             │
│                                                                              │
│   장점:                                                                      │
│   • 추가 인프라 비용 없음 (Redis 서버 불필요)                                │
│   • 구현 복잡도 낮음                                                         │
│   • 네트워크 지연 없음 (로컬 메모리 접근)                                    │
│                                                                              │
│   한계:                                                                      │
│   • WAS 재시작 시 세션 데이터 손실                                           │
│   • 수평 확장 시 Redis 도입 필요                                             │
│                                                                              │
│   적합 상황:                                                                 │
│   • 동시 접속 ~100명 이하                                                    │
│   • 서버 재시작 시 진행 중 게임 중단 허용                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Redis 도입이 필요한 시점

| 상황 | 설명 | Redis 필요성 |
|------|------|-------------|
| WAS 다중화 | 서버 2대 이상 운영 | **필수** |
| 세션 영속성 | 서버 재시작 후 게임 복구 필요 | 권장 |
| 고가용성 | 무중단 배포, 장애 복구 | 권장 |
| 대규모 트래픽 | 동시 접속 500명 이상 | 권장 |

### Redis 도입 시 장점

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Redis 도입 시 장점 5가지                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1️⃣  WAS 수평 확장 가능                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • 여러 WAS 서버가 동일한 세션/큐 공유                           │       │
│   │  • Load Balancer로 트래픽 분산                                   │       │
│   │  • 동시 접속자 증가에 유연하게 대응                              │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   2️⃣  세션 영속성                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • WAS 재시작 시에도 게임 세션 유지                              │       │
│   │  • 무중단 배포 가능 (Rolling Update)                             │       │
│   │  • 장애 발생 시 다른 서버에서 세션 복구                          │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   3️⃣  Socket.IO 다중 서버 지원                                               │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Redis Adapter로 서버 간 이벤트 전파                           │       │
│   │  • 서로 다른 서버에 연결된 플레이어 간 통신                      │       │
│   │  • Room/Namespace 기능이 여러 서버에서 동작                      │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   4️⃣  매칭 큐 안정성                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • 원자적 큐 연산 (LPUSH/LPOP)                                   │       │
│   │  • 중복 매칭 방지 (Set 자료구조)                                 │       │
│   │  • 매칭 대기 상태 영속 저장                                      │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   5️⃣  캐싱 및 성능 최적화                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • 자주 조회되는 데이터 캐싱 (문제, 카테고리)                    │       │
│   │  • DB 부하 감소                                                  │       │
│   │  • 응답 시간 단축                                                │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   예상 비용: NCP Cloud DB for Redis ~5-10만원/월                             │
│   또는: Self-managed Redis (WAS와 동일 서버) - 추가 비용 없음               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 현재 구현 분석

### Socket.IO 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        현재 Socket.IO 구조                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Frontend (React)                                                          │
│   └── Socket.IO Client                                                      │
│       ├── connect to /ws                                                    │
│       └── auth: { token: JWT }                                              │
│                                                                              │
│   Backend (NestJS)                                                          │
│   └── @WebSocketGateway({ namespace: '/ws' })                               │
│       │                                                                      │
│       ├── MatchmakingGateway                                                │
│       │   ├── match:enqueue   (매칭 대기열 입장)                             │
│       │   ├── match:dequeue   (매칭 대기열 퇴장)                             │
│       │   └── match:found     (매치 성사 알림)                               │
│       │                                                                      │
│       └── GameGateway                                                       │
│           ├── submit:answer          (답변 제출)                             │
│           ├── opponent:submitted     (상대 제출 알림)                        │
│           ├── opponent:disconnected  (상대 연결 해제)                        │
│           └── match:end             (매치 종료)                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 현재 세션 관리 (In-Memory)

```typescript
// 현재 구현 - 단일 서버에서 정상 동작
@Injectable()
export class GameSessionManager {
  // 서버 메모리에 저장
  private userSocketMap = new Map<string, string>();
  private roomSessions = new Map<string, GameSession>();
  private submittedAnswers = new Map<string, SubmittedAnswer>();
}

// 매칭 큐도 In-Memory
export class InMemoryMatchQueue {
  private queue: string[] = []; // 단일 서버 배열
}
```

### 현재 구현의 특징

| 항목 | 설명 | 현재 단계 영향 |
|------|------|---------------|
| 단일 서버 한정 | 수평 확장 불가 | ✅ 현재는 문제없음 |
| 서버 재시작 시 데이터 소실 | 진행 중인 게임 중단 | ⚠️ 허용 가능 |
| 메모리 제한 | 동시 게임 수 제한 | ✅ 예상 규모에서 충분 |

---

## 현재 단계 권장 구성 (비용 최적화)

### 단일 WAS + In-Memory

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    현재 권장 구성 (Redis 없이)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Client                                                                    │
│     │                                                                        │
│     │ WebSocket (Socket.IO)                                                 │
│     │                                                                        │
│     ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                      WAS 서버 (단일)                         │           │
│   │                                                              │           │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │           │
│   │   │  Socket.IO    │  │ In-Memory     │  │ In-Memory     │   │           │
│   │   │  Gateway      │  │ Match Queue   │  │ Game Session  │   │           │
│   │   │               │  │               │  │               │   │           │
│   │   │  • 연결 관리   │  │  • FIFO 큐    │  │  • 방 정보    │   │           │
│   │   │  • 이벤트 처리 │  │  • 매칭 로직  │  │  • 답변 상태  │   │           │
│   │   └───────────────┘  └───────────────┘  └───────────────┘   │           │
│   │                                                              │           │
│   │   서버 스펙: 2vCPU, 4GB RAM                                  │           │
│   │   예상 동시 접속: ~100명                                     │           │
│   │                                                              │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                              │                                               │
│                              │ Private Network                               │
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                      DB 서버                                 │           │
│   │                   PostgreSQL 18                              │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│   총 비용: WAS + DB 서버 비용만 (Redis 추가 비용 없음)                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Self-managed Redis 옵션 (선택적)

Redis가 필요하지만 비용을 최소화하고 싶다면, WAS 서버에 Redis를 함께 설치할 수 있습니다.

```yaml
# docker-compose.yml (WAS 서버)
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - REDIS_URL=redis://localhost:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    container_name: csarena-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    # 메모리 제한 (서버 리소스 보호)
    deploy:
      resources:
        limits:
          memory: 512M

volumes:
  redis_data:
```

**주의**: 이 구성은 WAS 다중화를 지원하지 않습니다. 단일 서버에서의 세션 영속성만 제공합니다.

---

## 미래 확장: Redis 기반 분산 아키텍처

> 아래 내용은 WAS 다중화가 필요할 때 적용합니다.

### Redis 기반 세션 공유

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Redis 기반 분산 세션 아키텍처                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Clients                                                                   │
│     │                                                                        │
│     ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                      Load Balancer                               │       │
│   │                  (Sticky Session: Source IP)                     │       │
│   └──────────────────────────┬──────────────────────────────────────┘       │
│                              │                                               │
│            ┌─────────────────┼─────────────────┐                            │
│            │                 │                 │                            │
│            ▼                 ▼                 ▼                            │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐              │
│   │   Backend #1    │ │   Backend #2    │ │   Backend #3    │              │
│   │                 │ │                 │ │                 │              │
│   │  Socket.IO      │ │  Socket.IO      │ │  Socket.IO      │              │
│   │  with Redis     │ │  with Redis     │ │  with Redis     │              │
│   │  Adapter        │ │  Adapter        │ │  Adapter        │              │
│   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘              │
│            │                   │                   │                        │
│            └───────────────────┼───────────────────┘                        │
│                                │                                             │
│                                ▼                                             │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                          Redis                                   │       │
│   │                                                                   │       │
│   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │       │
│   │  │   Pub/Sub     │  │   Sessions    │  │  Match Queue  │        │       │
│   │  │   Channel     │  │   (Hash)      │  │   (List)      │        │       │
│   │  │               │  │               │  │               │        │       │
│   │  │ socket.io-*   │  │ game:{roomId} │  │ match:queue   │        │       │
│   │  └───────────────┘  └───────────────┘  └───────────────┘        │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Socket.IO Redis Adapter 구성

#### 설치

```bash
pnpm add @socket.io/redis-adapter redis
```

#### NestJS 설정

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redis가 설정된 경우에만 Adapter 사용
  if (process.env.REDIS_URL) {
    const pubClient = createClient({
      url: process.env.REDIS_URL,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Redis Adapter 설정
    const redisIoAdapter = new (class extends IoAdapter {
      createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, options);
        server.adapter(createAdapter(pubClient, subClient));
        return server;
      }
    })(app);

    app.useWebSocketAdapter(redisIoAdapter);
  }

  await app.listen(4000);
}
bootstrap();
```

#### Redis Adapter 동작 원리

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Redis Pub/Sub 메시지 전파                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Server #1                     Redis                      Server #2        │
│   (Player A)                                               (Player B)       │
│                                                                              │
│   io.to('room1')                                                            │
│   .emit('event', data)                                                      │
│        │                                                                     │
│        ├─── 1. 로컬 클라이언트에 전송                                        │
│        │                                                                     │
│        └─── 2. Redis에 Publish ───▶  ┌─────────────────┐                    │
│                                       │  Channel:        │                    │
│                                       │  socket.io#room1 │                    │
│                                       │                  │                    │
│                                       │  Message:        │                    │
│                                       │  { event, data } │                    │
│                                       └────────┬─────────┘                    │
│                                                │                              │
│                          3. Subscribe 수신 ◀───┘                              │
│                                                │                              │
│                                                ▼                              │
│                                       로컬 room1 클라이언트에 전송            │
│                                                │                              │
│                                                ▼                              │
│                                          Player B 수신                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 세션 및 상태 관리 (Redis 사용 시)

### Redis 데이터 구조 설계

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Redis 데이터 모델                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 사용자-소켓 매핑 (Hash)                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Key: user:socket:{userId}                                       │       │
│   │  Fields:                                                         │       │
│   │    socketId: "abc123"                                           │       │
│   │    serverId: "server-1"                                         │       │
│   │    connectedAt: 1705712400                                      │       │
│   │  TTL: 1 hour (연결 해제 시 삭제)                                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   2. 게임 세션 (Hash)                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Key: game:session:{roomId}                                      │       │
│   │  Fields:                                                         │       │
│   │    player1Id: "user123"                                         │       │
│   │    player2Id: "user456"                                         │       │
│   │    currentRound: 3                                              │       │
│   │    status: "playing" | "grading" | "finished"                   │       │
│   │    createdAt: 1705712400                                        │       │
│   │  TTL: 2 hours                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   3. 라운드 상태 (Hash)                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Key: game:round:{roomId}:{roundNum}                             │       │
│   │  Fields:                                                         │       │
│   │    questionId: 42                                               │       │
│   │    player1Submitted: true                                       │       │
│   │    player2Submitted: false                                      │       │
│   │    player1Answer: "TCP는..."                                    │       │
│   │    startedAt: 1705712400                                        │       │
│   │  TTL: 30 minutes                                                │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   4. 매칭 큐 (List)                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Key: match:queue                                                │       │
│   │  Type: List (FIFO)                                              │       │
│   │  Elements: ["user123", "user456", "user789"]                    │       │
│   │                                                                  │       │
│   │  Operations:                                                     │       │
│   │    RPUSH match:queue {userId}  // 큐 입장                       │       │
│   │    LPOP match:queue            // 큐에서 꺼내기                  │       │
│   │    LREM match:queue 1 {userId} // 특정 유저 제거                │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   5. 중복 접속 방지 (Set)                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Key: match:queue:users                                          │       │
│   │  Type: Set                                                       │       │
│   │  Members: {"user123", "user456"}                                │       │
│   │                                                                  │       │
│   │  Operations:                                                     │       │
│   │    SADD match:queue:users {userId}   // 중복 체크 및 추가       │       │
│   │    SREM match:queue:users {userId}   // 제거                     │       │
│   │    SISMEMBER match:queue:users {userId}  // 존재 확인           │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Redis 기반 매칭 큐 구현

```typescript
// redis-match-queue.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedisMatchQueue {
  private readonly QUEUE_KEY = 'match:queue';
  private readonly USERS_SET_KEY = 'match:queue:users';

  constructor(private readonly redis: Redis) {}

  async add(userId: string): Promise<Match | null> {
    // 중복 체크
    const exists = await this.redis.sismember(this.USERS_SET_KEY, userId);
    if (exists) {
      return null;
    }

    // 트랜잭션으로 원자적 처리
    const multi = this.redis.multi();
    multi.sadd(this.USERS_SET_KEY, userId);
    multi.rpush(this.QUEUE_KEY, userId);
    multi.llen(this.QUEUE_KEY);
    const results = await multi.exec();

    const queueLength = results[2][1] as number;

    // 2명 이상이면 매칭
    if (queueLength >= 2) {
      const [player1, player2] = await this.redis
        .multi()
        .lpop(this.QUEUE_KEY)
        .lpop(this.QUEUE_KEY)
        .exec();

      await this.redis.srem(
        this.USERS_SET_KEY,
        player1[1] as string,
        player2[1] as string,
      );

      return {
        player1: player1[1] as string,
        player2: player2[1] as string,
        roomId: uuidv4(),
      };
    }

    return null;
  }

  async remove(userId: string): Promise<void> {
    await this.redis
      .multi()
      .lrem(this.QUEUE_KEY, 1, userId)
      .srem(this.USERS_SET_KEY, userId)
      .exec();
  }

  async getQueueSize(): Promise<number> {
    return this.redis.llen(this.QUEUE_KEY);
  }
}
```

### Redis 기반 게임 세션 관리

```typescript
// redis-game-session.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

interface GameSession {
  player1Id: string;
  player2Id: string;
  currentRound: number;
  status: 'playing' | 'grading' | 'finished';
}

@Injectable()
export class RedisGameSessionManager {
  private readonly SESSION_TTL = 7200; // 2 hours

  constructor(private readonly redis: Redis) {}

  async createSession(
    roomId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<void> {
    const session: GameSession = {
      player1Id,
      player2Id,
      currentRound: 1,
      status: 'playing',
    };

    await this.redis.hset(
      `game:session:${roomId}`,
      ...Object.entries(session).flat(),
    );
    await this.redis.expire(`game:session:${roomId}`, this.SESSION_TTL);
  }

  async getSession(roomId: string): Promise<GameSession | null> {
    const data = await this.redis.hgetall(`game:session:${roomId}`);
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    return {
      ...data,
      currentRound: parseInt(data.currentRound),
    } as GameSession;
  }

  async updateRound(roomId: string, roundNum: number): Promise<void> {
    await this.redis.hset(`game:session:${roomId}`, 'currentRound', roundNum);
  }

  async deleteSession(roomId: string): Promise<void> {
    const roundKeys = await this.redis.keys(`game:round:${roomId}:*`);
    if (roundKeys.length > 0) {
      await this.redis.del(...roundKeys);
    }
    await this.redis.del(`game:session:${roomId}`);
  }
}
```

---

## Load Balancer 설정 (WAS 다중화 시)

### WebSocket을 위한 LB 설정

> **NCP Load Balancer는 WebSocket을 지원합니다.**
> Connection Idle Timeout: 60~3600초 설정 가능

```yaml
# NCP Load Balancer 설정 예시
load_balancer:
  name: cs-arena-lb
  type: network_proxy  # WebSocket 지원

  listener:
    - name: https
      protocol: HTTPS
      port: 443
      ssl_certificate: {cert_no}
      target_group: backend-tg

  target_group:
    name: backend-tg
    protocol: HTTP
    port: 4000

    # WebSocket 연결 유지 (중요!)
    connection_idle_timeout: 3600  # 1시간

    # Sticky Session (WAS 다중화 시 필수)
    sticky_session:
      enabled: true
      type: SOURCE_IP

    # Health Check
    health_check:
      protocol: HTTP
      path: /api/health
      port: 4000
      interval: 30
      threshold: 3
```

### Sticky Session 동작

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Sticky Session 동작                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   첫 번째 연결                                                               │
│   Client ─────▶ LB ─────▶ Server #1                                         │
│            hash(IP)       │                                                  │
│                           └── 세션 생성                                      │
│                                                                              │
│   두 번째 연결 (같은 클라이언트)                                             │
│   Client ─────▶ LB ─────▶ Server #1 (동일 서버)                              │
│            hash(IP)       │                                                  │
│                           └── 기존 세션 유지                                 │
│                                                                              │
│   ⚠️  주의: 같은 IP에서 여러 사용자가 접속하면 같은 서버로 라우팅됨          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 장애 대응

### 클라이언트 재연결 전략

```typescript
// Frontend Socket.IO 재연결 설정
const socket = io(BACKEND_URL, {
  // 자동 재연결
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  // 연결 타임아웃
  timeout: 20000,

  // 인증
  auth: {
    token: getJwtToken(),
  },
});

// 재연결 이벤트 처리
socket.on('connect', () => {
  console.log('Connected to server');

  // 진행 중인 게임이 있었다면 상태 복구 요청
  if (currentGameRoomId) {
    socket.emit('game:restore', { roomId: currentGameRoomId });
  }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // 서버가 강제로 연결을 끊음 → 수동 재연결
    socket.connect();
  }
  // 다른 이유는 자동 재연결 시도
});

socket.on('reconnect_failed', () => {
  // 모든 재연결 시도 실패
  showErrorMessage('서버에 연결할 수 없습니다. 페이지를 새로고침해주세요.');
});
```

### 서버 장애 시나리오

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           장애 복구 시나리오                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   단일 WAS 구성 (현재)                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  WAS 장애 시:                                                    │       │
│   │  • 모든 WebSocket 연결 끊김                                      │       │
│   │  • 진행 중인 게임 세션 손실                                      │       │
│   │  • 서버 재시작 후 클라이언트 재연결                              │       │
│   │                                                                  │       │
│   │  복구 절차:                                                      │       │
│   │  1. 서버 상태 확인 (docker ps, logs)                            │       │
│   │  2. 필요 시 서버 재시작                                          │       │
│   │  3. 클라이언트 자동 재연결 대기                                  │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Redis 도입 후 (미래)                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  WAS #1 장애 시:                                                 │       │
│   │  • 해당 서버 연결만 끊김                                         │       │
│   │  • LB가 WAS #2로 자동 라우팅                                     │       │
│   │  • Redis에서 세션 상태 복구                                      │       │
│   │  • 게임 진행 가능                                                │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 모니터링

### WebSocket 메트릭

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         모니터링 메트릭                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   실시간 모니터링 대상:                                                      │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Connection Metrics                                              │       │
│   │  • active_connections: 현재 WebSocket 연결 수                    │       │
│   │  • connections_per_second: 초당 새 연결 수                       │       │
│   │  • disconnections_per_second: 초당 연결 해제 수                  │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Game Metrics                                                    │       │
│   │  • active_games: 진행 중인 게임 수                               │       │
│   │  • queue_size: 매칭 대기열 크기                                  │       │
│   │  • average_match_time: 평균 매칭 대기 시간                       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   알람 설정 (단일 서버):                                                     │
│   • active_connections > 100 → 확장 고려 알림                               │
│   • queue_size > 50 → 매칭 지연 경고                                        │
│   • 서버 CPU > 80% → 리소스 부족 경고                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 권장 구성 요약

### 현재 단계: 비용 최적화 (Redis 미사용)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      현재 권장 구성                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                 단일 WAS + In-Memory                             │       │
│   │                                                                  │       │
│   │  • Socket.IO (In-Memory)                                        │       │
│   │  • In-Memory 매칭 큐                                            │       │
│   │  • In-Memory 세션 관리                                          │       │
│   │                                                                  │       │
│   │  적합: ~100 동시 접속                                           │       │
│   │  Redis 추가 비용: 0원                                           │       │
│   │                                                                  │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   언제 Redis 도입?                                                          │
│   • 동시 접속 100명 초과                                                    │
│   • WAS 서버 2대 이상 필요                                                  │
│   • 무중단 배포 필요                                                        │
│   • 세션 영속성 필요                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 미래 단계별 확장 경로

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           확장 로드맵                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Stage 1: 현재 (비용 최적화)                                                │
│   ┌─────────────────────────────────────────┐                               │
│   │  • 단일 WAS + In-Memory                  │                               │
│   │  • 동시 접속: ~100명                     │                               │
│   │  • 추가 비용: 0원                        │                               │
│   └─────────────────────────────────────────┘                               │
│                    │                                                         │
│                    │ 트래픽 증가                                             │
│                    ▼                                                         │
│   Stage 2: Redis 도입                                                        │
│   ┌─────────────────────────────────────────┐                               │
│   │  • 단일/다중 WAS + Redis                 │                               │
│   │  • Redis Adapter 적용                    │                               │
│   │  • 동시 접속: ~500명                     │                               │
│   │  • 추가 비용: +5-10만원/월               │                               │
│   └─────────────────────────────────────────┘                               │
│                    │                                                         │
│                    │ 대규모 트래픽                                           │
│                    ▼                                                         │
│   Stage 3: Redis Cluster + LB                                                │
│   ┌─────────────────────────────────────────┐                               │
│   │  • WAS 3대+ Load Balancer               │                               │
│   │  • Redis Cluster (HA)                   │                               │
│   │  • 동시 접속: 1000명+                   │                               │
│   │  • 추가 비용: +20-30만원/월              │                               │
│   └─────────────────────────────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 참고 자료

- [Socket.IO Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Scaling Socket.IO - Ably](https://ably.com/topic/scaling-socketio)
- [NCP Cloud DB for Redis](https://guide.ncloud-docs.com/docs/clouddbforredis-start)
- [Redis Pub/Sub](https://redis.io/docs/interact/pubsub/)
