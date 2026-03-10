# DAMO Web

React 기반 DAMO 서비스 웹 프론트엔드

## 기술 스택

- **Framework**: React 18
- **배포**: Vercel
- **백엔드 연동**: Vercel Rewrites (프록시)

## URL

- **Production**: https://damo-web.vercel.app
- **Backend API**: http://54.180.179.231:8080

## 주요 기능

- 서버 상태 확인 (Health Check)
- 유저 CRUD (생성, 조회, 삭제)
- 반응형 UI (PC / 태블릿 / 모바일)

## 프로젝트 구조

```
src/
├── App.js          # 메인 컴포넌트 (API 연동, UI)
├── App.css         # 반응형 스타일
└── index.js        # 엔트리포인트
public/
├── favicon.svg     # ㄷㅁ 로고 아이콘
├── index.html      # HTML 템플릿
└── manifest.json   # PWA 매니페스트
```

## 로컬 실행

```bash
npm install
npm start
```

http://localhost:3000 에서 확인 가능

## 배포

Vercel CLI로 수동 배포:
```bash
vercel --prod
```

## API 프록시

`vercel.json`에서 Vercel Rewrites를 통해 HTTPS → HTTP 프록시 처리:

| 웹 요청 | 실제 호출 |
|---------|----------|
| `/health` | `http://54.180.179.231:8080/health` |
| `/api/*` | `http://54.180.179.231:8080/api/*` |
