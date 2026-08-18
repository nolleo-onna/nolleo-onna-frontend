# 놀러온나 🌊

> 부산 여행자를 위한 예산 맞춤형 여행 플래너

부산에서 놀고 싶은데 예산이 걱정되시나요? **놀러온나**는 한국관광공사 TourAPI를 기반으로 부산 특화 여행 코스를 추천하고, 예산에 맞는 여행 플랜을 제안하는 서비스입니다.

---

## 📌 프로젝트 소개

| 항목 | 내용 |
|------|------|
| 프로젝트 유형 | 공모전 출품작 |
| 담당 역할 | 프론트엔드 리드 |
| 팀 구성 | 프론트엔드 1명, 백엔드 1명, 프론트엔드 멘토 1명 |
| 서비스 지역 | 부산 특화 |

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **상태 관리**: Zustand
- **서버 상태**: TanStack Query (React Query v5)
- **지도**: Kakao Maps API

### 외부 API
- 한국관광공사 **TourAPI** (관광지, 숙박, 음식점 데이터)

---

## 🎨 디자인 시스템

| 항목 | 값 |
|------|----|
| Primary (배경) | `#1A1A1A` |
| Accent (포인트) | `#FF4D8F` |

---

## 📁 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
├── components/           # 공통 컴포넌트
├── hooks/                # 커스텀 훅
├── stores/               # Zustand 스토어
├── lib/                  # 유틸리티, API 클라이언트
└── types/                # TypeScript 타입 정의
```

---

## 🚀 시작하기

### 요구사항

- Node.js 20.x 이상
- pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/aabyess/nolleo-onna-frontend.git
cd nolleo-onna-frontend

# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 입력하세요.

```env
# TourAPI
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# Backend API
NEXT_PUBLIC_API_BASE_URL=your_backend_api_url
```

> `.env.local`은 절대 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

---

## 📜 스크립트

```bash
pnpm run dev       # 개발 서버 실행
pnpm run build     # 프로덕션 빌드
pnpm run start     # 프로덕션 서버 실행
pnpm run lint      # ESLint 검사
```

---

## 🌿 브랜치 전략

```
main              # 배포 브랜치
└── develop       # 개발 통합 브랜치
    └── feat/기능명  # 기능 개발 브랜치
    └── fix/버그명   # 버그 수정 브랜치
```

---

## 🤝 커밋 컨벤션

```
feat:     새로운 기능 추가
fix:      버그 수정
style:    코드 포맷, 스타일 변경 (로직 변경 없음)
refactor: 코드 리팩토링
chore:    빌드, 설정 파일 변경
docs:     문서 수정
```

---

## 📄 라이선스

본 프로젝트는 공모전 출품용으로 제작되었습니다.