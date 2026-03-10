# DAMO Web

React 기반 DAMO 서비스 웹 프론트엔드

## 기술 스택

- **Framework**: React 18
- **State Management**: Redux Toolkit (예정)
- **배포**: Vercel (GitHub 연동 자동배포)
- **백엔드 연동**: Vercel Rewrites (프록시)
- **IDE**: VS Code

## URL

- **Production**: https://damo-web.vercel.app
- **Backend API**: http://54.180.179.231:8080

## 현재 상태

서비스 준비중 (Coming Soon) 랜딩 페이지

## 프로젝트 구조 (예정)

```
src/
├── core/              # API 클라이언트, 공통 유틸
├── features/
│   ├── auth/          # 로그인/회원가입
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── pages/
│   └── user/
│       ├── api/
│       ├── hooks/
│       ├── components/
│       └── pages/
├── shared/            # 공통 컴포넌트, 레이아웃
└── store/             # Redux Toolkit store
public/
├── favicon.svg        # ㄷㅁ 로고 아이콘
├── index.html         # HTML 템플릿
└── manifest.json      # PWA 매니페스트
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
