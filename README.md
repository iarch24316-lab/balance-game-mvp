# A/B Balance Game MVP (Next.js + Supabase)

이 레포는 **건축 외관 밸런스게임(A/B 선택)**을 빠르게 배포하기 위한 최소 템플릿입니다.

## 1) Supabase 준비
1. 새 프로젝트 생성 → Project URL, Service Role Key 확인
2. SQL Editor에서 `db/schema.sql` 실행
3. 이어서 `db/functions.sql` 실행
4. Table Editor에서 `pairs`에 샘플 데이터(이미지 URL) 5~10개 입력

> 이미지 저장: Supabase Storage(무료 1GB) 또는 외부 CDN URL 사용

## 2) 환경변수 설정
Vercel(또는 로컬 `.env`)에 아래 추가:
```
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

## 3) 실행/배포
- 로컬: `npm install && npm run dev`
- 배포: GitHub 푸시 → Vercel Import → ENV 설정 → Deploy

## 4) 사용법
- 브라우저로 접속 → 왼쪽/오른쪽을 탭하여 선택 → 자동으로 다음 페어가 나옵니다.
- 선택 내역은 Supabase `choices` 테이블에 저장됩니다.

## 5) 자주 묻는 질문
- **이미지가 안 보여요**: `next.config.mjs`의 images.remotePatterns가 해당 도메인을 허용하는지 확인.
- **페어가 안 뜨는데요**: `pairs`에 active=true로 최소 1개 이상 입력했는지 확인.
- **보안**: Service Role Key는 **API Route(서버)** 환경에서만 사용됩니다. 클라이언트로 보내지 마세요.
