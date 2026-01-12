# match 디렉토리 정리 계획

## 📋 개요

match 도메인이 matchmaking과 game으로 성공적으로 분리되었습니다. 이제 기존 match 디렉토리에 남아있는 불필요한 파일들을 정리하여 코드베이스를 깔끔하게 유지합니다.

**정리 목적:**
- 중복된 코드 제거 (match.service.ts ↔ game.service.ts)
- 사용되지 않는 파일 제거 (match.module.ts, match.gateway.ts 등)
- 공통 엔티티는 유지 (match/entity/)
- 코드베이스 명확성 향상

## 🔍 현재 상태 분석

### 현재 디렉토리 구조

```
/packages/backend/src/match/
├── entity/                          ✅ 유지 필요 (공통 DB 엔티티)
│   ├── match.entity.ts              → game.module.ts에서 사용 중
│   ├── round.entity.ts              → game.module.ts에서 사용 중
│   ├── round-answer.entity.ts       → game.module.ts에서 사용 중
│   └── index.ts                     → 엔티티 export
│
├── interfaces/                      ⚠️ 부분 정리 필요
│   ├── match.interfaces.ts          ❌ 삭제 (game/interfaces/로 이동됨)
│   ├── match-queue.interface.ts     ❌ 삭제 (matchmaking/interfaces/로 이동됨)
│   └── user.interface.ts            ❌ 삭제 (game/interfaces/로 이동됨)
│
├── queues/                          ❌ 삭제 (matchmaking/queue/로 이동됨)
│   ├── in-memory-queue.ts
│   └── queue.session.ts
│
├── match.module.ts                  ❌ 삭제 (app.module.ts에서 import 안 함)
├── match.service.ts                 ❌ 삭제 (game.service.ts로 대체)
├── match.gateway.ts                 ❌ 삭제 (game.gateway.ts로 대체)
└── match-session-manager.ts         ❌ 삭제 (game-session-manager.ts로 대체)
```

### 모듈 의존성 현황

**현재 활성화된 모듈:**
```
AppModule
├── GameModule (game/game.module.ts) ✅
│   ├── imports: [MatchmakingModule, QuizModule, TypeOrmModule.forFeature([Match, Round, RoundAnswer])]
│   └── providers: [GameGateway, GameService, GameSessionManager, RoundProgressionService, RoundTimer]
│
├── MatchmakingModule (matchmaking/matchmaking.module.ts) ✅
│   └── providers: [MatchmakingService, InMemoryMatchQueue]
│
├── QuizModule ✅
└── FeedbackModule ✅

MatchModule (match/match.module.ts) ❌ NOT IMPORTED - 사용되지 않음
```

**Entity 사용 현황:**
- `match/entity/match.entity.ts` → `game.module.ts`에서 `TypeOrmModule.forFeature([Match, ...])`로 import
- `match/entity/round.entity.ts` → `game.module.ts`에서 `TypeOrmModule.forFeature([..., Round, ...])`로 import
- `match/entity/round-answer.entity.ts` → `game.module.ts`에서 `TypeOrmModule.forFeature([..., RoundAnswer])`로 import

## 📦 삭제 대상 파일 목록

### 1. 서비스/게이트웨이 파일 (이미 game/으로 이동됨)

| 파일 | 삭제 사유 | 대체 파일 |
|------|----------|---------|
| **match.service.ts** | 게임 로직이 game.service.ts로 이동 완료 | `game/game.service.ts` |
| **match.gateway.ts** | WebSocket 이벤트 처리가 game.gateway.ts로 이동 완료 | `game/game.gateway.ts` |
| **match-session-manager.ts** | 세션 관리가 game-session-manager.ts로 이동 완료 | `game/game-session-manager.ts` |
| **match.module.ts** | app.module.ts에서 import되지 않음, GameModule로 대체됨 | `game/game.module.ts` |

### 2. 인터페이스 파일 (이미 game/ 또는 matchmaking/으로 이동됨)

| 파일 | 삭제 사유 | 대체 파일 |
|------|----------|---------|
| **interfaces/match.interfaces.ts** | GameSession, RoundData 등이 game/interfaces/로 이동 | `game/interfaces/game.interfaces.ts` |
| **interfaces/user.interface.ts** | UserInfo가 game/interfaces/로 이동 | `game/interfaces/user.interface.ts` |
| **interfaces/match-queue.interface.ts** | Match, IMatchQueue가 matchmaking/interfaces/로 이동 | `matchmaking/interfaces/matchmaking.interface.ts` |

### 3. 큐 구현 파일 (이미 matchmaking/으로 이동됨)

| 파일 | 삭제 사유 | 대체 파일 |
|------|----------|---------|
| **queues/in-memory-queue.ts** | matchmaking/queue/로 이동 완료 | `matchmaking/queue/in-memory-queue.ts` |
| **queues/queue.session.ts** | matchmaking/queue/로 이동 완료 | `matchmaking/queue/queue.session.ts` |

## ✅ 유지 대상 파일 목록

### entity 디렉토리 (공통 DB 엔티티 - 절대 삭제 금지)

| 파일 | 유지 사유 | 사용처 |
|------|----------|--------|
| **entity/match.entity.ts** | DB matches 테이블 매핑, game.module.ts에서 필수 | `game/game.module.ts`, `game/game.service.ts` |
| **entity/round.entity.ts** | DB rounds 테이블 매핑, game.module.ts에서 필수 | `game/game.module.ts`, `game/game.service.ts` |
| **entity/round-answer.entity.ts** | DB round_answers 테이블 매핑, game.module.ts에서 필수 | `game/game.module.ts`, `game/game.service.ts` |
| **entity/index.ts** | 엔티티 export barrel file | 여러 곳에서 import |

**중요:** entity 파일들은 TypeORM 데이터베이스 스키마 정의이며, `game/game.module.ts`에서 다음과 같이 사용 중입니다:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Round, RoundAnswer]),  // ← match/entity/에서 import
    // ...
  ],
  // ...
})
export class GameModule {}
```

## 🗂️ 정리 후 최종 구조

```
/packages/backend/src/match/
└── entity/                          ✅ 유지됨
    ├── match.entity.ts
    ├── round.entity.ts
    ├── round-answer.entity.ts
    └── index.ts
```

**모든 다른 파일/디렉토리는 삭제됩니다:**
- ❌ `interfaces/` 디렉토리 전체
- ❌ `queues/` 디렉토리 전체
- ❌ `match.module.ts`
- ❌ `match.service.ts`
- ❌ `match.gateway.ts`
- ❌ `match-session-manager.ts`

## 📝 정리 순서

### Step 1: 테스트 파일 확인
정리 전에 테스트가 구 파일들을 참조하는지 확인합니다.

**확인 대상:**
- `test/match.service.spec.ts` → 이미 `game.service.ts`를 테스트하도록 업데이트됨 ✅
- `test/game-session-manager.spec.ts` → 이미 `game-session-manager.ts`를 테스트하도록 업데이트됨 ✅
- `test/match.e2e-spec.ts` → 확인 필요

### Step 2: Import 참조 확인
다른 파일에서 match 디렉토리의 삭제 대상 파일을 import하는지 확인합니다.

**확인 방법:**
```bash
grep -r "from.*match/" packages/backend/src --exclude-dir=match
```

**예상 결과:**
- entity 파일만 import되어야 함
- 다른 파일들은 import되면 안 됨

### Step 3: 파일 삭제 실행

**삭제 명령:**
```bash
cd /packages/backend/src/match

# 1. 서비스/게이트웨이 파일 삭제
rm match.module.ts
rm match.service.ts
rm match.gateway.ts
rm match-session-manager.ts

# 2. 인터페이스 디렉토리 전체 삭제
rm -rf interfaces/

# 3. 큐 디렉토리 전체 삭제
rm -rf queues/
```

### Step 4: 검증

**1. 빌드 확인:**
```bash
npm run build
```
→ 컴파일 에러가 없어야 함

**2. 테스트 확인:**
```bash
npm test
```
→ 모든 테스트가 통과해야 함

**3. 파일 구조 확인:**
```bash
ls -la /packages/backend/src/match
```
→ entity 디렉토리만 남아있어야 함

**4. Import 확인:**
```bash
grep -r "match.service" packages/backend/src
grep -r "match.gateway" packages/backend/src
grep -r "match-session-manager" packages/backend/src
```
→ 아무 결과도 나오지 않아야 함 (entity import만 허용)

## ⚠️ 주의사항

### 절대 삭제하면 안 되는 것
- ❌ `match/entity/` 디렉토리
- ❌ `match/entity/match.entity.ts`
- ❌ `match/entity/round.entity.ts`
- ❌ `match/entity/round-answer.entity.ts`
- ❌ `match/entity/index.ts`

**이유:** 이 파일들은 데이터베이스 스키마를 정의하며, `game/game.module.ts`에서 TypeORM으로 필수적으로 사용됩니다. 삭제 시 애플리케이션이 작동하지 않습니다.

### 삭제해도 안전한 이유
1. **match.service.ts**: 모든 기능이 `game.service.ts` 또는 `matchmaking.service.ts`로 이동됨
2. **match.gateway.ts**: 모든 WebSocket 이벤트가 `game.gateway.ts`로 이동됨
3. **match-session-manager.ts**: 모든 세션 관리 로직이 `game-session-manager.ts`로 이동됨
4. **match.module.ts**: `app.module.ts`에서 import되지 않음 (GameModule로 대체됨)
5. **interfaces/**: 모든 인터페이스가 `game/interfaces/` 또는 `matchmaking/interfaces/`로 이동됨
6. **queues/**: 모든 큐 로직이 `matchmaking/queue/`로 이동됨

### 검증 체크리스트
- [ ] `npm run build` 성공
- [ ] `npm test` 모든 테스트 통과
- [ ] match 디렉토리에 entity만 남아있음
- [ ] 다른 파일에서 삭제된 파일을 import하지 않음
- [ ] game/game.module.ts가 entity를 정상적으로 import함
- [ ] 애플리케이션 정상 실행

## 📊 정리 전후 비교

### Before (정리 전)
```
/packages/backend/src/
├── match/
│   ├── entity/          (4 files) ✅ 필수
│   ├── interfaces/      (3 files) ❌ 중복
│   ├── queues/          (2 files) ❌ 중복
│   ├── match.module.ts          ❌ 미사용
│   ├── match.service.ts         ❌ 중복
│   ├── match.gateway.ts         ❌ 중복
│   └── match-session-manager.ts ❌ 중복
├── matchmaking/         ✅ 활성
└── game/                ✅ 활성
```

### After (정리 후)
```
/packages/backend/src/
├── match/
│   └── entity/          (4 files) ✅ 공통 엔티티
├── matchmaking/         ✅ 매칭 로직
└── game/                ✅ 게임 로직
```

**결과:**
- 12개 파일 → 4개 파일로 감소
- 중복 코드 제거
- 명확한 도메인 분리 유지
- entity는 공통 모듈로 계속 사용

## 🔑 핵심 파일 정리

### 삭제할 파일 (총 8개 파일 + 2개 디렉토리)
1. `/packages/backend/src/match/match.module.ts`
2. `/packages/backend/src/match/match.service.ts`
3. `/packages/backend/src/match/match.gateway.ts`
4. `/packages/backend/src/match/match-session-manager.ts`
5. `/packages/backend/src/match/interfaces/` (디렉토리 전체)
   - match.interfaces.ts
   - match-queue.interface.ts
   - user.interface.ts
6. `/packages/backend/src/match/queues/` (디렉토리 전체)
   - in-memory-queue.ts
   - queue.session.ts

### 유지할 파일 (총 4개 파일)
1. `/packages/backend/src/match/entity/match.entity.ts` ✅
2. `/packages/backend/src/match/entity/round.entity.ts` ✅
3. `/packages/backend/src/match/entity/round-answer.entity.ts` ✅
4. `/packages/backend/src/match/entity/index.ts` ✅

## 🎯 요약

**삭제 대상:** match 디렉토리의 모든 파일 **EXCEPT** entity 디렉토리

**삭제 이유:**
- 기능이 matchmaking과 game으로 완전히 이동됨
- 중복 코드 제거
- match.module.ts는 app.module.ts에서 import되지 않음

**유지 이유:**
- entity 디렉토리는 공통 DB 스키마
- game.module.ts에서 TypeORM으로 필수 사용

**안전성:**
- 모든 기능이 이미 새 도메인으로 이동됨
- 테스트도 새 파일들을 사용하도록 업데이트됨
- 빌드 및 테스트로 검증 가능
