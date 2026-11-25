/*
 * 인사이트랩 - 블로그 글 목록 데이터
 * ==================================================================
 * ▷ 새 글을 추가하는 방법
 *   1) /posts/ 폴더에 새 글 HTML 파일을 만듭니다.
 *      (가장 쉬운 방법: posts/_template.html 을 복사해서 내용만 수정)
 *   2) 아래 POSTS 배열의 "맨 위"에 아래 형식으로 한 줄(객체)을 추가합니다.
 *      → 배열 앞쪽에 넣을수록 최신글로 취급되어 상단에 노출됩니다.
 *
 *   {
 *     id: "unique-slug",              // 영문/숫자 고유값 (파일명과 동일 권장)
 *     title: "글 제목",
 *     summary: "홈/목록에 노출될 1~2줄 요약",
 *     category: "food",               // food·info·exercise·diet·disease·life 중 하나
 *     date: "2026-11-21",             // 작성일 (YYYY-MM-DD)
 *     url: "/posts/unique-slug.html", // 실제 글 페이지 경로
 *     image: "/img/unique-slug.jpg",  // 대표 이미지 (없으면 "" 로 두면 됩니다)
 *   }
 *
 *   * 이미지가 없으면 image 를 "" 로 두세요. 색상 썸네일이 자동 생성됩니다.
 * ==================================================================
 */

/* 카테고리 정의 (ready:false 로 바꾸면 "준비중" 표시 + 클릭 시 안내) */
const CATEGORIES = {
  food:     { slug: "food",     name: "건강음식", ready: true },
  info:     { slug: "info",     name: "건강정보", ready: true },
  exercise: { slug: "exercise", name: "건강운동", ready: true },
  diet:     { slug: "diet",     name: "다이어트", ready: true },
  disease:  { slug: "disease",  name: "질환·병",  ready: true },
  life:     { slug: "life",     name: "생활정보", ready: true },
};

/* 상단 네비게이션에 노출할 순서 */
const NAV_ORDER = ["food", "info", "exercise", "diet", "disease", "life"];

/*
 * 실제 발행 글 목록 (최신 글이 위로).
 * 새 글을 추가할 때 이 배열 맨 위에 객체를 추가하세요.
 * (scripts/factory-publish.js 를 쓰면 자동으로 맨 위에 들어갑니다)
 */
const POSTS = [
  {
    id: "shingles-early-symptoms",
    title: "대상포진 초기 증상과 예방접종 정보 (발진 전에 오는 통증 신호)",
    summary:
      "아버지의 대상포진을 곁에서 지켜본 자녀가 초기 신호를 놓친 경험, 간병하며 챙긴 것들, 예방접종 전에 알아 둘 내용을 담았습니다.",
    category: "disease",
    date: "2026-11-25",
    url: "/posts/shingles-early-symptoms.html",
    image: "/img/shingles-early-symptoms-1.jpg",
  },
  {
    id: "radish-mu-benefits",
    title: "겨울 무 효능과 무청·시래기 알뜰 활용법 (부위별 맛과 보관법)",
    summary:
      "무 한 개를 윗동부터 무청까지 버리는 곳 없이 쓰는 살림 요령. 생으로 먹을 때와 익혀 먹을 때의 차이, 시래기 만들기, 보관법을 담았습니다.",
    category: "food",
    date: "2026-11-25",
    url: "/posts/radish-mu-benefits.html",
    image: "/img/radish-mu-benefits-1.jpg",
  },
  {
    id: "year-end-party-weight",
    title: "연말 모임 많을 때 체중 관리법 (송년회 술·안주 고르는 요령)",
    summary:
      "송년회 일정이 줄줄이 잡힌 직장인이 모임은 다 가면서도 1월 체중계 앞에서 덜 놀라기 위해 쓰는 방법들입니다.",
    category: "diet",
    date: "2026-11-25",
    url: "/posts/year-end-party-weight.html",
    image: "/img/year-end-party-weight-1.jpg",
  },
  {
    id: "carbon-monoxide-safety",
    title: "겨울 캠핑 일산화탄소 중독 예방과 초기 증상 (텐트 난로 주의)",
    summary:
      "겨울 캠핑을 다니는 동호회 선배가 후배들에게 꼭 전하고 싶은 일산화탄소 안전 수칙과 이상할 때 대처하는 순서입니다.",
    category: "life",
    date: "2026-11-25",
    url: "/posts/carbon-monoxide-safety.html",
    image: "/img/carbon-monoxide-safety-1.jpg",
  },
  {
    id: "daily-steps-walking",
    title: "하루 걷기 몇 보가 적당할까? 만 보의 유래와 현실적인 목표 세우기",
    summary:
      "운동을 계속 미루다 걷기부터 시작한 40대의 기록. 만 보 강박을 내려놓고 내 걸음 수에서 조금씩 늘려 간 방법과 자세 점검법을 담았습니다.",
    category: "exercise",
    date: "2026-11-25",
    url: "/posts/daily-steps-walking.html",
    image: "/img/daily-steps-walking-1.jpg",
  },
  {
    id: "angular-cheilitis-care",
    title: "입꼬리 갈라짐 원인과 빨리 낫게 관리하는 법 (구각염 병원 갈 때)",
    summary:
      "해마다 입꼬리 갈라짐으로 고생한 30대가 원인을 하나씩 따져 보며 바꾼 생활 습관과, 결국 피부과에서 알게 된 것들을 적었습니다.",
    category: "info",
    date: "2026-11-25",
    url: "/posts/angular-cheilitis-care.html",
    image: "/img/angular-cheilitis-care-1.jpg",
  },
  {
    id: "yuja-tea-benefits",
    title: "유자차 효능과 당 걱정 줄이는 법 (유자청 한 잔 양 조절)",
    summary:
      "부모님께 유자차를 챙기는 딸이 설탕 걱정을 덜며 유자 향을 즐기는 방법, 한 잔 양 조절과 껍질 세척법을 적었습니다.",
    category: "food",
    date: "2026-11-25",
    url: "/posts/yuja-tea-benefits.html",
    image: "/img/yuja-tea-benefits-1.jpg",
  },
  {
    id: "bells-palsy-vs-stroke",
    title: "안면마비(구안와사) 초기 증상, 뇌졸중과 구별해야 하는 이유",
    summary:
      "아버지가 갑자기 안면마비를 겪어 응급실에 갔던 날을 돌아보며, 구안와사와 뇌졸중을 집에서 판단하면 안 되는 이유를 정리했습니다.",
    category: "disease",
    date: "2026-11-25",
    url: "/posts/bells-palsy-vs-stroke.html",
    image: "/img/bells-palsy-vs-stroke-1.jpg",
  },
  {
    id: "winter-ventilation-guide",
    title: "겨울철 환기 하루 몇 번, 몇 분이 좋을까? 실내 공기 관리법",
    summary:
      "어린아이 키우는 아빠가 겨울마다 고민하던 환기 횟수와 시간, 요리 후와 미세먼지 심한 날, 난방기기 쓸 때의 실내 공기 관리법을 적었어요.",
    category: "life",
    date: "2026-11-25",
    url: "/posts/winter-ventilation-guide.html",
    image: "/img/winter-ventilation-guide-1.jpg",
  },
  {
    id: "intermittent-fasting-16-8",
    title: "간헐적 단식 16:8 하는 법과 하면 안 되는 사람 (3주 실천 후기)",
    summary:
      "16:8 간헐적 단식을 3주간 해 보며 겪은 배고픔, 회식, 폭식 반동까지 숨김없이 적고, 시작 전에 꼭 확인해야 할 주의 대상을 담았습니다.",
    category: "diet",
    date: "2026-11-25",
    url: "/posts/intermittent-fasting-16-8.html",
    image: "/img/intermittent-fasting-16-8-1.jpg",
  },
  {
    id: "stair-climbing-exercise",
    title: "계단 오르기 운동 효과와 무릎 덜 아프게 오르는 법 (15층 계단 도전기)",
    summary:
      "아파트 15층에 사는 40대 직장인이 퇴근길 엘리베이터 대신 계단을 택하며 알게 된 운동 효과와 무릎 부담 줄이는 요령이에요.",
    category: "exercise",
    date: "2026-11-25",
    url: "/posts/stair-climbing-exercise.html",
    image: "/img/stair-climbing-exercise-1.jpg",
  },
  {
    id: "night-leg-cramps",
    title: "자다가 다리에 쥐 나는 이유와 바로 푸는 법 (종아리 경련)",
    summary:
      "새벽마다 종아리 쥐로 깨던 어머니 곁에서 익힌 바로 푸는 동작과 자기 전 예방 습관, 병원에 가야 할 때를 적었어요.",
    category: "info",
    date: "2026-11-25",
    url: "/posts/night-leg-cramps.html",
    image: "/img/night-leg-cramps-1.jpg",
  },
  {
    id: "sweet-pumpkin-benefits",
    title: "단호박 효능과 칼로리, 전자레인지로 쉽게 손질하는 법 (껍질째 먹기)",
    summary:
      "다이어트 도시락에 단호박을 넣기 시작하며 알게 된 영양 성분과 밥·고구마 칼로리 비교, 전자레인지 손질 순서를 담았어요.",
    category: "food",
    date: "2026-11-25",
    url: "/posts/sweet-pumpkin-benefits.html",
    image: "/img/sweet-pumpkin-benefits-1.jpg",
  },
  {
    id: "cystitis-recurrence-prevention",
    title: "방광염 증상과 재발 막는 생활습관 (세 번 재발해 보고 바꾼 것)",
    summary:
      "방광염이 1년에 세 번 찾아와 고생한 30대 여성이 증상 알아차리는 법, 재발을 줄이려고 바꾼 습관, 바로 병원에 가야 할 신호를 적었어요.",
    category: "disease",
    date: "2026-11-25",
    url: "/posts/cystitis-recurrence-prevention.html",
    image: "/img/cystitis-recurrence-prevention-1.jpg",
  },
  {
    id: "bedding-wash-dust-mites",
    title: "이불 빨래 주기와 집먼지진드기 줄이는 법 (비염 아이 침구 관리)",
    summary:
      "아이 비염 때문에 시작한 이불 빨래 루틴. 품목별 세탁 주기와 온수 세탁, 건조, 매트리스 관리까지 우리 집에서 해 본 방법을 담았습니다.",
    category: "life",
    date: "2026-11-25",
    url: "/posts/bedding-wash-dust-mites.html",
    image: "/img/bedding-wash-dust-mites-1.jpg",
  },
  {
    id: "weight-loss-plateau",
    title: "다이어트 정체기 이유와 넘기는 방법 (3주 멈춘 체중계 앞에서)",
    summary:
      "체중계 숫자가 3주 동안 꿈쩍 않던 시기를 지나 본 사람이, 정체기가 오는 이유와 조급해지지 않고 넘기는 방법을 차분히 적었어요.",
    category: "diet",
    date: "2026-11-25",
    url: "/posts/weight-loss-plateau.html",
    image: "/img/weight-loss-plateau-1.jpg",
  },
  {
    id: "squat-correct-form",
    title: "스쿼트 바른 자세, 무릎이 발끝을 넘어가도 될까? (초보 체크포인트)",
    summary:
      "헬스 1년 차가 처음에 틀렸던 스쿼트 자세를 고친 과정과, 무릎이 발끝을 넘는 문제를 어떻게 봐야 하는지 적었습니다.",
    category: "exercise",
    date: "2026-11-25",
    url: "/posts/squat-correct-form.html",
    image: "/img/squat-correct-form-1.jpg",
  },
  {
    id: "tinnitus-ringing-ears",
    title: "귀에서 삐 소리, 이명 원인과 병원 가야 할 때 (돌발성 난청 구별)",
    summary:
      "이명이 생겼을 때 지켜봐도 되는 경우와 서둘러 진료받아야 하는 경우를 자주 묻는 질문 순서대로 정리했습니다.",
    category: "info",
    date: "2026-11-25",
    url: "/posts/tinnitus-ringing-ears.html",
    image: "/img/tinnitus-ringing-ears-1.jpg",
  },
  {
    id: "lotus-root-benefits",
    title: "연근 효능과 손질법, 갈변 막는 법 (자취생 첫 연근 요리)",
    summary:
      "처음 연근을 사 본 자취생이 손질하며 겪은 시행착오와 갈변 막는 식초물, 조림·전·칩 활용법, 보관 요령을 적었습니다.",
    category: "food",
    date: "2026-11-25",
    url: "/posts/lotus-root-benefits.html",
    image: "/img/lotus-root-benefits-1.jpg",
  },
  {
    id: "varicose-veins-early-signs",
    title: "하지정맥류 초기 증상과 관리법 (오래 서서 일하는 분이라면)",
    summary:
      "매장과 미용실에서 하루 종일 서 있는 사람들이 알아 둘 하지정맥류 초기 증상과 근무 중·퇴근 후 관리법이에요.",
    category: "disease",
    date: "2026-11-25",
    url: "/posts/varicose-veins-early-signs.html",
    image: "/img/varicose-veins-early-signs-1.jpg",
  },
  {
    id: "toothbrush-replacement",
    title: "칫솔 교체 주기와 위생적인 보관법 (전동칫솔 헤드까지)",
    summary:
      "칫솔 교체 날짜를 잊지 않는 요령과 젖은 칫솔을 위생적으로 말리고 보관하는 방법, 전동칫솔 헤드 관리까지 간단히 정리했어요.",
    category: "life",
    date: "2026-11-25",
    url: "/posts/toothbrush-replacement.html",
    image: "/img/toothbrush-replacement-1.jpg",
  },
  {
    id: "stop-late-night-snacking",
    title: "야식 끊는 법, 밤에 배고플 때 대처하는 현실적인 방법",
    summary:
      "저녁을 굶다 밤마다 배달앱 앞에서 무너지던 자취 직장인이 야식을 줄이면서 효과를 본 현실적인 습관들을 정리했어요.",
    category: "diet",
    date: "2026-11-25",
    url: "/posts/stop-late-night-snacking.html",
    image: "/img/stop-late-night-snacking-1.jpg",
  },
  {
    id: "plank-correct-form",
    title: "플랭크 올바른 자세와 초보 목표 시간 (무릎 플랭크부터)",
    summary:
      "버티는 시간보다 자세가 먼저인 이유와 흔한 실수 고치는 법, 초보용 세트 구성과 무릎 플랭크를 친구에게 설명하듯 담았어요.",
    category: "exercise",
    date: "2026-11-25",
    url: "/posts/plank-correct-form.html",
    image: "/img/plank-correct-form-1.jpg",
  },
  {
    id: "eyelid-twitching-causes",
    title: "눈 떨림 원인과 멈추는 방법, 마그네슘 부족 때문일까?",
    summary:
      "마감 주간 새벽에 눈꺼풀이 파르르 떨린 경험에서 출발해 흔한 원인, 마그네슘 이야기의 실제 근거, 병원에 가 봐야 할 때를 담았어요.",
    category: "info",
    date: "2026-11-25",
    url: "/posts/eyelid-twitching-causes.html",
    image: "/img/eyelid-twitching-causes-1.jpg",
  },
];

/* 전역 노출 */
window.CATEGORIES = CATEGORIES;
window.NAV_ORDER = NAV_ORDER;
window.POSTS = POSTS;
