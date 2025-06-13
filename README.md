# 감정 분석 웹 애플리케이션

이 프로젝트는 사용자의 감정을 분석하고 시각화하는 웹 애플리케이션입니다.

## 주요 기능

- 실시간 감정 분석
- 감정 데이터 시각화
- 사용자 인증 및 세션 관리
- 반응형 웹 디자인

## 기술 스택

### 프론트엔드
- React 18
- Tailwind CSS
- Radix UI 컴포넌트
- React Query
- Framer Motion
- Recharts (데이터 시각화)

### 백엔드
- Express.js
- TypeScript
- Drizzle ORM
- WebSocket
- Passport.js (인증)

### 데이터베이스
- Neon Database (PostgreSQL)

## 시작하기

### 필수 조건
- Node.js
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 프로젝트 구조
```
├── client/          # 프론트엔드 코드
├── server/          # 백엔드 코드
├── shared/          # 공유 타입 및 유틸리티
└── attached_assets/ # 정적 자산
```

## 라이선스
MIT License 