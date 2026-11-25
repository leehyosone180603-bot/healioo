/*
 * 글 JSON 점검기 (발행 전에 실행)
 *  사용: node scripts/lint-article.js <글.json> [...]
 *  - 필수 필드, 카테고리, 본문 길이, H2 개수
 *  - CLAUDE.md 의 금지 표현(과장 비유·복붙 마무리·AI 말투)
 *  - 이미 발행된 글(js/posts.js)과 slug/제목 중복
 *  문제가 있으면 종료 코드 1
 */
"use strict";
const fs = require("fs");
const { readPosts } = require("./factory-publish.js");

const CATS = ["food", "info", "exercise", "diet", "disease", "life"];
const BANNED = [
  "보물", "방패", "묘약", "만병통치", "슈퍼푸드", "천연 항생제", "천연 소화제",
  "알아보겠습니다", "알아볼게요", "알아봅시다", "결론적으로", "도움이 되셨길", "도움이 되셨으면",
  "이웃추가", "이웃 추가", "널리 공유",
];
// 문맥에 따라 괜찮을 수 있어 경고만 (복붙 마무리인지 눈으로 확인)
const SOFT = ["공감", "댓글", "구독", "놀라운", "꿀팁"];

function check(file, posts) {
  const errs = [], warns = [];
  let a;
  try { a = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return { errs: ["JSON 오류: " + e.message], warns }; }
  ["slug", "title", "category", "description", "bodyMd"].forEach(k => { if (!a[k]) errs.push(`필드 없음: ${k}`); });
  if (a.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) errs.push("slug 는 영문 소문자·숫자·하이픈만");
  if (a.category && !CATS.includes(a.category)) errs.push(`category 값 오류: ${a.category}`);
  const body = String(a.bodyMd || "");
  const plain = body.replace(/[#*|\-\s]/g, "");
  if (plain.length < 1500) warns.push(`본문이 짧음 (${plain.length}자)`);
  const h2 = (body.match(/^##\s/gm) || []).length;
  if (h2 < 3) warns.push(`H2 소제목 ${h2}개 (3개 이상 권장)`);
  if (/^#\s/m.test(body)) errs.push("본문에 H1(# ) 금지 — 제목은 title 필드");
  if (!a.disclaimer) warns.push("disclaimer(면책 문구) 없음");
  if (!a.keyPoints || a.keyPoints.length < 3) warns.push("keyPoints 3개 이상 권장");
  const d = String(a.description || "");
  if (d.length < 70 || d.length > 160) warns.push(`description 길이 ${d.length}자 (70~160 권장)`);
  const all = [a.title, a.lead, a.description, a.summary, (a.keyPoints || []).join(" "), body, a.disclaimer].join("\n");
  BANNED.forEach(w => { if (all.includes(w)) errs.push(`금지 표현: "${w}"`); });
  if (/(?<![주정단일])기적/.test(all)) errs.push(`금지 표현: "기적"`);
  SOFT.forEach(w => { if (all.includes(w)) warns.push(`확인할 표현: "${w}"`); });
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all)) errs.push("이모지 금지");
  // 같은 문장 반복
  const sents = body.split(/(?<=[.!?다요])\s+/).map(s => s.trim()).filter(s => s.length > 25);
  const seen = new Set();
  sents.forEach(s => { if (seen.has(s)) warns.push(`같은 문장 반복: ${s.slice(0, 30)}…`); seen.add(s); });
  // 기존 글 중복
  posts.forEach(p => {
    if (p.id === a.slug) warns.push(`이미 있는 slug(재발행이면 무시): ${a.slug}`);
    else if (p.title === a.title) errs.push(`같은 제목의 글이 이미 있음: ${p.title}`);
  });
  return { errs, warns, a };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error("usage: node scripts/lint-article.js <글.json> [...]"); process.exit(1); }
  const posts = readPosts();
  let bad = 0;
  files.forEach(f => {
    const { errs, warns, a } = check(f, posts);
    const name = (a && a.slug) || f;
    if (!errs.length && !warns.length) { console.log(`OK   ${name}`); return; }
    if (errs.length) bad++;
    console.log(`${errs.length ? "FAIL" : "WARN"} ${name}`);
    errs.forEach(e => console.log("   ✗ " + e));
    warns.forEach(w => console.log("   △ " + w));
  });
  process.exit(bad ? 1 : 0);
}
main();
