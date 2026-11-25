# 인사이트랩 (healioo.com)

애드센스 수익형 건강 정보 사이트입니다. 순수 HTML/CSS/JS로 만들어져 GitHub Pages로 호스팅합니다.
레이아웃·구조는 자매 사이트(건강흐름·알고살자)와 동일하며, 글 주제는 서로 겹치지 않도록 구성했습니다.
운영 규칙은 `CLAUDE.md` 를 참고하세요.

## 화면 구성
- **상단**: 로고(인사이트랩) + 검색창 + 카테고리 네비게이션 (건강음식·건강정보·건강운동·다이어트·질환·병·생활정보 모두 활성)
- **히어로**: 대표기사(큰 카드) + 보조 카드 2개 + 헤드라인 목록
- **본문 2단**: 좌측 기사 목록(썸네일+제목+요약) / 우측 사이드바(타임라인·건강음식·분야별 새 글)
- **푸터**: 회사 정보 + 정책 링크

광고 자리는 상단 배너 / 기사목록 상단 / 사이드바 / 글 본문 중간에 준비되어 있으며, 현재는 꺼진 상태입니다(`ADS_SHOW = false`).

## 폴더 구조
```
index.html            홈(메인) 페이지
category.html         카테고리 페이지 (?cat=food|info|exercise|diet|disease|life)
about/contact/privacy/terms.html   필수 페이지
posts/
  _template.html      새 글 수동 작성용 템플릿
  *.html              실제 글
css/style.css         전체 디자인
js/posts.js           ★ 글 목록 데이터 (여기서 글을 관리)
js/site.js            헤더/푸터/광고 공통
js/home.js            홈 렌더링
js/category.js        카테고리 렌더링
js/analytics.js       자체 방문 분석 비콘 (ENDPOINT 비어 있으면 동작 안 함)
scripts/factory-publish.js  글 JSON → HTML 발행 + posts.js·sitemap 갱신
scripts/pixabay-fetch.js    픽사베이 가로 사진 후보 받기
CNAME                 도메인 연결 (healioo.com)
ads.txt, robots.txt, sitemap.xml
```

## 새 글 추가하기
```bash
node scripts/factory-publish.js /경로/새글.json
```
→ `posts/<slug>.html` 생성, `js/posts.js` 맨 위 등록, `sitemap.xml` 재생성이 한 번에 됩니다.
JSON 형식은 `scripts/factory-publish.js` 맨 위 주석을 참고하세요.

## 애드센스
- 게시자 ID `ca-pub-7143828779500885` 가 모든 페이지 `<head>` 와 `ads.txt` 에 들어 있습니다.
- 승인 후 광고를 켤 때는 `js/site.js` 의 `ADS_SHOW` 를 `true` 로, `ADSENSE.slots` 에 광고 단위 슬롯 번호를 넣습니다.

## 도메인 연결 (healioo.com)
1. GitHub 저장소 → **Settings → Pages** 에서 Source 를 `main` 브랜치 `/ (root)` 로 설정
2. `CNAME` 파일이 `healioo.com` 으로 지정되어 있습니다 (이미 포함됨)
3. 가비아 DNS 설정:
   - 루트(`@`) → A 레코드 4개: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` → CNAME → `leehyosone180603-bot.github.io.`
4. 인증서 발급 후 **Enforce HTTPS** 활성화 (수십 분 소요)
