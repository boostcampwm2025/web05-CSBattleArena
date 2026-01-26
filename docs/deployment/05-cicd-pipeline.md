# 5. CI/CD 파이프라인

> 지속적 통합/배포를 위한 파이프라인 구성 가이드

## 파이프라인 개요

### 전체 워크플로우

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CI/CD Pipeline Flow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Developer                                                                  │
│       │                                                                      │
│       ▼                                                                      │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐             │
│   │  Code   │────▶│  Build  │────▶│  Test   │────▶│ Deploy  │             │
│   │  Push   │     │  Stage  │     │  Stage  │     │  Stage  │             │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘             │
│       │               │               │               │                     │
│       │               │               │               │                     │
│   ┌───▼───┐       ┌───▼───┐       ┌───▼───┐       ┌───▼───┐               │
│   │GitHub │       │Docker │       │Unit   │       │Staging│               │
│   │       │       │Build  │       │Tests  │       │Deploy │               │
│   │       │       │       │       │       │       │       │               │
│   │ PR    │       │Image  │       │E2E    │       │Prod   │               │
│   │ Review│       │Push   │       │Tests  │       │Deploy │               │
│   └───────┘       └───────┘       └───────┘       └───────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 브랜치 전략

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Branch Strategy                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   main (production)                                                          │
│     │                                                                        │
│     │◀────── Release/Hotfix ─────────────────────────────────────┐          │
│     │                                                             │          │
│   develop                                                         │          │
│     │                                                             │          │
│     ├──▶ feature/xxx ──▶ PR ──▶ Merge ──┐                        │          │
│     │                                    │                        │          │
│     ├──▶ feature/yyy ──▶ PR ──▶ Merge ──┤                        │          │
│     │                                    │                        │          │
│     ◀────────────────────────────────────┘                        │          │
│     │                                                             │          │
│     └──▶ release/v1.x ──▶ 테스트 ──▶ main 머지 ─────────────────▶│          │
│                                                                              │
│   트리거:                                                                    │
│   • feature → develop: 단위 테스트, 린트                                     │
│   • develop → release: 통합 테스트, 스테이징 배포                            │
│   • release → main: 프로덕션 배포                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 옵션 1: GitHub Actions + NCP

### 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions + NCP Container Registry                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   GitHub                                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                      GitHub Actions                              │       │
│   │                                                                   │       │
│   │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │       │
│   │  │ Lint &  │───▶│  Test   │───▶│  Build  │───▶│  Push   │      │       │
│   │  │ Type    │    │         │    │  Docker │    │  Image  │      │       │
│   │  └─────────┘    └─────────┘    └─────────┘    └────┬────┘      │       │
│   │                                                     │           │       │
│   └─────────────────────────────────────────────────────┼───────────┘       │
│                                                         │                    │
│                                                         ▼                    │
│   NCP                                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                   │       │
│   │  Container Registry                                              │       │
│   │  ┌─────────────────┐                                             │       │
│   │  │ web05-backend   │                                             │       │
│   │  │ web05-frontend  │                                             │       │
│   │  └────────┬────────┘                                             │       │
│   │           │                                                       │       │
│   │           ▼                                                       │       │
│   │  ┌─────────────────┐                                             │       │
│   │  │  Server / NKS   │  ← docker pull & run                        │       │
│   │  └─────────────────┘                                             │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### GitHub Actions 워크플로우

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NCP_REGISTRY: ${{ secrets.NCP_REGISTRY }}
  NCP_ACCESS_KEY: ${{ secrets.NCP_ACCESS_KEY }}
  NCP_SECRET_KEY: ${{ secrets.NCP_SECRET_KEY }}

jobs:
  # ============================================
  # 1. 린트 및 타입 체크
  # ============================================
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Type Check
        run: pnpm typecheck

  # ============================================
  # 2. 테스트
  # ============================================
  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Backend Tests
        run: pnpm --filter backend test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: test_user
          DB_PASSWORD: test_password
          DB_DATABASE: test_db
          JWT_SECRET: test_jwt_secret_key_32_chars_min
          JWT_REFRESH_SECRET: test_refresh_secret_32_chars_min

      - name: Run E2E Tests
        run: pnpm --filter backend test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: test_user
          DB_PASSWORD: test_password
          DB_DATABASE: test_db

  # ============================================
  # 3. Docker 이미지 빌드 및 푸시
  # ============================================
  build-and-push:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to NCP Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.NCP_REGISTRY }}
          username: ${{ env.NCP_ACCESS_KEY }}
          password: ${{ env.NCP_SECRET_KEY }}

      - name: Build and Push Backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./packages/backend/Dockerfile
          push: true
          tags: |
            ${{ env.NCP_REGISTRY }}/web05-backend:latest
            ${{ env.NCP_REGISTRY }}/web05-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./packages/frontend/Dockerfile
          push: true
          tags: |
            ${{ env.NCP_REGISTRY }}/web05-frontend:latest
            ${{ env.NCP_REGISTRY }}/web05-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ============================================
  # 4. 배포 (SSH를 통한 서버 배포)
  # ============================================
  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Production Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            # NCP Container Registry 로그인
            docker login -u ${{ secrets.NCP_ACCESS_KEY }} \
                         -p ${{ secrets.NCP_SECRET_KEY }} \
                         ${{ secrets.NCP_REGISTRY }}

            # 새 이미지 풀
            docker pull ${{ secrets.NCP_REGISTRY }}/web05-backend:latest
            docker pull ${{ secrets.NCP_REGISTRY }}/web05-frontend:latest

            # 컨테이너 재시작
            cd /app
            docker compose -f docker-compose.prod.yml down
            docker compose -f docker-compose.prod.yml up -d

            # 헬스체크
            sleep 30
            curl -f http://localhost:4000/api/health || exit 1
```

### GitHub Secrets 설정

| Secret 이름 | 설명 |
|-------------|------|
| `NCP_REGISTRY` | NCP Container Registry 엔드포인트 |
| `NCP_ACCESS_KEY` | NCP API 인증 키 |
| `NCP_SECRET_KEY` | NCP API 시크릿 키 |
| `SERVER_HOST` | 배포 서버 IP/도메인 |
| `SERVER_USERNAME` | SSH 사용자명 |
| `SERVER_SSH_KEY` | SSH 프라이빗 키 |

---

## 옵션 2: NCP DevTools (SourcePipeline)

### 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NCP SourcePipeline                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐                                                           │
│   │SourceCommit │  ← GitHub 미러링 또는 직접 사용                           │
│   │ (Git Repo)  │                                                           │
│   └──────┬──────┘                                                           │
│          │ Push 트리거                                                       │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │ SourceBuild │  ← 빌드 서버 자동 생성                                    │
│   │             │                                                           │
│   │  • pnpm     │                                                           │
│   │  • Docker   │                                                           │
│   │  • Test     │                                                           │
│   └──────┬──────┘                                                           │
│          │ 빌드 완료 트리거                                                  │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │SourceDeploy │                                                           │
│   │             │                                                           │
│   │  ┌───────────────────────────────────────────────┐                     │
│   │  │ 배포 시나리오                                  │                     │
│   │  │                                                │                     │
│   │  │  Server Group          Kubernetes             │                     │
│   │  │  ┌─────────┐          ┌─────────┐            │                     │
│   │  │  │ Server1 │          │   NKS   │            │                     │
│   │  │  │ Server2 │          │ Cluster │            │                     │
│   │  │  │ Server3 │          │         │            │                     │
│   │  │  └─────────┘          └─────────┘            │                     │
│   │  │                                                │                     │
│   │  └───────────────────────────────────────────────┘                     │
│   └─────────────┘                                                           │
│                                                                              │
│   전체 파이프라인 자동화: SourcePipeline                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SourceBuild 설정

```yaml
# .sourcebuild/buildspec.yml
version: 0.2

env:
  variables:
    NODE_VERSION: "22"
    PNPM_VERSION: "10"

phases:
  install:
    commands:
      - echo "Installing dependencies..."
      - npm install -g pnpm@$PNPM_VERSION
      - pnpm install --frozen-lockfile

  pre_build:
    commands:
      - echo "Running lint and type check..."
      - pnpm lint
      - pnpm typecheck
      - echo "Running tests..."
      - pnpm --filter backend test

  build:
    commands:
      - echo "Building applications..."
      - pnpm build:backend
      - pnpm build:frontend
      - echo "Building Docker images..."
      - docker build -t web05-backend:$BUILD_ID -f packages/backend/Dockerfile .
      - docker build -t web05-frontend:$BUILD_ID -f packages/frontend/Dockerfile .

  post_build:
    commands:
      - echo "Pushing to Container Registry..."
      - docker tag web05-backend:$BUILD_ID $NCP_REGISTRY/web05-backend:latest
      - docker tag web05-frontend:$BUILD_ID $NCP_REGISTRY/web05-frontend:latest
      - docker push $NCP_REGISTRY/web05-backend:latest
      - docker push $NCP_REGISTRY/web05-frontend:latest

cache:
  paths:
    - node_modules/**/*
    - packages/backend/node_modules/**/*
    - packages/frontend/node_modules/**/*

artifacts:
  files:
    - docker-compose.prod.yml
    - packages/backend/dist/**/*
    - packages/frontend/dist/**/*
```

### SourceDeploy 시나리오

```yaml
# 배포 시나리오 (NCP 콘솔에서 설정)
deploy_scenario:
  name: production-deploy

  # 배포 전 훅
  pre_deploy:
    - name: health-check-off
      commands:
        - curl -X POST http://localhost:4000/api/health/maintenance

  # 파일 배포
  file_deployment:
    source: /artifacts
    destination: /app
    overwrite: true

  # 애플리케이션 재시작
  application_start:
    - name: docker-compose-up
      commands:
        - cd /app
        - docker compose -f docker-compose.prod.yml pull
        - docker compose -f docker-compose.prod.yml up -d

  # 배포 후 훅
  post_deploy:
    - name: health-check
      commands:
        - sleep 30
        - curl -f http://localhost:4000/api/health
    - name: health-check-on
      commands:
        - curl -X POST http://localhost:4000/api/health/active

  # 롤백 설정
  rollback:
    on_failure: true
    commands:
      - docker compose -f docker-compose.prod.yml down
      - docker tag web05-backend:previous web05-backend:latest
      - docker compose -f docker-compose.prod.yml up -d
```

---

## 배포 전략

### Rolling Update (기본)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Rolling Update                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   시간 ─────────────────────────────────────────────────────▶               │
│                                                                              │
│   T0: 초기 상태                                                              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                                    │
│   │ v1.0    │  │ v1.0    │  │ v1.0    │                                    │
│   │  ✓      │  │  ✓      │  │  ✓      │                                    │
│   └─────────┘  └─────────┘  └─────────┘                                    │
│                                                                              │
│   T1: 첫 번째 서버 업데이트                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                                    │
│   │ v1.1    │  │ v1.0    │  │ v1.0    │                                    │
│   │  ↻      │  │  ✓      │  │  ✓      │  ← 트래픽 v1.0 서버로              │
│   └─────────┘  └─────────┘  └─────────┘                                    │
│                                                                              │
│   T2: 헬스체크 통과 후                                                       │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                                    │
│   │ v1.1    │  │ v1.1    │  │ v1.0    │                                    │
│   │  ✓      │  │  ↻      │  │  ✓      │                                    │
│   └─────────┘  └─────────┘  └─────────┘                                    │
│                                                                              │
│   T3: 완료                                                                   │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                                    │
│   │ v1.1    │  │ v1.1    │  │ v1.1    │                                    │
│   │  ✓      │  │  ✓      │  │  ✓      │                                    │
│   └─────────┘  └─────────┘  └─────────┘                                    │
│                                                                              │
│   장점: 무중단, 점진적                                                       │
│   단점: 배포 중 여러 버전 공존                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Blue-Green Deployment                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Load Balancer                                                              │
│        │                                                                     │
│        ├──────────────────────────────────────┐                             │
│        │                                      │                             │
│        ▼                                      ▼                             │
│   ┌─────────────────────┐           ┌─────────────────────┐                │
│   │      Blue (현재)     │           │      Green (새)      │                │
│   │                     │           │                     │                │
│   │  ┌───────┐ ┌───────┐│           │  ┌───────┐ ┌───────┐│                │
│   │  │ v1.0  │ │ v1.0  ││           │  │ v1.1  │ │ v1.1  ││                │
│   │  │  ✓    │ │  ✓    ││           │  │  ✓    │ │  ✓    ││                │
│   │  └───────┘ └───────┘│           │  └───────┘ └───────┘│                │
│   │                     │           │                     │                │
│   │  ← 활성 트래픽       │           │  ← 대기 (테스트)     │                │
│   └─────────────────────┘           └─────────────────────┘                │
│                                                                              │
│   전환 절차:                                                                 │
│   1. Green 환경에 새 버전 배포                                               │
│   2. Green 환경 테스트                                                       │
│   3. LB 트래픽을 Green으로 전환                                              │
│   4. Blue 환경은 롤백 대기                                                   │
│                                                                              │
│   장점: 즉시 롤백 가능, 명확한 버전 분리                                     │
│   단점: 2배의 인프라 비용                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Canary Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Canary Deployment                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   트래픽 분배 변화                                                           │
│                                                                              │
│   Phase 1: 5% 카나리                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                   │       │
│   │  ██████████████████████████████████████████████████ v1.0 (95%)  │       │
│   │  ███ v1.1 (5%)                                                   │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Phase 2: 25% 카나리 (에러율 정상 확인 후)                                  │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                   │       │
│   │  ████████████████████████████████████████ v1.0 (75%)            │       │
│   │  █████████████ v1.1 (25%)                                        │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Phase 3: 전체 전환                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                   │       │
│   │  ██████████████████████████████████████████████████ v1.1 (100%) │       │
│   │                                                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   장점: 점진적 검증, 위험 최소화                                             │
│   단점: 복잡한 트래픽 관리, 모니터링 필수                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Docker Compose 프로덕션 설정

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: ${NCP_REGISTRY}/web05-backend:latest
    container_name: web05-backend
    restart: always
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      # Redis는 선택사항 (WAS 다중화 시 필요)
      # - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - GITHUB_CALLBACK_URL=${GITHUB_CALLBACK_URL}
      - CLOVA_STUDIO_API_KEY=${CLOVA_STUDIO_API_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend:
    image: ${NCP_REGISTRY}/web05-frontend:latest
    container_name: web05-frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3

networks:
  default:
    driver: bridge
```

---

## 환경별 설정 관리

### 환경 변수 분리

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Environment Configuration                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   로컬 개발          스테이징              프로덕션                          │
│   .env.local         .env.staging          .env.production                  │
│                                                                              │
│   ┌─────────────┐   ┌─────────────┐       ┌─────────────┐                  │
│   │ DB_HOST=    │   │ DB_HOST=    │       │ DB_HOST=    │                  │
│   │ localhost   │   │ staging-db  │       │ prod-db     │                  │
│   │             │   │             │       │             │                  │
│   │ NODE_ENV=   │   │ NODE_ENV=   │       │ NODE_ENV=   │                  │
│   │ development │   │ staging     │       │ production  │                  │
│   │             │   │             │       │             │                  │
│   │ DEBUG=true  │   │ DEBUG=true  │       │ DEBUG=false │                  │
│   └─────────────┘   └─────────────┘       └─────────────┘                  │
│                                                                              │
│   민감 정보 관리:                                                            │
│   • GitHub Secrets (CI/CD)                                                  │
│   • NCP Secret Manager                                                      │
│   • 서버 환경 변수                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### GitHub OAuth 환경별 설정

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GitHub OAuth 환경별 설정                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ⚠️  각 환경별로 별도의 GitHub OAuth App 필요!                              │
│                                                                              │
│   Development                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  App Name: CS Arena (Dev)                                        │       │
│   │  Homepage: http://localhost:3000                                │       │
│   │  Callback: http://localhost:4000/api/auth/github/callback       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Staging                                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  App Name: CS Arena (Staging)                                    │       │
│   │  Homepage: https://staging.csarena.com                          │       │
│   │  Callback: https://staging.csarena.com/api/auth/github/callback │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Production                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  App Name: CS Arena                                              │       │
│   │  Homepage: https://csarena.com                                  │       │
│   │  Callback: https://csarena.com/api/auth/github/callback         │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 모니터링 및 알림

### 배포 알림 설정

```yaml
# GitHub Actions - Slack 알림 예시
- name: Notify Slack on Success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "✅ 배포 성공!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*배포 완료*\n• 브랜치: ${{ github.ref_name }}\n• 커밋: ${{ github.sha }}\n• 배포자: ${{ github.actor }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    payload: |
      {
        "text": "❌ 배포 실패!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*배포 실패*\n• 브랜치: ${{ github.ref_name }}\n• 커밋: ${{ github.sha }}\n• <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|로그 확인>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 권장 구성

### 현재 목표: 비용 최적화 구성

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      현재 권장 구성 (비용 최적화)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   GitHub Actions (무료) + SSH 배포                                          │
│                                                                              │
│   CI:                                                                        │
│   • lint, typecheck, test 자동 실행                                         │
│   • PR 시 필수 체크                                                          │
│   • PostgreSQL 18 테스트 환경                                                │
│                                                                              │
│   CD:                                                                        │
│   • main 브랜치 머지 시 SSH 자동 배포                                        │
│   • 단일 WAS 서버 배포 (재시작 방식)                                         │
│   • 헬스체크 후 완료                                                         │
│                                                                              │
│   추가 비용: 0원 (GitHub Actions 무료 tier 내)                               │
│   적합: 현재 프로젝트 규모                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 단계별 구성

#### Level 1: MVP (개발 초기)

```
┌─────────────────────────────────────────┐
│          수동 배포 + 기본 CI            │
│                                          │
│  CI:                                     │
│  • GitHub Actions (lint, test)          │
│  • PR 시 자동 실행                       │
│                                          │
│  CD:                                     │
│  • 수동 docker-compose up               │
│  • 서버 직접 접속 배포                   │
│                                          │
│  적합: 초기 개발, 소규모 팀              │
└─────────────────────────────────────────┘
```

#### Level 2: Production (현재 목표)

```
┌─────────────────────────────────────────┐
│      GitHub Actions + 자동 배포          │
│                                          │
│  CI:                                     │
│  • lint, typecheck, test                │
│  • Docker 이미지 빌드                   │
│  • Container Registry 푸시              │
│                                          │
│  CD:                                     │
│  • main 브랜치 머지 시 자동 배포        │
│  • SSH 배포 (단일 서버)                 │
│  • 재시작 후 헬스체크                   │
│                                          │
│  적합: 현재 Production 서비스            │
└─────────────────────────────────────────┘
```

#### Level 3: Enterprise (미래 확장)

```
┌─────────────────────────────────────────┐
│      SourcePipeline + Kubernetes         │
│                                          │
│  CI:                                     │
│  • 전체 테스트 스위트                    │
│  • 보안 취약점 스캔                      │
│  • 코드 품질 분석                        │
│                                          │
│  CD:                                     │
│  • Blue-Green 또는 Canary               │
│  • 자동 롤백                             │
│  • 배포 승인 프로세스                    │
│                                          │
│  적합: 대규모 서비스, 엔터프라이즈       │
└─────────────────────────────────────────┘
```

---

## 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [NCP SourcePipeline](https://www.ncloud.com/v2/product/devTools/sourcePipeline)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
