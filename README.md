# DAMO Web

React 기반 DAMO 서비스 웹 프론트엔드

## 기술 스택

- **Framework**: React 18
- **State Management**: Redux Toolkit
- **배포**: Vercel (GitHub 연동 자동배포)
- **백엔드 연동**: Vercel Rewrites (프록시)
- **IDE**: VS Code

## URL

- **Production**: https://damo-web.vercel.app
- **Backend API**: http://54.180.179.231:8080

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | Coming Soon 랜딩 페이지 |
| `/maps` | 네이버 지도 (현재 위치 표시) |
| `/search` | 통합 검색 피드 (네이버+유튜브 혼합, 검색어 없으면 추천 피드) |
| `/push` | FCM 푸시 알림 전송 관리 |

## 프로젝트 구조

```
src/
├── core/
│   └── api/
│       └── apiClient.js         # 공통 HTTP 클라이언트
├── features/
│   ├── landing/
│   │   └── pages/               # Coming Soon 랜딩 페이지
│   ├── maps/
│   │   ├── hooks/               # useNaverMap 커스텀 훅
│   │   └── pages/               # 네이버 지도 페이지
│   ├── search/
│   │   ├── api/                 # 검색 API 호출 (네이버+유튜브)
│   │   ├── slice/               # Redux 검색 상태 관리 + 통합 피드 정규화
│   │   ├── components/          # FeedCard (플랫폼별 카드 렌더링)
│   │   └── pages/               # 통합 검색 피드 페이지
│   └── push/
│       ├── api/                 # FCM API 호출
│       ├── slice/               # Redux Toolkit slice (상태 관리)
│       └── pages/               # 푸시 알림 전송 페이지
├── shared/                      # 공통 컴포넌트 (예정)
├── store/
│   └── index.js                 # Redux Store 설정
├── App.js                       # 라우팅
└── index.js                     # Provider + 앱 진입점
```

## 로컬 실행

```bash
npm install
npm start
```

http://localhost:3000 에서 확인 가능

## 배포

`main` 브랜치에 push하면 Vercel이 자동으로 빌드 + 배포합니다.

## API 프록시

`vercel.json`에서 Vercel Rewrites를 통해 HTTPS → HTTP 프록시 처리:

| 웹 요청 | 실제 호출 |
|---------|----------|
| `/health` | `http://54.180.179.231:8080/health` |
| `/api/*` | `http://54.180.179.231:8080/api/*` |

## 관련 레포지토리

| 서비스 | 레포 |
|--------|------|
| 백엔드 (Spring Boot) | [DAMO-server](https://github.com/joheeyong/DAMO-server) |
| 앱 (Flutter) | [DAMO-flutter](https://github.com/joheeyong/DAMO-flutter) |
