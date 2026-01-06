# Entity 빌드 및 테스트 가이드

## ✅ 완료된 작업

1. **TypeScript 빌드 테스트 완료**
   - 모든 entity 파일이 문법 오류 없이 컴파일됨
   - `packages/backend/dist` 디렉토리에 빌드 완료

---

## 📝 직접 테스트하는 방법

### 1단계: PostgreSQL 실행

**Windows PowerShell 또는 CMD에서 실행:**

```bash
cd C:\Users\Enble\Desktop\nbc\membership\web05-boostcamp
docker-compose up -d postgres
```

**확인:**
```bash
docker-compose ps
```

PostgreSQL이 `healthy` 상태가 될 때까지 기다리세요 (약 10초).

---

### 2단계: 백엔드 실행 (개발 모드)

**새 터미널에서:**

```bash
cd C:\Users\Enble\Desktop\nbc\membership\web05-boostcamp
pnpm dev
```

또는 backend만 실행:

```bash
cd packages/backend
pnpm dev
```

**예상 출력:**
```
[Nest] LOG [TypeOrmModule] Mapped {users, user_statistics, tiers, ...} to entities
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] Application successfully started
```

---

### 3단계: 테이블 생성 확인

**PostgreSQL에 접속:**

```bash
docker exec -it web05-postgres psql -U web05_user -d web05_db
```

**테이블 목록 확인:**

```sql
\dt
```

**예상 테이블 목록:**
- categories
- category_questions
- matches
- questions
- round_answers (grading_criteria, grading_details 포함)
- rounds
- tiers
- user_problem_banks
- user_statistics
- user_tier_hisotries
- users

**특정 테이블 구조 확인:**

```sql
\d round_answers
```

**grading_criteria, grading_details가 jsonb 타입인지 확인:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'round_answers'
  AND column_name IN ('grading_criteria', 'grading_details');
```

**종료:**
```sql
\q
```

---

### 4단계: 간단한 데이터 삽입 테스트 (선택)

**psql에서:**

```sql
-- 사용자 생성
INSERT INTO users (nickname, email)
VALUES ('테스트유저', 'test@example.com');

-- 카테고리 생성
INSERT INTO categories (name)
VALUES ('알고리즘');

-- 문제 생성
INSERT INTO questions (question_type, content, correct_answer)
VALUES ('short', '퀵정렬의 평균 시간복잡도는?', 'O(n log n)');

-- 확인
SELECT * FROM users;
SELECT * FROM questions;
```

---

## 🔍 로그 확인 포인트

### 성공적인 실행 시 보이는 로그:

```
[TypeOrmModule] Database connection established
query: SELECT * FROM current_schema()
query: SELECT version()
query: SELECT * FROM information_schema.tables WHERE table_schema = 'public'
```

### Entity 자동 생성 로그 (synchronize=true):

```
query: CREATE TABLE "users" (...)
query: CREATE TABLE "questions" (...)
query: CREATE TABLE "round_answers" (...)
...
```

---

## 🐛 문제 해결

### 1. PostgreSQL 연결 실패

**에러:**
```
Error connecting to database
```

**해결:**
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres

# 재시작
docker-compose restart postgres
```

### 2. 환경 변수 인식 안됨

**확인:**
```bash
cat .env
```

**.env 파일에 다음 내용이 있어야 함:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=web05_user
DB_PASSWORD=csarena123!
DB_DATABASE=web05_db

POSTGRES_DB=web05_db
POSTGRES_USER=web05_user
POSTGRES_PASSWORD=csarena123!
POSTGRES_PORT=5432
```

### 3. Entity 로드 안됨

**app.module.ts의 entities 경로 확인:**
```typescript
entities: [__dirname + '/**/*.entity{.ts,.js}']
```

**빌드 재실행:**
```bash
pnpm build
```

---

## 📊 테스트 체크리스트

- [ ] PostgreSQL 컨테이너 실행됨
- [ ] 백엔드 애플리케이션 시작됨
- [ ] TypeORM 연결 성공 로그 확인
- [ ] 11개 테이블 모두 생성됨
- [ ] round_answers에 grading_criteria, grading_details가 jsonb로 생성됨
- [ ] 기본 데이터 삽입 테스트 성공

---

## 🚀 다음 단계

테스트가 모두 성공하면:

1. PostgreSQL 중지
   ```bash
   docker-compose down
   ```

2. 빌드 결과 정리
   ```bash
   cd packages/backend
   pnpm clean
   ```

3. Entity 커밋 진행

---

## 💡 유용한 명령어

```bash
# 전체 로그 보기 (실시간)
docker-compose logs -f postgres

# PostgreSQL 재시작
docker-compose restart postgres

# 데이터 초기화 (주의!)
docker-compose down -v  # 볼륨까지 삭제

# 백엔드만 빌드
cd packages/backend && pnpm build

# 백엔드 개발 모드 (hot reload)
cd packages/backend && pnpm dev
```
