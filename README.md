# DAMO Web

**다모(DAMO)** - 통합 콘텐츠 검색 플랫폼 웹 프론트엔드

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 18 (Create React App) |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Analytics | Firebase Analytics (GA4) |
| Deploy | Vercel |
| URL | https://damo-web.vercel.app |

## 주요 기능

### 통합 검색 (17개 소스)
- **네이버** (N): 블로그, 뉴스, 카페, 쇼핑, 이미지, 지식iN, 도서, 웹문서
- **카카오/다음** (D): 블로그, 카페, 웹, 영상, 이미지
- **YouTube**: 동영상, Shorts
- **Reddit**: 인기글, 검색
- **Instagram**: 해시태그 기반 게시물
- 플랫폼별 필터 탭 (네이버 N, 카카오 D 접두사로 구분)

### 추천 피드
- 트렌딩 콘텐츠 자동 로딩
- 인피니티 스크롤 (바이럴 키워드 기반)
- 사용자 관심사 반영 (70% 가중치)
- **개인화 추천 알고리즘**: 검색 기록 + 클릭 기록 + 관심사 기반 랭킹
- 개인화 배너 ("XXX님에게 딱 맞는 YYY")
- Pull-to-refresh (러버밴드 효과)

### 인증
- Google OAuth 2.0
- Naver OAuth 2.0
- JWT 토큰 기반 세션 관리
- 회원가입 시 관심사 온보딩 (건너뛰기 가능)

### 사용자
- 프로필 페이지 (프로필 사진, 계정 정보)
- 관심사 설정 (30개 카테고리)
- 로그아웃

### UI/UX
- 라이트 테마 (Apple 스타일)
- 플로팅 바텀 네비게이션 (배달의민족 스타일)
- Shorts 가로 스크롤 섹션
- 스크롤 시 헤더 숨김 애니메이션 (필터만 잔류)
- Pull-to-refresh (러버밴드 효과)
- 검색 아이콘 버튼 (돋보기)
- 관심사 키워드 필터 칩
- 네이티브 앱 느낌 (터치 피드백, 탭 하이라이트 제거)
- 반응형 (모바일/데스크탑)

## 프로젝트 구조

```
src/
├── core/
│   ├── api/
│   │   └── apiClient.js             # fetch 래퍼 (JWT 자동 주입)
│   └── firebase.js                  # Firebase 초기화
├── components/
│   ├── BottomNav.js                 # 플로팅 바텀 네비게이션
│   └── BottomNav.css
├── features/
│   ├── auth/
│   │   ├── api/authApi.js           # 로그인/회원정보 API
│   │   ├── slice/authSlice.js       # Auth Redux (login, logout, interests)
│   │   └── pages/
│   │       ├── LoginPage.js         # 로그인 (Google + Naver)
│   │       ├── OAuthCallbackPage.js # Google OAuth 콜백
│   │       ├── NaverCallbackPage.js # Naver OAuth 콜백
│   │       ├── OnboardingInterestsPage.js  # 가입 후 관심사 선택
│   │       └── ProfilePage.js       # 프로필 + 관심사 관리
│   ├── search/
│   │   ├── api/
│   │   │   ├── searchApi.js         # 검색/트렌딩 API
│   │   │   └── activityApi.js       # 활동 추적/추천 랭킹 API
│   │   ├── slice/searchSlice.js     # Search Redux (검색, 트렌딩, 인피니티 스크롤, 개인화 랭킹)
│   │   ├── components/
│   │   │   ├── FeedCard.js          # 피드 카드 (클릭 추적 포함)
│   │   │   └── FeedCard.css
│   │   └── pages/
│   │       ├── SearchPage.js        # 메인 검색/피드 페이지
│   │       └── SearchPage.css
│   ├── landing/                     # 랜딩 페이지
│   ├── legal/                       # 이용약관, 개인정보처리방침
│   ├── maps/                        # 지도
│   └── push/                        # 푸시 알림
├── store/index.js                   # Redux Store
├── App.js                           # 라우팅 + BottomNav
└── index.js                         # 엔트리포인트
```

## 개인화 추천 시스템

프론트엔드에서 사용자 행동을 수집하고, 백엔드 추천 엔진에 랭킹을 요청합니다.

### 데이터 수집 (로그인 사용자만)
- **검색 기록**: `searchAll` thunk에서 자동 전송 (`activityApi.recordSearch`)
- **클릭 기록**: `FeedCard` 클릭 시 자동 전송 (`activityApi.recordClick`)

### 랭킹 적용
- `searchAll`, `fetchTrending`, `fetchMoreTrending` 모두 결과를 `activityApi.rankItems`로 재정렬
- 비로그인 사용자는 기본 셔플 순서 유지
- 랭킹 실패 시 원본 순서 유지 (graceful fallback)

## 페이지 라우팅

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | LandingPage | 랜딩 |
| `/search` | SearchPage | 메인 검색/피드 |
| `/login` | LoginPage | 로그인 |
| `/profile` | ProfilePage | 내 정보 |
| `/onboarding/interests` | OnboardingInterestsPage | 가입 후 관심사 |
| `/auth/google/callback` | OAuthCallbackPage | Google 콜백 |
| `/auth/naver/callback` | NaverCallbackPage | Naver 콜백 |
| `/maps` | MapsPage | 지도 |
| `/terms` | TermsPage | 이용약관 |
| `/privacy` | PrivacyPage | 개인정보처리방침 |

## 로컬 실행

```bash
# 환경변수 (.env)
REACT_APP_API_BASE_URL=http://localhost:8080

# 실행
npm install
npm start
```

## 배포

Vercel에 연결되어 `main` 브랜치 push 시 자동 배포됩니다.

```bash
npm run build
git push origin main  # → Vercel 자동 배포
```

## Firebase Analytics

| 항목 | 값 |
|------|-----|
| Firebase 프로젝트 | damo-app-2026 |
| Measurement ID | G-HQ4S4HNBCD |

**추적 이벤트:**
- `page_view` — 페이지 진입
- `search` — 검색 실행 (search_term)
- `select_filter` — 필터 클릭
- `select_content` — 피드 카드 클릭 (platform, item_id)

**백엔드 활동 추적 (로그인 시):**
- 검색 기록 → `POST /api/activity/search`
- 클릭 기록 → `POST /api/activity/click`

## 관련 레포지토리

| 서비스 | 레포 |
|--------|------|
| 백엔드 (Spring Boot) | [DAMO-server](https://github.com/joheeyong/DAMO-server) |
| 앱 (Flutter) | [DAMO-flutter](https://github.com/joheeyong/DAMO-flutter) |
