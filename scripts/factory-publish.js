/*
 * 인사이트랩(healioo.com) 글 발행기
 * ------------------------------------------------------------------
 *  입력: article.json
 *    {
 *      slug, title, category: "food"|"info"|"exercise"|"diet"|"disease"|"life",
 *      description, summary?, keywords:[...], date?: "YYYY-MM-DD"(없으면 오늘, KST),
 *      seoTitle?, ogTitle?, ogDescription?,
 *      lead?: "리드 문단",
 *      keyboxTitle?: "요약 박스 제목", keyPoints?: ["핵심 1", "핵심 2", ...],
 *      bodyMd: "## 소제목 ...",            // 아래 마크다운 문법
 *      disclaimer?: "하단 면책 문구(글마다 다르게)",
 *      photos?: [{ file:"/img/<slug>-1.jpg", alt, caption?, width?, height? }]
 *    }
 *  bodyMd 문법: ## H2, ### H3, - 목록, 1. 번호목록, | 표 |, **굵게**, [글](/경로)
 *  사진 배치: photos[0] = 히어로(리드 문단 위), 나머지는 H2 소제목 아래에 고르게.
 *  동작: posts/<slug>.html 생성 + js/posts.js POSTS 맨 위에 추가(같은 id면 교체)
 *        + sitemap.xml 전체 재생성
 *  사용: node scripts/factory-publish.js <article.json> [<article2.json> ...]
 *        node scripts/factory-publish.js --sitemap   (사이트맵만 재생성)
 * ------------------------------------------------------------------
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const BASE = "https://healioo.com";
const BRAND = "인사이트랩";
const ADSENSE_CLIENT = "ca-pub-7143828779500885";

const CAT_NAMES = { food: "건강음식", info: "건강정보", exercise: "건강운동", diet: "다이어트", disease: "질환·병", life: "생활정보" };
const STATIC_PAGES = ["about.html", "contact.html", "terms.html", "privacy.html"];

const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inlineMd = t => {
  let s = esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\[([^\]]+)\]\((\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  return s;
};
const stripMd = t => String(t || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function todayKST() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

function figureHtml(ph, idx) {
  const alt = esc(ph.alt || "");
  const size = ph.width && ph.height ? ` width="${ph.width}" height="${ph.height}"` : "";
  const cap = ph.caption ? `\n          <figcaption>${esc(ph.caption)}</figcaption>` : "";
  return `        <figure class="article__figure">\n          <img src="${esc(ph.file)}" alt="${alt}"${size} loading="${idx === 0 ? "eager" : "lazy"}">${cap}\n        </figure>`;
}

function parseBlocks(md) {
  const lines = String(md || "").split(/\r?\n/);
  const blocks = []; let ul = null, ol = null, tbl = null;
  const flush = () => {
    if (ul) { blocks.push({ t: "ul", items: ul }); ul = null; }
    if (ol) { blocks.push({ t: "ol", items: ol }); ol = null; }
    if (tbl) { blocks.push({ t: "table", rows: tbl }); tbl = null; }
  };
  for (const ln of lines) {
    const s = ln.trim();
    if (!s) { flush(); continue; }
    let m;
    if ((m = s.match(/^###\s+(.*)/))) { flush(); blocks.push({ t: "h3", text: m[1] }); }
    else if ((m = s.match(/^##\s+(.*)/))) { flush(); blocks.push({ t: "h2", text: m[1] }); }
    else if (/^\|.*\|\s*$/.test(s)) { if (ul || ol) flush(); if (!tbl) tbl = []; tbl.push(s); }
    else if ((m = s.match(/^[-*]\s+(.*)/))) { if (ol || tbl) flush(); if (!ul) ul = []; ul.push(m[1]); }
    else if ((m = s.match(/^\d+[.)]\s+(.*)/))) { if (ul || tbl) flush(); if (!ol) ol = []; ol.push(m[1]); }
    else if (/^>\s?/.test(s)) { flush(); blocks.push({ t: "p", text: s.replace(/^>\s?/, "") }); }
    else { flush(); blocks.push({ t: "p", text: s }); }
  }
  flush();
  return blocks;
}

function tableHtml(rowsRaw) {
  const cells = r => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim());
  const rows = rowsRaw.filter(r => !/^\s*\|[\s:|-]+\|\s*$/.test(r));
  if (!rows.length) return "";
  const head = cells(rows[0]), body = rows.slice(1).map(cells);
  let t = '<div class="table-scroll"><table class="md-table"><thead><tr>' + head.map(c => `<th>${inlineMd(c)}</th>`).join("") + "</tr></thead><tbody>";
  t += body.map(r => "<tr>" + r.map(c => `<td>${inlineMd(c)}</td>`).join("") + "</tr>").join("");
  return t + "</tbody></table></div>";
}

function keyboxHtml(a) {
  if (!a.keyPoints || !a.keyPoints.length) return "";
  const items = a.keyPoints.map(k => `            <li>${inlineMd(k)}</li>`).join("\n");
  return `        <div class="keybox">\n          <h2>${esc(a.keyboxTitle || "먼저 핵심만")}</h2>\n          <ol>\n${items}\n          </ol>\n        </div>`;
}

function buildBody(a) {
  const blocks = parseBlocks(a.bodyMd || a.body || "");
  const photos = a.photos || [];
  const out = [];
  const hero = photos[0], extra = photos.slice(1);
  if (hero) out.push(figureHtml(hero, 0));

  // 리드 문단: lead 필드가 있으면 사용, 없으면 본문 첫 문단을 리드로
  let leadDone = false;
  if (a.lead) { out.push(`        <p class="article__lead">${inlineMd(a.lead)}</p>`); leadDone = true; }
  const kb = keyboxHtml(a);
  if (kb && leadDone) out.push(kb);

  // 본문 사진: H2 소제목 아래에 고르게 배치 (첫 H2는 요약 박스 바로 뒤라 건너뛰고 2번째부터)
  const h2s = blocks.map((b, i) => (b.t === "h2" ? i : -1)).filter(i => i >= 0);
  const place = {};
  if (extra.length && h2s.length) {
    const cand = h2s.length > extra.length ? h2s.slice(1) : h2s;
    const step = cand.length / extra.length;
    extra.forEach((ph, k) => { place[cand[Math.min(cand.length - 1, Math.floor(k * step + step / 2))]] = ph; });
  }

  blocks.forEach((b, i) => {
    if (b.t === "h2") { out.push(`        <h2>${inlineMd(b.text)}</h2>`); if (place[i]) out.push(figureHtml(place[i], 1)); }
    else if (b.t === "h3") out.push(`        <h3>${inlineMd(b.text)}</h3>`);
    else if (b.t === "ul") out.push("        <ul>" + b.items.map(x => `<li>${inlineMd(x)}</li>`).join("") + "</ul>");
    else if (b.t === "ol") out.push("        <ol>" + b.items.map(x => `<li>${inlineMd(x)}</li>`).join("") + "</ol>");
    else if (b.t === "table") out.push("        " + tableHtml(b.rows));
    else if (!leadDone) {
      out.push(`        <p class="article__lead">${inlineMd(b.text)}</p>`); leadDone = true;
      if (kb) out.push(kb);
    } else out.push(`        <p>${inlineMd(b.text)}</p>`);
  });

  if (a.disclaimer) out.push(`        <p class="disclaimer">※ ${inlineMd(a.disclaimer.replace(/^※\s*/, ""))}</p>`);
  return out.join("\n");
}

function pageHtml(a) {
  const catName = CAT_NAMES[a.category] || "건강정보";
  const seoTitle = a.seoTitle || a.title;
  const hero = (a.photos || [])[0];
  const ogImage = hero ? BASE + hero.file : "";
  const kw = (a.keywords || []).join(", ");
  const url = `${BASE}/posts/${a.slug}.html`;
  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.description,
    image: ogImage ? [ogImage] : undefined,
    datePublished: a.date, dateModified: a.modified || a.date,
    articleSection: catName, keywords: kw || undefined, inLanguage: "ko-KR",
    author: { "@type": "Organization", name: BRAND, url: BASE + "/" },
    publisher: { "@type": "Organization", name: BRAND, url: BASE + "/" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url }
  };
  const ldJson = JSON.stringify(ld, null, 2).replace(/</g, "\\u003c").split("\n").map(l => "  " + l).join("\n");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seoTitle)} · ${BRAND}</title>
  <meta name="description" content="${esc(a.description)}">
  <meta name="keywords" content="${esc(kw)}">
  <link rel="canonical" href="${url}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${esc(a.ogTitle || a.title)}">
  <meta property="og:description" content="${esc(a.ogDescription || a.description)}">
  <meta property="og:url" content="${url}">
${ogImage ? `  <meta property="og:image" content="${ogImage}">\n` : ""}  <meta property="article:published_time" content="${esc(a.date)}">
  <meta property="article:section" content="${esc(catName)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

  <script type="application/ld+json">
${ldJson}
  </script>
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}"
          crossorigin="anonymous"></script>
  <script defer src="/js/analytics.js"></script>
</head>
<body data-cat="${esc(a.category)}">
  <header id="site-header"></header>

  <main class="wrap">
    <article class="article">
      <span class="article__cat">${esc(catName)}</span>
      <h1 class="article__title">${esc(a.title)}</h1>
      <div class="article__meta">${BRAND} · ${esc(a.date)}</div>

      <div class="article__body">
${buildBody(a)}
      </div>

      <div class="article__nav"><a class="btn" href="/category.html?cat=${esc(a.category)}">‹ ${esc(catName)} 목록</a> <a class="btn" href="/">홈으로</a></div>
    </article>
  </main>

  <footer id="site-footer"></footer>

  <script src="/js/posts.js"></script>
  <script src="/js/site.js"></script>
</body>
</html>
`;
}

/* js/posts.js 를 그대로 실행해 POSTS 배열을 읽는다 */
function readPosts() {
  const src = fs.readFileSync(path.join(ROOT, "js", "posts.js"), "utf8");
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  return ctx.window.POSTS || [];
}

/* js/posts.js POSTS 배열 맨 위에 추가(같은 id면 기존 항목 제거 후 맨 위로) */
function updatePostsJs(a) {
  const f = path.join(ROOT, "js", "posts.js");
  let src = fs.readFileSync(f, "utf8");
  const entry =
`  {
    id: ${JSON.stringify(a.slug)},
    title: ${JSON.stringify(a.title)},
    summary:
      ${JSON.stringify(a.summary || a.description || "")},
    category: ${JSON.stringify(a.category)},
    date: ${JSON.stringify(a.date)},
    url: ${JSON.stringify("/posts/" + a.slug + ".html")},
    image: ${JSON.stringify((a.photos && a.photos[0] && a.photos[0].file) || "")},
  },`;
  const idRe = new RegExp("\\n  \\{\\s*\\n\\s*id:\\s*[\"']" + a.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\"'][\\s\\S]*?\\n  \\},", "m");
  if (idRe.test(src)) src = src.replace(idRe, "");
  if (!src.includes("const POSTS = [\n")) throw new Error("js/posts.js 에서 'const POSTS = [' 를 찾지 못함");
  src = src.replace("const POSTS = [\n", "const POSTS = [\n" + entry + "\n");
  fs.writeFileSync(f, src);
}

/* sitemap.xml 전체 재생성 (홈·카테고리·필수 페이지·모든 글) */
function writeSitemap() {
  const posts = readPosts();
  const latest = posts.reduce((m, p) => (p.date > m ? p.date : m), "");
  const u = (loc, lastmod, freq, pri) =>
    `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
  const rows = [u(BASE + "/", latest, "daily", "1.0")];
  Object.keys(CAT_NAMES).forEach(c => rows.push(u(`${BASE}/category.html?cat=${c}`, latest, "daily", "0.8")));
  STATIC_PAGES.forEach(p => rows.push(u(`${BASE}/${p}`, "", "monthly", "0.3")));
  posts.forEach(p => rows.push(u(BASE + p.url, p.date, "monthly", "0.7")));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- scripts/factory-publish.js 가 js/posts.js 기준으로 자동 생성합니다. 직접 고치지 마세요. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
}

function publish(file) {
  const a = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!a.slug || !a.title) throw new Error(`${file}: slug/title 필수`);
  if (!CAT_NAMES[a.category]) throw new Error(`${file}: category 값 확인 (${a.category})`);
  a.date = a.date || todayKST();
  a.summary = a.summary || a.description || "";
  fs.writeFileSync(path.join(ROOT, "posts", a.slug + ".html"), pageHtml(a));
  updatePostsJs(a);
  console.log(`발행: posts/${a.slug}.html  (${CAT_NAMES[a.category]}, 사진 ${(a.photos || []).length}장)  ${BASE}/posts/${a.slug}.html`);
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) { console.error("usage: node scripts/factory-publish.js <article.json> [...] | --sitemap"); process.exit(1); }
  args.filter(x => x !== "--sitemap").forEach(publish);
  writeSitemap();
  console.log(`sitemap.xml 갱신 (글 ${readPosts().length}편)`);
}
if (require.main === module) main();
module.exports = { pageHtml, parseBlocks, buildBody, readPosts, writeSitemap, esc, stripMd, BASE, ROOT };
