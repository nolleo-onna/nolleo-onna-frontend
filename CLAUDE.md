# CLAUDE.md — 놀러온나 프로젝트

> AI 어시스턴트(Claude Code)가 이 프로젝트를 빠르게 파악하기 위한 컨텍스트 문서입니다.
> 코드 작성 전 반드시 이 파일을 먼저 읽으세요.

---

## 프로젝트 개요

**서비스명:** 놀러온나  
**설명:** 부산 특화 소비 여행 앱. TourAPI 데이터를 기반으로 부산의 여행 명소·음식·숙소 등을 탐색하고 예산 내 여행 코스를 구성할 수 있는 웹 서비스  
**목적:** 공모전 출품용  
**타겟 사용자:** 부산 여행을 계획하는 내·외국인 여행자

---

## 팀 구성

| 역할 | 담당 |
|------|------|
| 프론트엔드 리드 | 상호 (aabyess) |
| 백엔드 개발자 | 별도 협업 |
| 프론트엔드 멘토 | 코드리뷰 및 방향 피드백 |

---

## 기술 스택

### Frontend
| 항목 | 버전 / 선택 이유 |
|------|-----------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Server State** | TanStack Query (React Query) v5 |
| **Client State** | Zustand v5 |
| **Map** | Kakao Maps API |
| **HTTP** | fetch (Next.js 내장) |

### Backend (협업)
- RESTful API 서버 (별도 레포)
- 외부 데이터: **TourAPI** (한국관광공사 Open API)
- **DB:** PostgreSQL 16 + PostGIS 3.4 (지리 데이터 처리)
- **Cache:** Redis
- **인프라:** Docker Compose (`onna-postgres` 컨테이너)
- **배포:** AWS
- **API 문서:** 미정 (추후 Swagger 예정)

### 개발 도구
- **패키지 매니저:** pnpm
- **린터:** ESLint
- **포매터:** Prettier
- **버전관리:** Git / GitHub

---

## 디자인 시스템

### 컬러 팔레트
```
Primary (Dark):   #1A1A1A
Accent (Pink):    #FF4D8F
```

### 폰트
- `TODO: 프로젝트에서 사용하는 폰트명 기입`

### 디자인 참고
- Figma 와이어프레임 기반으로 UI 구현
- 다크 계열 배경 + 핑크 포인트 컬러 조합

---

## 프로젝트 구조

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트 그룹
│   ├── (main)/              # 메인 서비스 라우트 그룹
│   │   ├── explore/         # 명소 탐색
│   │   ├── course/          # 코스 구성
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # 공통 UI 컴포넌트 (Button, Input 등)
│   └── [feature]/           # 기능별 컴포넌트
├── hooks/                   # 커스텀 훅
├── lib/
│   ├── api/                 # API 함수 모음
│   └── utils/               # 공통 유틸 함수
├── stores/                  # Zustand 스토어
├── types/                   # 전역 TypeScript 타입
└── constants/               # 상수 정의
```

> ⚠️ 실제 구조와 다를 경우 이 섹션을 업데이트하세요.

---

## 주요 아키텍처 결정 (ADR)

### 1. App Router 채택 이유
- Next.js 15 기본 패러다임
- 서버 컴포넌트로 TourAPI 데이터 초기 패칭 → 초기 로딩 성능 개선
- 레이아웃 중첩, 라우트 그룹으로 구조화 용이

### 2. 필터 상태 → URL Query Parameter 관리
- 새로고침·공유 시 필터 상태 유지
- `useSearchParams` + `useRouter` 조합 사용
- Zustand는 UI 전용 클라이언트 상태만 담당

### 3. 카카오맵 마커 렌더링 성능
- 마커 수가 많을 경우 클러스터링 적용 검토
- 뷰포트 기반 마커 렌더링 (화면 밖 마커 제거) 고려

### 4. TourAPI 의존성 리스크 대응
- API 응답을 타입으로 엄격하게 정의 (`types/tourapi.ts`)
- 응답 포맷 변경 시 한 곳에서만 수정하도록 어댑터 레이어 구성

---

## 코딩 컨벤션

### 네이밍
```
컴포넌트 파일:   PascalCase        (ExploreCard.tsx)
훅:             camelCase + use    (useFilterParams.ts)
스토어:         camelCase + Store  (useMapStore.ts)
API 함수:       camelCase + fetch  (fetchTourSpots.ts)
타입/인터페이스: PascalCase        (TourSpot, ApiResponse)
상수:           UPPER_SNAKE_CASE   (DEFAULT_ZOOM_LEVEL)
```

### 컴포넌트 작성 규칙
- **서버 컴포넌트 기본**, 클라이언트 상태·이벤트 필요 시 `'use client'` 명시
- Props 타입은 `interface`로 파일 상단에 정의
- 한 파일 = 한 컴포넌트 원칙

### import 순서
```ts
// 1. React / Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'

// 3. 내부 절대경로 (@/)
import { fetchTourSpots } from '@/lib/api/tour'
import { Button } from '@/components/ui/Button'

// 4. 타입
import type { TourSpot } from '@/types/tourapi'
```

### Tailwind CSS
- 인라인 클래스 우선, 복잡한 반복 패턴만 `@apply` 사용
- 반응형: `md:` (744px tablet), `lg:` (1280px desktop)
- 다크 배경 기준 작성 (bg-[#1A1A1A])

---

## API 연동

### TourAPI 기본 정보
```
Base URL: http://apis.data.go.kr/B551011/KorService1
인증: serviceKey (환경변수로 관리)
지역코드: 부산 = 6
```

### 환경변수 (`.env.local`)
```
NEXT_PUBLIC_KAKAO_MAP_KEY=
TOUR_API_SERVICE_KEY=             # 서버사이드 전용 (NEXT_PUBLIC_ 붙이지 않음)
NEXT_PUBLIC_BASE_URL=

# 소셜 로그인
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

### React Query 설정 원칙
- `queryKey`는 배열로 계층 구조 작성: `['spots', { areaCode, category }]`
- 서버 컴포넌트에서 prefetch → 클라이언트에서 hydrate 패턴 사용
- `staleTime`: 관광지 데이터 5분, 실시간성 낮으므로 캐시 적극 활용

---

## 자주 쓰는 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 타입 체크
pnpm tsc --noEmit
```

---

## 주의사항 / AI에게 당부하는 것

1. **App Router 방식으로만 작성** — `pages/` 디렉토리 방식 사용 금지
2. **`'use client'` 최소화** — 서버 컴포넌트를 기본으로, 꼭 필요한 곳만 클라이언트로
3. **환경변수 노출 금지** — TourAPI 키는 절대 `NEXT_PUBLIC_` 접두사 붙이지 말 것
4. **타입 any 금지** — 모든 API 응답은 타입 정의 후 사용
5. **필터 상태는 URL** — Zustand에 필터값 저장하지 말 것, `useSearchParams` 사용
6. **카카오맵은 클라이언트 전용** — SSR에서 `window` 접근 오류 주의, dynamic import 사용

---

## TODO / 미결 사항

- [ ] 실제 폴더 구조 확정 후 위 구조 섹션 업데이트
- [ ] API Base URL 확정 (백엔드 서버 주소)
- [ ] 인증 방식 확정 (JWT / 세션, NextAuth 사용 여부)
- [ ] 백엔드 API 문서 완성 후 엔드포인트 패턴 추가

---

*Last updated: 2026-05*
