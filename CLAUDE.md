# 인사이트랩(healioo.com) 운영 규칙

이 저장소에서 글을 쓰거나 고칠 때는 항상 아래 규칙을 따른다.

## 사이트
- 사이트: 인사이트랩 https://healioo.com / 저장소 leehyosone180603-bot/healioo / 배포 브랜치 main (GitHub Pages, CNAME=healioo.com)
- 자매 사이트(주제 중복 금지 대상): 건강흐름 https://healthfortune.co.kr (leehyosone180603-bot/secondwebsite), 알고살자 https://algosalja.com (leehyosone180603-bot/algosalja)
- 순수 HTML/CSS/JS, 빌드 도구 없음. 경로는 루트 절대경로(/css, /js, /img)
- 헤더·푸터는 js/site.js 가 주입. 푸터 회사정보(SITE)는 자매 사이트와 동일
- 카테고리 6개 모두 활성: food=건강음식, info=건강정보, exercise=건강운동, diet=다이어트, disease=질환·병, life=생활정보 (js/posts.js CATEGORIES)
- 글 파일: posts/<영문-슬러그>.html, 수동 템플릿 posts/_template.html
- 새 글은 js/posts.js POSTS 맨 위에 등록하고 sitemap.xml 에도 추가
- 애드센스 게시자 ID ca-pub-7143828779500885: 모든 페이지 <head>의 로더 스니펫과 ads.txt 는 항상 유지

## 발행 도구 (scripts/)
- `node scripts/factory-publish.js <글.json> [...]` : posts/<slug>.html 생성 + js/posts.js 맨 위 등록(같은 slug면 교체) + sitemap.xml 전체 재생성
  - JSON 필드: slug, title, category, description, summary, keywords[], date(생략 시 오늘 KST), lead, keyboxTitle, keyPoints[], bodyMd, disclaimer, photos[{file, alt, caption, width, height}]
  - bodyMd 문법: `## H2`, `### H3`, `- 목록`, `1. 번호`, `| 표 |`, `**굵게**`
  - 사진: photos[0] = 히어로(리드 문단 위), 나머지는 H2 아래에 자동 배치
- `node scripts/factory-publish.js --sitemap` : 사이트맵만 재생성
- `PIXABAY_API_KEY=... node scripts/pixabay-fetch.js "<영어 장면 키워드>" 6 /home/user/pixtools/<slug>` : 가로 사진 후보 받기
- 글 원본 JSON·후보 사진·몽타주 같은 작업 파일은 저장소 밖(/home/user/pixtools, /home/user/healioo-drafts)에 둔다

## 글 작성
- 구글 SEO 구조: H1 1개 → H2(항목별) → H3(활용법·팁). 상단 핵심 요약 박스(keybox), 리드 문단, 하단 의학적 면책 문구(글마다 다르게)
- meta description·keywords·canonical·Open Graph·JSON-LD(Article) 넣기 (발행기가 자동 처리)
- AI가 쓴 티가 나지 않게: 글마다 화자·톤을 다르게(경험담, 살림 팁, 간병 조언, 직장인 공감 등). 과장된 비유(기적·보물·방패·묘약) 금지, 섹션마다 같은 요약 문장 반복 금지, "공감·댓글·이웃추가·널리 공유" 같은 복붙 마무리 금지
- 의사·약사 등 전문 자격을 가진 것처럼 쓰지 않기
- 성분·수치 같은 사실은 바꾸지 말고, 확실하지 않은 의학 정보는 쓰지 않기
- 이미 발행된 글(js/posts.js)과 자매 사이트 글 모두와 주제가 겹치지 않게, 6개 카테고리 균형 맞추기
- 글마다 구조를 조금씩 다르게(FAQ / 표 / 체크리스트 / 단계별)

## 사진 — 픽사베이
- API 키는 환경변수 PIXABAY_API_KEY 에서만 읽고, 파일·커밋·로그에 절대 남기지 않기
- 요청에 User-Agent 헤더 넣기(없으면 차단됨) — scripts/pixabay-fetch.js 에 반영됨
- 글마다 영어 '장면' 키워드(음식·일상·병원 장면)로 가로 사진 후보 6장 → 몽타주로 눈으로 확인 → 주제에 맞고 깨끗한 것만 사용
- 증상·질병 단어를 그대로 검색하지 않기(혐오·확대 이미지 섞임)
- 빼야 할 사진: 주제와 무관한 동물·아기·의료기기 사진, 누드·혐오·어두운 사진, 글리치·과한 클로즈업. 맞는 게 없으면 키워드를 바꿔 재검색
- 글당 2~3장: 히어로 1장(리드 문단 위) + 본문 1~2장(요약 박스 밖, 소제목 아래)
- 웹용(가로 1200px 안팎, JPEG)으로 리사이즈해 img/<slug>-N.jpg 로 저장. 각 사진에 alt·figcaption, og:image·JSON-LD image·js/posts.js 썸네일도 갱신
- 사용자가 zip으로 사진을 주면 그 사진을 우선 사용

## 광고
- 애드센스 승인 전에는 광고 자리를 끔(js/site.js ADS_SHOW=false). 켜라고 할 때만 켬
- 홈의 쿠팡 파트너스 배너는 자매 사이트와 동일하게 유지
- js/analytics.js 의 ENDPOINT 는 비어 있음(인사이트랩 전용 수집기 주소를 받으면 채움)

## 배포·보고
- 로컬에서 렌더링 스크린샷으로 확인한 뒤 main 에 반영(작업 브랜치에서 했으면 main 으로 병합·푸시)
- 자동 발행 세션이 작업 브랜치 claude/healioo-auto 에 푸시하면 .github/workflows/auto-deploy.yml 이 main 으로 반영
- 외부 사이트는 직접 못 여니, 라이브 확인이 필요하면 사용자에게 요청
- 끝나면 발행한 글 제목·카테고리·주소, 총 글 수 표, 사용자가 확인할 것만 짧게 보고
