/* 인사이트랩 자체 방문 분석 비콘.
 * 방문(페이지뷰)·유입경로·게시글·체류시간을 수집기(Apps Script 웹앱)로 전송.
 * navigator.sendBeacon 사용 → CORS 불필요, 페이지 이탈 시에도 전송 보장.
 * ★ 수집기(Apps Script 웹앱)를 배포한 뒤 아래 ENDPOINT 한 줄만 채우면 동작합니다.
 *   비어 있으면 아무 것도 전송하지 않습니다(안전). */
(function () {
  "use strict";
  // ▼▼▼ 인사이트랩(healioo.com) 전용 Apps Script 웹앱 /exec URL 을 여기에 붙여넣으세요 ▼▼▼
  var ENDPOINT = "";
  // ▲▲▲ 예: https://script.google.com/macros/s/AKfyc.../exec ▲▲▲
  if (!ENDPOINT) return;

  function rid() { return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)); }
  function get(k, store) { try { return store.getItem(k); } catch (e) { return null; } }
  function set(k, v, store) { try { store.setItem(k, v); } catch (e) {} }

  var visitorId = get("as_vid", localStorage);
  if (!visitorId) { visitorId = rid(); set("as_vid", visitorId, localStorage); }
  var now = Date.now();
  var sess = null;
  try { sess = JSON.parse(get("as_sess", sessionStorage) || "null"); } catch (e) {}
  if (!sess || (now - sess.t) > 30 * 60 * 1000) { sess = { id: rid(), t: now }; }
  sess.t = now; set("as_sess", JSON.stringify(sess), sessionStorage);
  var sessionId = sess.id;

  function source() {
    try {
      var q = new URLSearchParams(location.search);
      var us = q.get("utm_source");
      if (us) return (us + (q.get("utm_medium") ? "/" + q.get("utm_medium") : "")).toLowerCase();
      var r = document.referrer;
      if (!r) return "direct";
      var h = new URL(r).hostname.replace(/^www\./, "");
      if (location.hostname && h === location.hostname) return "internal";
      if (/(^|\.)t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/.test(h)) return "x";
      if (/daum\.net|kakao|tistory/.test(h)) return /tistory/.test(h) ? "tistory" : "daum";
      if (/naver\./.test(h)) return "naver";
      if (/google\./.test(h)) return "google";
      if (/bing\./.test(h)) return "bing";
      if (/zum\./.test(h)) return "zum";
      return h;
    } catch (e) { return "direct"; }
  }

  var basePayload = {
    v: visitorId, s: sessionId,
    p: location.pathname, ti: (document.title || "").slice(0, 160),
    r: (document.referrer || "").slice(0, 300), src: source(),
    dev: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "m" : "d"
  };

  function send(obj) {
    try {
      var body = JSON.stringify(obj);
      if (navigator.sendBeacon) { navigator.sendBeacon(ENDPOINT, body); }
      else { fetch(ENDPOINT, { method: "POST", body: body, mode: "no-cors", keepalive: true }); }
    } catch (e) {}
  }

  send(Object.assign({ t: "pv", ts: now }, basePayload));

  var activeMs = 0, lastResume = document.visibilityState === "visible" ? Date.now() : 0;
  var dwellSent = false;
  function accumulate() { if (lastResume) { activeMs += Date.now() - lastResume; lastResume = 0; } }
  function resume() { if (!lastResume) lastResume = Date.now(); }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { accumulate(); flush(); } else { resume(); }
  });
  function flush() {
    if (dwellSent) return; dwellSent = true;
    accumulate();
    if (activeMs < 300) return;
    send({ t: "dw", ts: Date.now(), v: visitorId, s: sessionId, p: basePayload.p, ms: Math.min(activeMs, 1800000) });
  }
  window.addEventListener("pagehide", flush);
  window.asTrack = function (type, path) {
    send({ t: String(type || "ev"), ts: Date.now(), v: visitorId, s: sessionId, p: path || basePayload.p, src: basePayload.src });
  };
})();
