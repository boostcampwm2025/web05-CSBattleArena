# 3. 데이터베이스 아키텍처

> Self-managed PostgreSQL 18, pgvector, 그리고 복제/백업 전략에 대한 상세 가이드

## 인프라 선택: Self-managed vs Cloud DB

### 비교 분석

| 구분 | NCP Cloud DB | Self-managed (선택) |
|------|-------------|---------------------|
| **월 비용** | ~10만원+ | ~3만원 (서버 비용에 포함) |
| **관리 부담** | 낮음 (자동화) | 중간 (직접 관리) |
| **자동 백업** | 기본 제공 | 스크립트 구성 필요 |
| **자동 장애조치** | HA 구성 시 지원 | 직접 구성 필요 |
| **스케일 업/다운** | 콘솔에서 클릭 | 서버 재구성 필요 |
| **커스터마이징** | 제한적 | 자유로움 |

### Self-managed 선택 이유

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Self-managed PostgreSQL 선택 배경                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   💰 비용 최적화 (핵심 이유)                                                  │
│   ┌────────────────────────────────────────────────────────────────┐        │
│   │  NCP Cloud DB: 최소 ~10만원/월                                  │        │
│   │  Self-managed: 서버 비용에 포함 (추가 비용 0원)                 │        │
│   │  절감액: 월 ~10만원 (연 ~120만원)                               │        │
│   └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│   📊 프로젝트 규모                                                           │
│   ┌────────────────────────────────────────────────────────────────┐        │
│   │  • 예상 동시 사용자: 수십~수백 명                                │        │
│   │  • 예상 데이터 크기: 수 GB 이하                                  │        │
│   │  • 예상 TPS: 100 미만                                            │        │
│   │  → Cloud DB의 고가용성이 반드시 필요한 규모가 아님              │        │
│   └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│   🎓 교육/학습 가치                                                          │
│   ┌────────────────────────────────────────────────────────────────┐        │
│   │  • DB 운영 경험 습득                                             │        │
│   │  • 백업/복구 실습                                                │        │
│   │  • 성능 튜닝 학습                                                │        │
│   └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 현재 데이터베이스 구조

### 엔티티 관계도 (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Entity Relationships                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐     1:1     ┌──────────────────┐                          │
│   │    users    │────────────▶│ user_statistics  │                          │
│   │             │             │                  │                          │
│   │ • id (PK)   │             │ • win_count      │                          │
│   │ • email     │             │ • lose_count     │                          │
│   │ • nickname  │             │ • tier_point     │                          │
│   │ • oauth_*   │             │ • exp_point      │                          │
│   └──────┬──────┘             └──────────────────┘                          │
│          │                                                                   │
│          │ 1:N                                                               │
│          ▼                                                                   │
│   ┌─────────────┐     1:N     ┌─────────────┐     N:1     ┌─────────────┐   │
│   │   matches   │────────────▶│   rounds    │────────────▶│  questions  │   │
│   │             │             │             │             │             │   │
│   │ • player1   │             │ • round_no  │             │ • content   │   │
│   │ • player2   │             │ • match_id  │             │ • type      │   │
│   │ • winner    │             │ • question  │             │ • answer    │   │
│   │ • type      │             └──────┬──────┘             │ • difficulty│   │
│   └─────────────┘                    │                    └──────┬──────┘   │
│                                      │ 1:N                       │          │
│                                      ▼                           │ N:M      │
│                           ┌───────────────────┐                  ▼          │
│                           │  round_answers    │         ┌───────────────┐   │
│                           │                   │         │  categories   │   │
│                           │ • user_answer     │         │               │   │
│                           │ • score           │         │ • name        │   │
│                           │ • ai_feedback     │         │ • parent_id   │   │
│                           │ • grading_*       │         │ (자기참조)     │   │
│                           └───────────────────┘         └───────────────┘   │
│                                                                              │
│   ┌─────────────┐         ┌───────────────────┐                             │
│   │    tiers    │         │ user_problem_banks│                             │
│   │             │         │                   │                             │
│   │ • name      │         │ • is_bookmarked   │                             │
│   │ • min/max   │         │ • user_answer     │                             │
│   │ • icon_url  │         │ • ai_feedback     │                             │
│   └─────────────┘         └───────────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 데이터 특성 분석

| 테이블 | 읽기 빈도 | 쓰기 빈도 | 데이터 크기 | 특성 |
|--------|----------|----------|-------------|------|
| users | 높음 | 낮음 | 작음 | 인증 시 조회 |
| user_statistics | 높음 | 중간 | 작음 | 게임 후 업데이트 |
| questions | 매우 높음 | 낮음 | 중간 | 캐싱 후보 |
| categories | 높음 | 매우 낮음 | 작음 | 캐싱 후보 |
| matches | 중간 | 높음 | 큼 (시간에 따라 증가) | 아카이빙 후보 |
| rounds | 중간 | 높음 | 큼 | 아카이빙 후보 |
| round_answers | 낮음 | 높음 | 큼 | AI 피드백 포함 |

---

## Self-managed PostgreSQL 구성

### Docker 기반 PostgreSQL 배포

```yaml
# docker-compose.yml (DB 서버)
version: '3.8'

services:
  postgres:
    image: postgres:18.1
    container_name: csarena-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    # 성능 최적화 설정
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=512MB
      -c maintenance_work_mem=128MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c max_connections=100

volumes:
  postgres_data:
```

### 초기화 스크립트

```sql
-- init.sql
-- 필요한 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 텍스트 검색 성능

-- pgvector 설치 (필요 시)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 연결 로깅 설정 (모니터링용)
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_statement = 'ddl';
```

### DB 서버 접근 방식

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DB 서버 접근 아키텍처                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   인터넷                                                                     │
│      │                                                                       │
│      │ (PostgreSQL 포트는 외부 차단)                                         │
│      │                                                                       │
│      ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐           │
│   │                        WAS 서버                              │           │
│   │                                                              │           │
│   │   ┌─────────────────┐     Private Network     ┌───────────┐ │           │
│   │   │   Application   │ ─────────────────────▶ │    DB     │ │           │
│   │   │    (NestJS)     │        5432            │  Server   │ │           │
│   │   └─────────────────┘                        └───────────┘ │           │
│   │                                                              │           │
│   └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│   접근 방법:                                                                 │
│                                                                              │
│   1. WAS 서버 경유 (권장)                                                    │
│      ┌─────────────────────────────────────────────────────────┐            │
│      │  ssh -i key.pem user@was-server                         │            │
│      │  psql -h db-server-private-ip -U dbuser -d csarena      │            │
│      └─────────────────────────────────────────────────────────┘            │
│                                                                              │
│   2. SSH 터널링                                                              │
│      ┌─────────────────────────────────────────────────────────┐            │
│      │  # 로컬에서 터널 생성                                     │            │
│      │  ssh -L 5432:db-private-ip:5432 user@was-server         │            │
│      │                                                          │            │
│      │  # 다른 터미널에서 접속                                   │            │
│      │  psql -h localhost -U dbuser -d csarena                  │            │
│      └─────────────────────────────────────────────────────────┘            │
│                                                                              │
│   3. Bastion Host (선택적, 보안 강화 시)                                     │
│      ┌─────────────────────────────────────────────────────────┐            │
│      │  인터넷 → Bastion → DB 서버                               │            │
│      │  (별도 서버 비용 발생, 현재 단계에서는 불필요)            │            │
│      └─────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 백업 및 복구 전략 (Self-managed)

### 자동 백업 스크립트

```bash
#!/bin/bash
# backup.sh - 매일 실행되는 백업 스크립트

# 설정
BACKUP_DIR="/backups"
DB_NAME="csarena"
DB_USER="csarena"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# 백업 실행 (Docker 컨테이너 내부에서)
docker exec csarena-postgres pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_FILE}

# 백업 성공 확인
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: ${BACKUP_FILE}"

    # 오래된 백업 삭제
    find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    echo "[$(date)] Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
else
    echo "[$(date)] Backup failed!" >&2
    # 알림 전송 (선택적)
    # curl -X POST -d "Backup failed" https://your-webhook-url
fi
```

### Cron 설정

```bash
# crontab -e
# 매일 새벽 3시 백업 실행
0 3 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### 백업 유형 및 전략

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           백업 전략 (Self-managed)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────┐          │
│   │                      현재 구성 (기본)                         │          │
│   ├──────────────────────────────────────────────────────────────┤          │
│   │                                                               │          │
│   │   📦 일일 논리 백업 (pg_dump)                                 │          │
│   │   • 주기: 매일 새벽 3시                                       │          │
│   │   • 보관: 7일                                                 │          │
│   │   • 저장: 로컬 디스크 + Object Storage (선택)                 │          │
│   │                                                               │          │
│   │   장점: 간단, 특정 테이블만 복구 가능                         │          │
│   │   단점: 복구 시 전체 덤프 로드 필요                           │          │
│   │                                                               │          │
│   └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────┐          │
│   │                     고급 구성 (필요 시)                       │          │
│   ├──────────────────────────────────────────────────────────────┤          │
│   │                                                               │          │
│   │   📦 물리 백업 (pg_basebackup)                                │          │
│   │   • 더 빠른 복구                                              │          │
│   │   • 대용량 DB에 적합                                          │          │
│   │                                                               │          │
│   │   📦 연속 아카이빙 (WAL Archiving)                            │          │
│   │   • Point-in-Time Recovery 가능                               │          │
│   │   • 구성 복잡도 높음                                          │          │
│   │                                                               │          │
│   └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 복구 절차

```bash
#!/bin/bash
# restore.sh - 백업 복구 스크립트

BACKUP_FILE=$1
DB_NAME="csarena"
DB_USER="csarena"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    exit 1
fi

# 주의: 기존 데이터가 삭제됩니다!
echo "Warning: This will replace all data in ${DB_NAME}. Continue? (y/n)"
read confirm
if [ "$confirm" != "y" ]; then
    exit 0
fi

# 복구 실행
gunzip -c ${BACKUP_FILE} | docker exec -i csarena-postgres psql -U ${DB_USER} ${DB_NAME}

echo "Restore completed."
```

### Object Storage 백업 (선택적)

```bash
#!/bin/bash
# backup-to-object-storage.sh

# NCP Object Storage 설정
ENDPOINT="https://kr.object.ncloudstorage.com"
BUCKET="csarena-backups"
BACKUP_FILE=$1

# AWS CLI 호환 명령으로 업로드
aws --endpoint-url=${ENDPOINT} s3 cp ${BACKUP_FILE} s3://${BUCKET}/

echo "Backup uploaded to Object Storage: ${BACKUP_FILE}"
```

---

## 복제 (Replication) 전략

> ⚠️ **참고**: 현재 단계에서는 단일 PostgreSQL로 충분합니다.
> 아래 내용은 서비스 성장 시 고려할 수 있는 옵션입니다.

### Master-Slave 아키텍처 (미래 확장용)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Master-Slave Replication                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│     Application Servers                                                      │
│           │                                                                  │
│           ├──────────── Write (INSERT, UPDATE, DELETE)                       │
│           │                          │                                       │
│           │                          ▼                                       │
│           │                  ┌───────────────┐                               │
│           │                  │    Master     │                               │
│           │                  │  PostgreSQL   │                               │
│           │                  │               │                               │
│           │                  │  • 모든 쓰기   │                               │
│           │                  │  • 읽기 가능   │                               │
│           │                  └───────┬───────┘                               │
│           │                          │                                       │
│           │                    WAL Streaming                                 │
│           │                    (동기/비동기)                                  │
│           │                          │                                       │
│           │                          ▼                                       │
│           │                  ┌───────────────┐                               │
│           │                  │    Slave      │                               │
│           └─── Read ────────▶│  (Standby)    │                               │
│                              │               │                               │
│                              │  • 읽기 전용   │                               │
│                              │  • 장애 대기   │                               │
│                              └───────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 동기 vs 비동기 복제

| 구분 | 동기 (Synchronous) | 비동기 (Asynchronous) |
|------|-------------------|----------------------|
| 데이터 일관성 | 강함 (Zero Data Loss) | 약간의 지연 가능 |
| 쓰기 성능 | 느림 (Slave 확인 대기) | 빠름 |
| 네트워크 지연 영향 | 큼 | 작음 |
| 장애 시 데이터 손실 | 없음 | 최근 트랜잭션 손실 가능 |
| **권장 시나리오** | 금융, 결제 | **일반 웹 서비스** |

### Self-managed PostgreSQL HA 구성 (Docker)

```yaml
# docker-compose.ha.yml (미래 확장용)
version: '3.8'

services:
  postgres-master:
    image: postgres:18.1
    container_name: pg-master
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - master_data:/var/lib/postgresql/data
      - ./master-init.sh:/docker-entrypoint-initdb.d/init.sh
    command: >
      postgres
      -c wal_level=replica
      -c max_wal_senders=3
      -c max_replication_slots=3
      -c hot_standby=on
    ports:
      - "5432:5432"

  postgres-slave:
    image: postgres:18.1
    container_name: pg-slave
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    depends_on:
      - postgres-master
    volumes:
      - slave_data:/var/lib/postgresql/data
    # Standby 모드로 시작
    command: >
      postgres
      -c primary_conninfo='host=postgres-master port=5432 user=replicator password=replpass'
      -c hot_standby=on
    ports:
      - "5433:5432"

volumes:
  master_data:
  slave_data:
```

---

## 샤딩 (Sharding) 전략

> ⚠️ **참고**: 현재 규모에서는 샤딩이 필요하지 않습니다.
> 아래는 미래 대규모 확장 시 참고 자료입니다.

### 샤딩이 필요한 시점

| 지표 | 임계값 | 조치 |
|------|--------|------|
| 단일 테이블 크기 | > 100GB | 샤딩 고려 |
| 쓰기 TPS | > 10,000 | 샤딩 고려 |
| 단일 DB CPU | 지속 80% 이상 | 스케일업 또는 샤딩 |

### 샤딩 전략 비교

#### 1. 수평 샤딩 (Horizontal Sharding)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Horizontal Sharding                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   같은 스키마, 다른 데이터                                                   │
│                                                                              │
│   matches 테이블                                                             │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│   │    Shard 1      │  │    Shard 2      │  │    Shard 3      │             │
│   │                 │  │                 │  │                 │             │
│   │  user_id        │  │  user_id        │  │  user_id        │             │
│   │  1 ~ 10,000     │  │  10,001~20,000  │  │  20,001~30,000  │             │
│   │                 │  │                 │  │                 │             │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│   샤딩 키: user_id (Hash 또는 Range)                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. 수직 샤딩 (Vertical Sharding)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Vertical Sharding                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   다른 테이블을 다른 DB에 분리                                               │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│   │    User DB      │  │    Game DB      │  │   Analytics DB  │             │
│   │                 │  │                 │  │                 │             │
│   │  • users        │  │  • matches      │  │  • logs         │             │
│   │  • statistics   │  │  • rounds       │  │  • metrics      │             │
│   │  • tiers        │  │  • answers      │  │  • events       │             │
│   │                 │  │                 │  │                 │             │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│   장점: 도메인별 분리, 독립적 확장                                           │
│   단점: 조인 불가, 트랜잭션 복잡                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## pgvector (Vector Database)

### pgvector 개요

PostgreSQL 확장으로, 벡터 유사도 검색을 지원합니다.

#### 사용 사례 (CS Arena)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         pgvector 활용 시나리오                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 유사 문제 검색                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  사용자가 틀린 문제 → 비슷한 개념의 문제 추천                     │       │
│   │                                                                   │       │
│   │  SELECT * FROM questions                                         │       │
│   │  ORDER BY embedding <-> query_embedding                          │       │
│   │  LIMIT 5;                                                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   2. RAG 기반 답변 생성                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  질문 → 관련 지식 검색 → LLM 컨텍스트 제공 → 답변 생성            │       │
│   │                                                                   │       │
│   │  문제 생성 시 관련 CS 지식 문서를 검색하여                        │       │
│   │  더 정확한 문제와 해설 생성                                       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   3. 중복 문제 탐지                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  새 문제 생성 시 기존 유사 문제 탐지                              │       │
│   │                                                                   │       │
│   │  SELECT * FROM questions                                         │       │
│   │  WHERE embedding <-> new_embedding < 0.1                         │       │
│   │  LIMIT 1;                                                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### pgvector 설치 (Docker)

```dockerfile
# Dockerfile.postgres-vector
FROM postgres:18.1

# pgvector 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-18 \
    && rm -rf /var/lib/apt/lists/*

RUN cd /tmp && \
    git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install

# 확장 자동 생성 스크립트
COPY init-pgvector.sql /docker-entrypoint-initdb.d/
```

```sql
-- init-pgvector.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- 벡터 컬럼이 있는 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)  -- OpenAI ada-002 차원
);

-- 인덱스 생성 (HNSW - 빠른 검색)
CREATE INDEX ON documents
USING hnsw (embedding vector_cosine_ops);
```

---

## 연결 풀링

### TypeORM 연결 풀 설정

```typescript
// TypeORM 연결 풀 설정
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // 연결 풀 설정
  extra: {
    // 최대 연결 수
    max: 20,

    // 연결 대기 타임아웃 (ms)
    connectionTimeoutMillis: 10000,

    // 유휴 연결 타임아웃 (ms)
    idleTimeoutMillis: 30000,

    // 연결 유효성 검사
    allowExitOnIdle: false,
  },

  // 로깅 (개발 환경)
  logging: process.env.NODE_ENV === 'development',
});
```

### PgBouncer (선택적, 고부하 시)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Connection Pooling                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Without Pooling                   With PgBouncer                          │
│                                                                              │
│   App Server ────── 100 conn ──▶   App Server ────── 100 conn               │
│                        │                              │                      │
│                        ▼                              ▼                      │
│                  ┌───────────┐                 ┌───────────┐                │
│                  │ PostgreSQL│                 │ PgBouncer │                │
│                  │           │                 │           │                │
│                  │ max: 100  │                 │ Pool: 20  │                │
│                  │ (과부하)   │                 └─────┬─────┘                │
│                  └───────────┘                       │                      │
│                                                      ▼                      │
│                                                ┌───────────┐                │
│                                                │ PostgreSQL│                │
│                                                │           │                │
│                                                │ max: 20   │                │
│                                                │ (효율적)   │                │
│                                                └───────────┘                │
│                                                                              │
│   현재 단계: TypeORM 내장 풀로 충분                                          │
│   필요 시: PgBouncer Docker 컨테이너 추가                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 권장 구성 요약

### 현재 목표: 비용 최적화 구성

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     현재 목표 구성 (Self-managed)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────┐         │
│   │                    DB 서버 (별도 NCP Server)                   │         │
│   │                                                                │         │
│   │   ┌─────────────────────────────────────────────────────┐     │         │
│   │   │              PostgreSQL 18 (Docker)                  │     │         │
│   │   │                                                      │     │         │
│   │   │  • 단일 인스턴스 (HA 없음)                           │     │         │
│   │   │  • 일일 자동 백업 (pg_dump)                          │     │         │
│   │   │  • 7일 백업 보관                                     │     │         │
│   │   │  • TypeORM 연결 풀 (max: 20)                         │     │         │
│   │   │                                                      │     │         │
│   │   └─────────────────────────────────────────────────────┘     │         │
│   │                                                                │         │
│   │   서버 스펙: 2vCPU, 4GB RAM (권장)                             │         │
│   │   추가 비용: 0원 (서버 비용에 포함)                            │         │
│   │                                                                │         │
│   └───────────────────────────────────────────────────────────────┘         │
│                                                                              │
│   ⚠️  장애 시 복구 시간: 수동 복구 필요 (수십 분~수 시간)                    │
│   ✅  비용: Cloud DB 대비 월 ~10만원 절감                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 미래 확장: 단계별 업그레이드 경로

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         확장 단계 로드맵                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Stage 1: 현재 (비용 최적화)                                                │
│   ┌─────────────────────────────────────────┐                               │
│   │  • Self-managed PostgreSQL 단일 인스턴스 │                               │
│   │  • 일일 백업                             │                               │
│   │  • 추가 비용: 0원                        │                               │
│   └─────────────────────────────────────────┘                               │
│                    │                                                         │
│                    │ 트래픽 증가, 가용성 요구                                │
│                    ▼                                                         │
│   Stage 2: 고가용성 도입                                                     │
│   ┌─────────────────────────────────────────┐                               │
│   │  • Master + Standby (Streaming Repl)    │                               │
│   │  • 자동 Failover 스크립트                │                               │
│   │  • 추가 비용: +서버 1대 (~5만원/월)      │                               │
│   └─────────────────────────────────────────┘                               │
│                    │                                                         │
│                    │ 읽기 부하 증가                                          │
│                    ▼                                                         │
│   Stage 3: 읽기 분산                                                         │
│   ┌─────────────────────────────────────────┐                               │
│   │  • Master + Standby + Read Replica      │                               │
│   │  • 읽기/쓰기 분리 구현                   │                               │
│   │  • 추가 비용: +서버 1대 (~5만원/월)      │                               │
│   └─────────────────────────────────────────┘                               │
│                    │                                                         │
│                    │ 운영 부담 증가, 예산 확보                               │
│                    ▼                                                         │
│   Stage 4: 관리형 서비스 전환 (선택적)                                       │
│   ┌─────────────────────────────────────────┐                               │
│   │  • NCP Cloud DB for PostgreSQL (HA)     │                               │
│   │  • 자동 백업, 자동 장애조치              │                               │
│   │  • 비용: ~15-25만원/월                   │                               │
│   └─────────────────────────────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 장애 대응 체크리스트

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DB 장애 대응 체크리스트                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. DB 연결 실패 시                                                         │
│      □ Docker 컨테이너 상태 확인: docker ps                                  │
│      □ 컨테이너 로그 확인: docker logs csarena-postgres                     │
│      □ 디스크 용량 확인: df -h                                               │
│      □ 컨테이너 재시작: docker restart csarena-postgres                     │
│                                                                              │
│   2. 데이터 손상/손실 시                                                     │
│      □ 가장 최근 백업 확인: ls -la /backups/                                 │
│      □ 서비스 중단 공지                                                      │
│      □ 백업 복구 실행: ./restore.sh <backup_file>                           │
│      □ 데이터 정합성 검증                                                    │
│                                                                              │
│   3. 성능 저하 시                                                            │
│      □ 느린 쿼리 확인: pg_stat_statements                                   │
│      □ 연결 수 확인: SELECT count(*) FROM pg_stat_activity                  │
│      □ 락 확인: SELECT * FROM pg_locks WHERE NOT granted                    │
│      □ 인덱스 상태 확인: REINDEX (필요 시)                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 참고 자료

- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
- [Docker PostgreSQL Best Practices](https://hub.docker.com/_/postgres)
