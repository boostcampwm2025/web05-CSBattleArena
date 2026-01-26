# CS Arena 배포 인프라 설계 문서

> CS 지식 1:1 대결 서비스를 위한 NCP(Naver Cloud Platform) 기반 배포 인프라 아키텍처 설계

## 목차

1. [아키텍처 개요](./01-architecture-overview.md) - 전체 시스템 아키텍처 및 설계 원칙
2. [NCP 서비스 가이드](./02-ncp-services.md) - 사용 가능한 NCP 서비스 및 선택 가이드
3. [데이터베이스 아키텍처](./03-database-architecture.md) - Self-managed PostgreSQL, 복제 전략
4. [실시간 인프라](./04-realtime-infrastructure.md) - WebSocket, 매칭 시스템, 세션 관리
5. [CI/CD 파이프라인](./05-cicd-pipeline.md) - 배포 자동화 및 파이프라인 구성
6. [트레이드오프 분석](./06-trade-offs-decisions.md) - 아키텍처 결정사항 및 비용 분석

---

## 설계 원칙

### 비용 효율성 우선

본 프로젝트는 **부트캠프 프로젝트 예산 제약** 내에서 운영되므로, 비용 효율성을 최우선으로 고려합니다.

- **월 예산**: 20~30만원 이내
- **NCP Cloud DB 미사용**: 비용 절감을 위해 일반 서버에 PostgreSQL 직접 구축
- **CDN/LB 미사용 (현재)**: WAS 다중화 없이 단일 서버 운영
- **Redis 선택적 도입**: 필요 시에만 도입하여 비용 최적화

---

## 현재 상태 vs 목표 상태

### 현재 상태 (Development)

```
┌─────────────────────────────────────────┐
│           현재 개발 환경                  │
├─────────────────────────────────────────┤
│  • Docker Compose 기반 로컬 개발         │
│  • PostgreSQL 18 (Docker)               │
│  • In-Memory 세션/매칭 큐               │
│  • 단일 프로세스                         │
└─────────────────────────────────────────┘
```

### 목표 상태 (Production - 비용 최적화)

```
┌─────────────────────────────────────────┐
│        목표 Production 환경              │
├─────────────────────────────────────────┤
│  • NCP Server 2대 (WAS + DB 분리)       │
│  • Self-managed PostgreSQL              │
│  • Object Storage (Frontend 정적 파일)  │
│  • Redis (선택적 - 확장 시 도입)         │
│  • 예상 비용: 15~25만원/월              │
└─────────────────────────────────────────┘
```

### 미래 확장 상태 (Scale-out 필요 시)

```
┌─────────────────────────────────────────┐
│          미래 확장 환경                  │
├─────────────────────────────────────────┤
│  • WAS 다중화 + Load Balancer           │
│  • Redis 클러스터 (세션 공유)            │
│  • DB 복제 (Master-Slave)               │
│  • CDN 도입                             │
│  • 예상 비용: 40~60만원/월              │
└─────────────────────────────────────────┘
```

---

## 프로젝트 개요

### 서비스 특성

| 특성 | 설명 |
|------|------|
| **서비스 유형** | CS 지식 1:1 실시간 대결 게임 |
| **핵심 기능** | 실시간 매칭, WebSocket 기반 게임 진행, AI 채점 |
| **기술 스택** | React + NestJS 모노레포, PostgreSQL, Socket.IO |
| **인증** | GitHub OAuth + JWT |
| **AI 연동** | Naver Clova Studio API |

### 현재 기술 스택

```
Frontend:    React 18 + Vite + Tailwind CSS
Backend:     NestJS 10 + TypeORM + Socket.IO
Database:    PostgreSQL 18 (Self-managed)
Queue:       In-Memory (현재) → Redis (확장 시)
Container:   Docker + Docker Compose
```

### 주요 요구사항

1. **실시간성**: 1:1 대결 중 지연 최소화 (< 100ms)
2. **비용 효율성**: 월 20~30만원 이내 운영 (최우선)
3. **안정성**: 서비스 중단 최소화
4. **확장 가능성**: 필요 시 수평 확장 가능한 구조

---

## 빠른 시작

```bash
# 1. Docker 이미지 빌드
docker compose build

# 2. NCP Container Registry 푸시
docker tag web05-backend:latest {NCP_REGISTRY}/web05-backend:latest
docker push {NCP_REGISTRY}/web05-backend:latest

# 3. NCP Server에서 실행
docker compose -f docker-compose.prod.yml up -d
```

자세한 내용은 각 문서를 참조하세요.

---

## 비용 요약

| 구성 요소 | 현재 계획 | 월 예상 비용 | 비고 |
|----------|----------|-------------|------|
| WAS 서버 | Standard (2vCPU, 4GB) | ~6만원 | NestJS + Nginx |
| DB 서버 | Standard (2vCPU, 4GB) | ~6만원 | Self-managed PostgreSQL |
| Object Storage | 10GB | ~1만원 | Frontend 정적 파일 |
| 네트워크 | 기본 트래픽 | ~2만원 | |
| **합계** | | **~15만원** | |

> Redis 도입 시: +3~5만원/월 (총 18~20만원)
> CDN 도입 시: +3~5만원/월

---

## 참고 자료

### 공식 문서
- [Naver Cloud Platform](https://www.ncloud.com)
- [NCP 사용 가이드](https://guide.ncloud-docs.com)
- [Socket.IO 문서](https://socket.io/docs/v4/)

### 아키텍처 레퍼런스
- [WebSocket 확장 가이드 - Ably](https://ably.com/topic/scaling-socketio)
- [PostgreSQL HA - Severalnines](https://severalnines.com/blog/postgresql-high-availability-master-slave-master-master-architectures/)

---

## 문서 버전

| 버전 | 날짜 | 작성자 | 변경사항 |
|------|------|--------|----------|
| 1.0 | 2025-01-20 | - | 초기 문서 작성 |
| 1.1 | 2025-01-21 | - | 비용 최적화 기준 반영, 현재/미래 상태 구분 |
