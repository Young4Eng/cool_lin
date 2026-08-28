# cool_lin

이 프로젝트는 도전형 해커톤을 위한 것입니다.

## 구조

```
client/   React + TypeScript (Vite)  — http://localhost:5173
server/   Express + TypeScript       — http://localhost:4000
```

`client`의 `/api/*` 요청은 Vite dev 프록시를 통해 `server`로 전달됩니다.

## 실행

```bash
npm run install:all   # 최초 1회
npm install           # 루트 (concurrently)
npm run dev           # server + client 동시 실행
```

개별 실행:

```bash
npm run dev:server
npm run dev:client
```

## 빌드

```bash
npm run build
```
