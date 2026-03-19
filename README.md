# DAMO Web

**다모(DAMO)** - 다양한 플랫폼의 콘텐츠를 한곳에서 탐색하는 통합 콘텐츠 피드 서비스

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

### 트렌딩 홈
- 앱 열면 바로 트렌딩 콘텐츠 표시 (검색 없이 탐색)
- 검색은 우측 아이콘으로 접근하는 보조 기능
- 인피니티 스크롤 (바이럴 키워드 기반)
- 사용자 관심사 반영 (70% 가중치)
- **개인화 추천 알고리즘**: 검색 기록 + 클릭 기록 + 관심사 기반 랭킹
- 개인화 배너 ("XXX님에게 딱 맞는 YYY")
- Pull-to-refresh (러버밴드 효과)

### 풀스크린 피드 (`/feed`)
- TikTok/Shorts 스타일 세로 스냅 스와이프
- 한 화면에 콘텐츠 1개, 위아래로 넘김
- YouTube 영상 자동 재생 (음소거)
- 우측 플로팅 액션 버튼 (저장/공유)
- 하단 오버레이에 제목, 플랫폼 배지, 설명 표시
- 이미지 없는 콘텐츠는 그라데이션 배경 플레이스홀더

### 인증
- Google OAuth 2.0
- Naver OAuth 2.0
- Kakao OAuth 2.0
- JWT 토큰 기반 세션 관리
- 회원가입 시 관심사 온보딩 (건너뛰기 가능)

### 사용자
- 프로필 페이지 (프로필 사진, 계정 정보)
- 관심사 설정 (30개 카테고리)
- 로그아웃

### UI/UX
- 다크 모드: 시스템/수동 3-way 전환 (라이트/시스템/다크)
- 플로팅 바텀 네비게이션 5탭: 홈, 피드, 저장, 지도, 내 정보
- Shorts 가로 스크롤 섹션
- 스크롤 시 헤더 숨김 애니메이션 (필터만 잔류)
- Pull-to-refresh (러버밴드 효과)
- 검색 아이콘 버튼 → 탭 시 검색바 확장 (트렌딩 중심 레이아웃)
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
├── shared/
│   ├── constants/
│   │   ├── filters.js               # 플랫폼 필터 정의
│   │   └── platforms.js             # 플랫폼 레이블/색상
│   ├── api/
│   │   └── bookmarkApi.js           # 북마크 API (localStorage + 서버)
│   └── utils/
│       └── helpers.js               # stripHtml, getVideoId, isFlutterApp
├── features/
│   ├── auth/
│   │   ├── api/authApi.js           # 로그인/회원정보 API
│   │   ├── slice/authSlice.js       # Auth Redux (login, logout, interests)
│   │   └── pages/
│   │       ├── LoginPage.js         # 로그인 (Google + Kakao + Naver, CSRF state)
│   │       ├── OAuthCallbackPage.js # Google OAuth 콜백 (state 검증)
│   │       ├── NaverCallbackPage.js # Naver OAuth 콜백 (state 검증)
│   │       ├── KakaoCallbackPage.js # Kakao OAuth 콜백 (state 검증)
│   │       ├── OnboardingInterestsPage.js  # 가입 후 관심사 선택
│   │       └── ProfilePage.js       # 프로필 + 테마 설정 (3-way)
│   ├── feed/
│   │   └── pages/
│   │       ├── FeedPage.js          # 풀스크린 세로 스냅 스와이프 피드
│   │       └── FeedPage.css
│   ├── search/
│   │   ├── api/
│   │   │   ├── searchApi.js         # 검색/트렌딩 API (Reddit Flutter 프록시)
│   │   │   └── activityApi.js       # 활동 추적/추천 랭킹 API
│   │   ├── slice/searchSlice.js     # Search Redux (검색, 트렌딩, 인피니티 스크롤, 개인화 랭킹)
│   │   ├── utils/
│   │   │   └── mobileUrl.js         # 모바일 URL 변환 + 앱 감지
│   │   ├── components/
│   │   │   ├── FeedCard.js          # 피드 카드 (URL 검증, 클릭 추적)
│   │   │   └── FeedCard.css
│   │   └── pages/
│   │       ├── SearchPage.js        # 홈: 트렌딩 중심 + 검색 (compact header)
│   │       ├── SearchPage.css
│   │       ├── ContentDetailPage.js # 콘텐츠 상세 (iframe sandbox 강화)
│   │       ├── ContentDetailPage.css
│   │       └── BookmarksPage.js     # 저장한 콘텐츠
│   ├── landing/                     # 랜딩 페이지
│   ├── legal/                       # 이용약관, 개인정보처리방침
│   ├── maps/                        # 네이버 지도
│   └── push/                        # FCM 푸시 알림 (인증 가드)
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
| `/search` | SearchPage | 홈 (트렌딩 중심 + 검색) |
| `/feed` | FeedPage | 풀스크린 세로 스냅 스와이프 피드 |
| `/content` | ContentDetailPage | 콘텐츠 상세 (YouTube/이미지/iframe) |
| `/bookmarks` | BookmarksPage | 저장한 콘텐츠 |
| `/maps` | MapsPage | 네이버 지도 |
| `/login` | LoginPage | 소셜 로그인 |
| `/profile` | ProfilePage | 프로필 + 테마 설정 |
| `/onboarding/interests` | OnboardingInterestsPage | 가입 후 관심사 선택 |
| `/auth/*/callback` | OAuth 콜백 | Google/Naver/Kakao OAuth (state 검증) |
| `/push` | PushPage | 푸시 알림 관리 (인증 필요) |
| `/terms`, `/privacy` | 법률 페이지 | 이용약관, 개인정보처리방침 |

## 콘텐츠 상세 페이지

콘텐츠 클릭 시 플랫폼별 최적화된 상세 뷰를 제공합니다.

| 콘텐츠 유형 | 웹 브라우저 | Flutter 앱 |
|---|---|---|
| YouTube / Shorts | 임베드 플레이어 + 메타 정보 | 임베드 플레이어 + 메타 정보 |
| 이미지 (N/D) | 자체 이미지 뷰어 | 자체 이미지 뷰어 |
| 블로그 (iframe 허용) | DAMO 헤더 + iframe | 네이티브 오버레이 WebView |
| 뉴스/카페/쇼핑 등 (iframe 차단) | 프리뷰 카드 + 원본 링크 | 네이티브 오버레이 WebView |

### 모바일 URL 자동 변환
- `blog.naver.com` → `m.blog.naver.com`
- `news.naver.com` → `m.news.naver.com`
- `cafe.naver.com` → `m.cafe.naver.com`
- `blog.daum.net` → `m.blog.daum.net`
- `cafe.daum.net` → `m.cafe.daum.net`
- `brunch.co.kr` → `m.brunch.co.kr`

### Flutter 앱 연동
- Flutter `NavigationDelegate`가 외부 URL 이동을 가로챔
- 오버레이 WebView로 콘텐츠를 로드 (메인 WebView 상태 유지)
- 뒤로가기 시 오버레이만 닫히고 검색 목록 그대로 복귀

## 로컬 실행

```bash
cp .env.example .env
# .env 파일에 실제 값 입력 (Firebase, OAuth 클라이언트 ID 등)

npm install
npm start
```

### 환경 변수

| 변수 | 설명 |
|------|------|
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `REACT_APP_NAVER_CLIENT_ID` | Naver OAuth 클라이언트 ID |
| `REACT_APP_KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID |
| `REACT_APP_NAVER_MAP_CLIENT_ID` | Naver Maps 클라이언트 ID |
| `REACT_APP_FIREBASE_*` | Firebase 프로젝트 설정 (7개) |

> `.env`는 gitignore 되어있습니다. Vercel 배포 시 프로젝트 환경변수에 등록 필요.

## 배포

Vercel에 연결되어 `main` 브랜치 push 시 자동 배포됩니다.

```bash
npm run build
git push origin main  # → Vercel 자동 배포
```

### 인프라 구성

```
[사용자] → [Vercel CDN] → React SPA
                ↓ /api/*
         [Nginx :80] → [Spring Boot :8080 (localhost)]
         (EC2 리버스 프록시)
```

- Vercel: `vercel.json`으로 `/api/*`, `/health` 요청을 EC2로 프록시
- Nginx: 리버스 프록시, Spring Boot는 localhost만 바인딩
- EC2 보안그룹: 80(HTTP), 22(SSH)만 외부 허용, 8080/3306 차단

## 보안

- **OAuth CSRF 방지**: `state` 파라미터 + `crypto.getRandomValues()` (Google/Naver/Kakao)
- **XSS 방지**: `dangerouslySetInnerHTML` 제거 → `HighlightText` 안전 컴포넌트
- **URL 검증**: `http:`, `https:` 프로토콜만 허용 (FeedCard, PushPage)
- **iframe sandbox**: `allow-same-origin` 제거 (ContentDetailPage)
- **Firebase config**: 환경 변수로 관리, 초기화 실패 시 graceful fallback
- **JSONP 보안**: Reddit 콜백 ID에 암호학적 난수 사용
- **인증 가드**: PushPage는 로그인 필수 (`/login`으로 리다이렉트)

## Firebase Analytics

**추적 이벤트:**
- `page_view` — 페이지 진입 (Search, Feed)
- `search` — 검색 실행 (search_term)
- `select_filter` — 필터 클릭
- `select_content` — 피드 카드 클릭 (platform, item_id)
- `add_bookmark` / `remove_bookmark` — 북마크 토글

**백엔드 활동 추적 (로그인 시):**
- 검색 기록 → `POST /api/activity/search`
- 클릭 기록 → `POST /api/activity/click`

## 관련 프로젝트

| 서비스 | 레포 | 설명 |
|--------|------|------|
| 백엔드 | [DAMO-server](https://github.com/joheeyong/DAMO-server) | Spring Boot API (검색, 인증, FCM) |
| 앱 | [DAMO-flutter](https://github.com/joheeyong/DAMO-flutter) | Flutter 모바일 앱 (WebView + FCM) |
