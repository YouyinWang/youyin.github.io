(function () {
  "use strict";

  var SETS = window.TOEFL_SETS;
  var app = document.getElementById("app");
  var STORE_KEY = "toefl-practice-v1";
  var SKILLS = { reading: "阅读", listening: "听力", writing: "写作", speaking: "口语" };
  var TYPE_SKILL = { vocab: null, cw: "reading", read: "reading", lcr: "listening", listen: "listening", bas: "writing", email: "writing", discussion: "writing", repeat: "speaking", interview: "speaking" };
  var LETTERS = "ABCD";

  /* ---------- storage ---------- */
  function load() {
    try { var s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && typeof s === "object") return fill(s); } catch (e) {}
    return fill({});
  }
  function fill(s) { s.results = s.results || {}; s.drafts = s.drafts || {}; s.settings = s.settings || { rate: 0.95 }; return s; }
  var store = load();
  var dbDoc = null, dbTimer = null;
  function saveLocal() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} }
  function save() {
    store.ts = Date.now();
    saveLocal();
    if (!dbDoc) return;
    clearTimeout(dbTimer);
    dbTimer = setTimeout(pushRemote, 1200);
  }
  var pushing = false, pushAgain = false;
  function pushRemote() {
    if (!dbDoc) return;
    if (pushing) { pushAgain = true; return; }
    pushing = true;
    dbDoc.set({ results: store.results, drafts: store.drafts, settings: store.settings, ts: store.ts || Date.now() })
      .catch(function () {})
      .then(function () { pushing = false; if (pushAgain) { pushAgain = false; pushRemote(); } });
  }
  function caps(name) { try { return window.claude && window.claude.use ? window.claude.use(name).catch(function () { return null; }) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } }
  var sampleFn = null, ttsCap = null, dict = null;
  caps("db").then(function (db) {
    if (!db) return;
    dbDoc = db.doc("state/main");
    dbDoc.get().then(function (snap) {
      var r = snap.exists ? snap.data() : null;
      if (r && (r.ts || 0) > (store.ts || 0)) {
        store = fill({ results: r.results || {}, drafts: r.drafts || {}, settings: r.settings || store.settings, ts: r.ts });
        saveLocal();
        if (!run) render();
      } else if (Object.keys(store.results).length || Object.keys(store.drafts).length) { pushRemote(); }
    }).catch(function () {});
  });
  caps("sample").then(function (s) { sampleFn = s; if (!run) render(); });
  caps("tts").then(function (t) { ttsCap = t; });
  caps("dictation").then(function (d) {
    if (!d) return;
    dict = d;
    d.onFinal(function (e) { if (recHandlers) recHandlers.onFinal(e.text); });
    d.onPartial(function (e) { if (recHandlers && recHandlers.onPartial) recHandlers.onPartial(e.text); });
    d.onState(function (e) { if (e.state === "idle" && recHandlers) { var h0 = recHandlers; recHandlers = null; activeRec = null; h0.onEnd(e.reason === "not_granted" ? "denied" : (e.reason === "upstream_error" || e.reason === "unavailable") ? "error" : "done"); } });
    if (!run) render();
  });

  /* ---------- helpers ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function roundHalf(x) { return Math.round(x * 2) / 2; }
  function clampBand(x) { return Math.max(1, Math.min(6, x)); }
  function fracToBand(p) { return clampBand(roundHalf(1 + 5 * p)); }
  function cefr(b) { return b >= 6 ? "C2" : b >= 5 ? "C1" : b >= 4 ? "B2" : b >= 3 ? "B1" : b >= 2 ? "A2" : "A1"; }
  function fmtBand(b) { return b == null ? "–" : b.toFixed(1); }
  function txt(v) { return typeof v === "string" ? v : ""; }
  function words(s) { return txt(s).trim().split(/\s+/).filter(Boolean).length; }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }
  function getSet(id) {
    if (id === "placement") return SETS.placement;
    for (var i = 0; i < SETS.days.length; i++) if (SETS.days[i].id === id) return SETS.days[i];
    return null;
  }

  /* ---------- speech out ---------- */
  var synth = window.speechSynthesis || null;
  var voices = [];
  function loadVoices() {
    if (!synth) return;
    var all = synth.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    all.sort(function (a, b) { return score(b) - score(a); });
    function score(v) { var s = 0; if (/en-US/i.test(v.lang)) s += 4; if (/Google|Natural|Premium|Enhanced|Samantha|Aria|Jenny|Guy/i.test(v.name)) s += 3; if (v.localService) s += 1; return s; }
    voices = all;
  }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice(idx) {
    if (!voices.length) return null;
    var key = idx === 1 ? "voice1" : "voice0";
    var chosen = store.settings[key];
    if (chosen) for (var i = 0; i < voices.length; i++) if (voices[i].name === chosen) return voices[i];
    if (idx === 1) {
      for (var j = 1; j < voices.length; j++) if (voices[j].name !== (voices[0] && voices[0].name)) return voices[j];
    }
    return voices[0];
  }
  function splitSentences(text) { return text.match(/[^.!?]+[.!?]*\s*/g) || [text]; }
  function speak(lines) {
    if (typeof lines === "string") lines = [{ text: lines, v: 0 }];
    if (ttsCap) {
      var rate = Math.max(0.7, Math.min(1.5, store.settings.rate || 0.95));
      return ttsCap.speak(lines.map(function (l) { return { text: l.text, voice: l.v === 1 ? "rounded" : "buttery", rate: rate, language: "en" }; }))
        .catch(function (e) { if (e && (e.code === "not_granted" || e.code === "unavailable")) { ttsCap = null; return speak(lines); } });
    }
    if (!synth) return Promise.reject(new Error("no-tts"));
    synth.cancel();
    var queue = [];
    lines.forEach(function (l) { splitSentences(l.text).forEach(function (s) { queue.push({ text: s.trim(), v: l.v || 0 }); }); });
    return new Promise(function (resolve) {
      var left = queue.length;
      queue.forEach(function (q) {
        var u = new SpeechSynthesisUtterance(q.text);
        var voice = pickVoice(q.v);
        if (voice) u.voice = voice;
        u.lang = voice ? voice.lang : "en-US";
        u.rate = store.settings.rate || 0.95;
        if (q.v === 1 && voices.length < 2) u.pitch = 0.8;
        u.onend = u.onerror = function () { left--; if (left <= 0) resolve(); };
        synth.speak(u);
      });
      if (!queue.length) resolve();
    });
  }

  /* ---------- speech in: Claude dictation if present, else the browser's speech recognition ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var activeRec = null, recHandlers = null;
  function canDictate() { return !!dict || !!SR; }
  function stopRec() {
    if (!activeRec) return;
    if (activeRec.sr) activeRec.stopAll();
    else if (dict) dict.stop().catch(function () {});
  }
  /* opts: continuous, onFinal(text), onPartial(text), onEnd(reason) — call straight from a click */
  function startRec(opts) {
    if (dict) {
      recHandlers = opts;
      activeRec = { on: true };
      dict.start().catch(function (e) {
        if (recHandlers === opts) { recHandlers = null; activeRec = null; opts.onEnd(e && e.code === "not_granted" ? "denied" : "error"); }
      });
      return activeRec;
    }
    if (!SR) { opts.onEnd("error"); return null; }
    /* Safari 的网页识别在停顿时会自己结束，所以一直用连续模式，结束了就接着重开；
       每次都从头拼出本轮全部结果，避免 Safari 重复返回同一段文字。 */
    var stopped = false, rec = null, committed = "", session = "", silenceT = null, heard = false;
    function join(a2, b2) { a2 = a2.trim(); b2 = b2.trim(); return a2 && b2 ? a2 + " " + b2 : a2 || b2; }
    function emit(interim) { if (opts.onText) opts.onText(join(committed, session), interim); }
    function finish(reason) {
      if (stopped) return; stopped = true; clearTimeout(silenceT);
      committed = join(committed, session); session = "";
      if (opts.onText) opts.onText(committed, "");
      if (activeRec === ctl) activeRec = null;
      opts.onEnd(reason);
    }
    function armSilence() {
      if (!opts.autoStopMs) return;
      clearTimeout(silenceT);
      silenceT = setTimeout(function () { if (heard) ctl.stopAll(); }, opts.autoStopMs);
    }
    function make() {
      rec = new SR();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      session = "";
      rec.onresult = function (e) {
        var fin = "", interim = "";
        for (var i = 0; i < e.results.length; i++) {
          var r = e.results[i];
          if (r.isFinal) fin = join(fin, r[0].transcript); else interim = join(interim, r[0].transcript);
        }
        session = join(fin, interim);
        heard = heard || !!session;
        emit(interim);
        armSilence();
      };
      rec.onerror = function (e) {
        if (e.error === "no-speech" || e.error === "aborted") return;
        try { rec.abort(); } catch (x) {}
        finish(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "network" ? "network" : "error");
      };
      rec.onend = function () {
        if (stopped) return;
        committed = join(committed, session); session = "";
        setTimeout(function () { if (stopped) return; try { make(); } catch (x) { finish("done"); } }, 60);
      };
      rec.start();
    }
    var ctl = { sr: true, stopAll: function () { if (stopped) return; try { rec && rec.stop(); } catch (x) {} setTimeout(function () { finish("stopped"); }, 700); } };
    activeRec = ctl;
    try { make(); } catch (e) { finish("error"); return null; }
    if (opts.autoStopMs) { silenceT = setTimeout(function () { if (!heard) ctl.stopAll(); }, 8000); }
    return ctl;
  }

  /* ---------- scoring ---------- */
  var NUM = { "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve", "15": "fifteen", "20": "twenty" };
  function normTokens(s) {
    return (s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean).map(function (w) { return NUM[w] || w; });
  }
  function lcs(a, b) {
    var dp = []; for (var i = 0; i <= a.length; i++) { dp.push(new Array(b.length + 1).fill(0)); }
    for (i = 1; i <= a.length; i++) for (var j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[a.length][b.length];
  }
  function repeatAccuracy(target, said) {
    var t = normTokens(target), s = normTokens(said);
    if (!t.length || !s.length) return 0;
    var m = lcs(t, s);
    var extra = Math.max(0, s.length - t.length);
    return Math.max(0, (m - extra * 0.5) / t.length);
  }
  function parseCw(text) {
    var parts = [], re = /\{\{([^|}]*)\|([^}]*)\}\}/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ t: text.slice(last, m.index) });
      var alts = m[2].split("/");
      parts.push({ pre: m[1], ans: alts, len: alts[0].length });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ t: text.slice(last) });
    return parts;
  }
  function basText(chunks, order, end) { return order.map(function (i) { return chunks[i]; }).join(" ") + (end || ""); }

  function scoreRun(set, ans) {
    var tally = { reading: [0, 0], listening: [0, 0], writing: [0, 0], speaking: [0, 0] };
    var review = [];
    set.sections.forEach(function (sec, si) {
      var a = ans[si] || {};
      var sk = TYPE_SKILL[sec.type];
      if (sec.type === "cw") {
        parseCw(sec.text).filter(function (p) { return p.ans; }).forEach(function (p, bi) {
          var got = ((a.v || [])[bi] || "").trim().toLowerCase();
          var ok = p.ans.some(function (x) { return x.toLowerCase() === got; });
          tally[sk][1]++; if (ok) tally[sk][0]++;
          if (!ok) review.push({ sec: sec.title, ok: false, q: "补全：" + p.pre + "____", yours: got ? p.pre + got : "（空）", right: p.pre + p.ans[0] });
        });
      } else if (sec.type === "read" || sec.type === "listen") {
        sec.questions.forEach(function (q, qi) {
          var got = (a.v || [])[qi];
          var ok = got === q.answer;
          tally[sk][1]++; if (ok) tally[sk][0]++;
          if (!ok) review.push({ sec: sec.title, ok: false, q: q.q, yours: got == null ? "（未作答）" : LETTERS[got] + ". " + q.options[got], right: LETTERS[q.answer] + ". " + q.options[q.answer], script: sec.type === "listen" ? sec.lines.map(function (l) { return l.who + ": " + l.text; }).join("\n") : null });
        });
      } else if (sec.type === "lcr") {
        sec.items.forEach(function (it, ii) {
          var got = (a.v || [])[ii];
          var ok = got === it.answer;
          tally[sk][1]++; if (ok) tally[sk][0]++;
          if (!ok) review.push({ sec: sec.title, ok: false, q: "听到：" + it.audio, yours: got == null ? "（未作答）" : LETTERS[got] + ". " + it.options[got], right: LETTERS[it.answer] + ". " + it.options[it.answer] });
        });
      } else if (sec.type === "bas") {
        sec.items.forEach(function (it, ii) {
          var order = (a.v || [])[ii] || [];
          var right = it.chunks.join(" ") + it.end;
          var yours = order.length ? basText(it.chunks, order, it.end) : "";
          var ok = yours.toLowerCase() === right.toLowerCase();
          tally[sk][1]++; if (ok) tally[sk][0]++;
          if (!ok) review.push({ sec: sec.title, ok: false, q: it.context, yours: yours || "（未作答）", right: right });
        });
      } else if (sec.type === "repeat") {
        sec.items.forEach(function (it, ii) {
          var said = (a.v || [])[ii] || "";
          var acc = repeatAccuracy(it, said);
          tally[sk][1]++; tally[sk][0] += acc;
          if (acc < 0.9) review.push({ sec: sec.title, ok: false, q: "原句：" + it, yours: said || "（未作答）", right: "准确率 " + Math.round(acc * 100) + "%" });
        });
      }
    });
    var bands = {};
    for (var k in tally) bands[k] = tally[k][1] ? fracToBand(tally[k][0] / tally[k][1]) : null;
    return { tally: tally, bands: bands, review: review };
  }
  function finalBands(res) {
    var b = res.score.bands, c = res.claude || {};
    var out = { reading: b.reading, listening: b.listening, writing: b.writing, speaking: b.speaking };
    if (c.writing) out.writing = b.writing == null ? c.writing : roundHalf(0.3 * b.writing + 0.7 * c.writing);
    if (c.speaking) out.speaking = b.speaking == null ? c.speaking : roundHalf(0.4 * b.speaking + 0.6 * c.speaking);
    var vals = [out.reading, out.listening, out.writing, out.speaking].filter(function (x) { return x != null; });
    out.overall = vals.length ? roundHalf(vals.reduce(function (s, x) { return s + x; }, 0) / vals.length) : null;
    out.pending = !c.writing || !c.speaking;
    return out;
  }

  function claudeRequest(set, res) {
    var lines = [
      "你是新托福（2026 年 1 月起的新版 TOEFL iBT）写作和口语阅卷老师。请按新版 1–6 分制（0.5 一档；6≈C2，5≈C1，4≈B2，3≈B1，2≈A2，1≈A1）批改我下面的作答。",
      "写作：邮件看是否完成全部要点、语气得体、语法用词准确；学术讨论看是否表明观点、回应同学、理由和例子是否充分。字数明显不足要扣分，未作答记 1 分。",
      "口语：内容是语音输入转成的文字，可能有识别错误，不要因个别识别错误扣分，也无法评价发音。看是否切题、有观点+理由+例子、长度是否够（45 秒约 70–100 词）、语法和用词。未作答记 1 分。",
      "请用简体中文回复：1）写作分数、总体评价、最多 3 个最重要的问题（附原句→改正）、一篇改写后的高分范文；2）口语分数、评价、建议、一段高分回答示范；3）明天最值得练的一件事。",
      "回复的最后一行必须严格按这个格式写：【分数】写作 X；口语 Y（X、Y 是 1–6 之间的数字，可以带 .5）",
      "", "【" + set.title + " · " + res.date + "】", ""];
    var ans = res.answers;
    set.sections.forEach(function (sec, si) {
      var a = ans[si] || {};
      if (sec.type === "email") {
        lines.push("## 写邮件（" + sec.minutes + " 分钟）", "题目：" + sec.prompt, "要点：" + sec.points.join(" / "), "我的作答（" + words(a.v) + " 词）：", txt(a.v) || "（未作答）", "");
      } else if (sec.type === "discussion") {
        lines.push("## 学术讨论（" + sec.minutes + " 分钟）", "教授：" + sec.professor);
        sec.posts.forEach(function (p) { lines.push(p.name + "：" + p.text); });
        lines.push("我的作答（" + words(a.v) + " 词）：", txt(a.v) || "（未作答）", "");
      } else if (sec.type === "interview") {
        lines.push("## 口语模拟面试（每题 " + sec.seconds + " 秒，以下为语音转写）");
        sec.items.forEach(function (q, qi) { lines.push("问题 " + (qi + 1) + "：" + q, "我的回答：" + (((a.v || [])[qi]) || "（未作答）")); });
        lines.push("");
      }
    });
    var b = res.score.bands;
    lines.push("## 网站自动判分（供参考）", "阅读 " + fmtBand(b.reading) + "，听力 " + fmtBand(b.listening) + "，连词成句折算 " + fmtBand(b.writing) + "，跟读折算 " + fmtBand(b.speaking));
    return lines.join("\n");
  }

  /* ---------- progress helpers ---------- */
  function latestPlacement() { return store.results.placement || null; }
  function nextDay() {
    for (var i = 0; i < SETS.days.length; i++) if (!store.results[SETS.days[i].id]) return SETS.days[i];
    return null;
  }
  function doneToday() {
    for (var i = 0; i < SETS.days.length; i++) { var r = store.results[SETS.days[i].id]; if (r && r.date === today()) return SETS.days[i]; }
    return null;
  }
  function weakest(fb) {
    var w = null;
    ["reading", "listening", "writing", "speaking"].forEach(function (k) { if (fb[k] != null && (w == null || fb[k] < fb[w])) w = k; });
    return w;
  }

  /* ---------- views ---------- */
  function ruler(band) {
    var pin = band == null ? null : h("div", { class: "ruler-pin", style: "left:" + ((band - 1) / 5 * (100 - 100 / 6) + 100 / 12) + "%" }, fmtBand(band) + " · " + cefr(band));
    return h("div", { class: "ruler" }, pin, h("div", { class: "ruler-track" }, ["1 A1", "2 A2", "3 B1", "4 B2", "5 C1", "6 C2"].map(function (t) { return h("span", null, t); })));
  }
  function skillTiles(fb, pending) {
    return h("div", { class: "skills" }, Object.keys(SKILLS).map(function (k) {
      var isPending = pending && (k === "writing" || k === "speaking");
      return h("div", { class: "skill" }, h("span", { class: "muted small" }, SKILLS[k]), h("b", null, fmtBand(fb[k])), isPending ? h("span", { class: "tag" }, "初估，待批改") : null);
    }));
  }

  function viewHome() {
    var p = latestPlacement();
    var nd = nextDay();
    var dt = doneToday();
    var parts = [];
    if (!p) {
      parts.push(h("section", { class: "hero" },
        h("span", { class: "eyebrow" }, "2026 新版托福 · 1–6 分制"),
        h("h1", null, "先做一次摸底测试"),
        h("p", null, "约 30 分钟，覆盖新托福的 9 种题型。阅读、听力自动判分，写作、口语用你自己常用的 AI 批改。之后每天打开这里，按顺序做当天的任务就行。")),
        h("div", { class: "card" },
          h("div", { class: "eyebrow" }, "测试内容"),
          h("div", { class: "small muted" }, SETS.placement.sections.map(function (s) { return s.title; }).join(" · ")),
          h("div", { class: "hint" }, "请在能出声的地方做：听力题会朗读英文。口语题用手机键盘的语音输入作答，不方便说话时也可以打字。"),
          h("div", { class: "row" }, h("a", { class: "btn primary big", href: "#run-placement" }, "开始摸底测试"), h("a", { class: "btn", href: "#settings" }, "先试一下声音"))));
    } else {
      var fb = finalBands(p);
      parts.push(h("section", { class: "hero" },
        h("span", { class: "eyebrow" }, "我的水平"),
        h("h1", null, "总分 " + fmtBand(fb.overall) + "，约 " + cefr(fb.overall)),
        h("p", null, fb.pending ? "写作、口语还是初估分。到测试结果页，按提示用你的 AI 批改，分数会自动更新。" : "最弱的是" + SKILLS[weakest(fb)] + "，每日任务里会多花些时间在这一项上。")));
      parts.push(h("div", { class: "card" }, ruler(fb.overall), skillTiles(fb, fb.pending), h("div", { class: "row" }, h("a", { class: "btn", href: "#result-placement" }, "查看摸底结果"))));
    }
    var st = streak();
    var dayCard = h("div", { class: "card" },
      st ? h("div", { class: "streak" }, h("b", { class: "mono" }, String(st)), h("span", null, "天连续打卡" + (st >= 7 ? "，保持住！" : ""))) : null,
      h("div", { class: "row", style: "justify-content:space-between" }, h("h2", null, "每日任务"), h("span", { class: "muted small mono" }, Object.keys(store.results).filter(function (k) { return k !== "placement"; }).length + " / " + SETS.days.length)),
      h("div", { class: "days" }, SETS.days.map(function (d, i) {
        var done = !!store.results[d.id];
        var cls = "day" + (done ? " done" : "") + (nd && nd.id === d.id ? " next" : "");
        return h("a", { class: cls, href: done ? "#result-" + d.id : "#run-" + d.id, title: d.title, "aria-label": d.title + (done ? "（已完成）" : "") }, String(i + 1));
      })));
    if (nd) {
      var sk = p ? weakest(finalBands(p)) : null;
      dayCard.appendChild(h("p", { class: "muted" }, dt ? "今天的任务已经完成。想多练可以提前做下一天。" : nd.title + "分三段，每段 10 分钟左右，可以分开在不同时间做，进度自动保存。"));
      var firstOpen = -1;
      dayCard.appendChild(h("div", { class: "segs" }, SEGS.map(function (g, k) {
        var done = segDone(nd.id, k);
        if (!done && firstOpen < 0) firstOpen = k;
        var isNext = !done && firstOpen === k && !dt;
        return h("a", { class: "seg" + (done ? " done" : "") + (isNext ? " next" : ""), href: "#run-" + nd.id + "-s" + k },
          h("span", { class: "seg-mark", "aria-hidden": "true" }, done ? "✓" : String(k + 1)),
          h("span", { class: "seg-body" }, h("b", null, g.name + " · 约 " + g.min + " 分钟"), h("span", { class: "small muted" }, g.desc)),
          h("span", { class: "seg-go" }, done ? "改答案" : isNext ? "开始" : "去做"));
      })));
    } else {
      dayCard.appendChild(h("p", { class: "muted" }, "这批 " + SETS.days.length + " 天的任务都做完了，新题会陆续更新。"));
    }
    parts.push(dayCard);
    var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
    if (!standalone && !store.settings.hideInstall) {
      var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      parts.push(h("div", { class: "card" }, h("h3", null, "把练习室放到手机桌面"),
        h("p", { class: "small muted" }, ios ? "用 Safari 打开本页，点底部的“分享”按钮，选“添加到主屏幕”。" : "在浏览器菜单里选“添加到主屏幕”或“安装应用”。在微信里打开的话，先点右上角“…”，选“在浏览器打开”。"),
        h("div", { class: "row" }, h("button", { class: "btn ghost", type: "button", onclick: function () { store.settings.hideInstall = true; save(); render(); } }, "知道了"))));
    }
    var hist = Object.keys(store.results).map(function (k) { return { k: k, r: store.results[k] }; }).sort(function (a, b) { return (b.r.ts || 0) - (a.r.ts || 0); });
    if (hist.length) {
      parts.push(h("div", { class: "card" }, h("h2", null, "练习记录"), h("div", { class: "list" }, hist.map(function (x) {
        var set = getSet(x.k); var fbx = finalBands(x.r);
        return h("div", { class: "list-row" }, h("div", null, h("div", null, set ? set.title : x.k), h("div", { class: "muted small" }, x.r.date)), h("div", { class: "row" }, h("span", { class: "mono" }, fmtBand(fbx.overall)), h("a", { class: "btn", href: "#result-" + x.k }, "查看")));
      }))));
    }
    return parts;
  }

  function viewSettings() {
    var rate = h("input", { type: "range", id: "rate", min: "0.7", max: "1.2", step: "0.05", value: String(store.settings.rate || 0.95) });
    var rateLbl = h("span", { class: "mono" }, (store.settings.rate || 0.95).toFixed(2) + "×");
    rate.addEventListener("input", function () { store.settings.rate = parseFloat(rate.value); rateLbl.textContent = store.settings.rate.toFixed(2) + "×"; save(); });
    function voiceSelect(key) {
      var sel = h("select", { id: key }, h("option", { value: "" }, "自动选择"), voices.map(function (v) { return h("option", { value: v.name, selected: store.settings[key] === v.name }, v.name + " (" + v.lang + ")"); }));
      sel.addEventListener("change", function () { store.settings[key] = sel.value || null; save(); });
      return sel;
    }
    var micOut = h("div", { class: "partial" }, canDictate() ? "" : "这个浏览器不支持网页语音识别（微信内置浏览器就不支持）。请用 Safari、Chrome 或 Edge 打开，或者用手机键盘的语音输入。");
    var micBtn = h("button", { class: "btn rec", type: "button", hidden: !canDictate() }, "测试麦克风");
    micBtn.addEventListener("click", function () {
      if (activeRec) { stopRec(); return; }
      micBtn.classList.add("on"); micBtn.textContent = "停止"; micOut.textContent = "请说一句英文……";
      startRec({ autoStopMs: 2500, onText: function (t) { if (t) micOut.textContent = "识别结果：" + t; }, onFinal: function (t) { micOut.textContent = "识别结果：" + t; }, onPartial: function (t) { if (t) micOut.textContent = t; }, onEnd: function (r) { micBtn.classList.remove("on"); micBtn.textContent = "测试麦克风"; if (r === "denied") micOut.textContent = "麦克风没有被允许。请在浏览器的网站设置里允许本网站使用麦克风。"; else if (r === "network") micOut.textContent = "语音识别服务连不上。国内网络下 Chrome 常见这个问题，可以换 Safari 或 Edge，或者用键盘的语音输入。"; else if (r === "error") micOut.textContent = "语音识别暂时不可用，口语题可以用键盘的语音输入。"; } });
    });
    var importBox = h("textarea", { class: "short", id: "importbox", placeholder: "把备份内容粘贴到这里" });
    return [
      h("section", { class: "hero" }, h("h1", null, "设置")),
      h("div", { class: "card" }, h("h2", null, "英文朗读"),
        synth || ttsCap ? null : h("div", { class: "hint" }, "这里不支持朗读。听力题会改为显示原文。"),
        h("div", { class: "row" }, h("span", null, "语速"), rate, rateLbl),
        h("div", { class: "row" }, h("span", null, "声音 1"), voiceSelect("voice0")),
        h("div", { class: "row" }, h("span", null, "声音 2（对话中的另一人）"), voiceSelect("voice1")),
        h("div", { class: "row" }, h("button", { class: "btn", type: "button", onclick: function () { speak([{ text: "Hi, I'm the student. Could you tell me when the library opens?", v: 0 }, { text: "Sure. It opens at nine in the morning.", v: 1 }]).catch(function () { toast("这个浏览器不能朗读"); }); } }, "试听"))),
      h("div", { class: "card" }, h("h2", null, "麦克风"), h("p", { class: "muted small" }, "口语题用浏览器的语音识别把你说的话转成文字。"), micBtn, micOut),
      h("div", { class: "card" }, h("h2", null, "备份记录"), h("p", { class: "muted small" }, "进度只保存在这台设备的浏览器里。换手机或清理浏览器数据前，先复制备份，到新设备上粘贴导入。"),
        h("div", { class: "row" },
          h("button", { class: "btn", type: "button", onclick: function () { copyText(JSON.stringify(store)).then(function (ok) { if (ok) toast("备份已复制"); else { importBox.value = JSON.stringify(store); importBox.select(); toast("已放进下面的框里，请手动复制"); } }); } }, "复制备份")),
        importBox,
        h("div", { class: "row" }, h("button", { class: "btn", type: "button", onclick: function () {
          try { var s = JSON.parse(importBox.value); if (!s || typeof s !== "object" || !s.results) throw 0; store = fill(s); save(); toast("已导入"); location.hash = "#home"; } catch (e) { toast("内容格式不对，请粘贴完整的备份"); }
        } }, "导入备份")))
    ];
  }

  /* ---------- runner ---------- */
  var run = null; // { set, step, answers, timers }
  var SEGS = [
    { name: "听读", desc: "词汇、补全单词、阅读、听力", types: ["vocab", "cw", "read", "lcr", "listen"], min: 15 },
    { name: "写作", desc: "连词成句、写邮件或学术讨论", types: ["bas", "email", "discussion"], min: 12 },
    { name: "口语", desc: "听句跟读、模拟面试", types: ["repeat", "interview"], min: 8 }
  ];
  function segRanges(set) {
    if (set.id === "placement") return null;
    return SEGS.map(function (g) {
      var idx = [];
      set.sections.forEach(function (sec, i) { if (g.types.indexOf(sec.type) >= 0) idx.push(i); });
      return idx;
    });
  }
  function segOf(set, si) { var r = segRanges(set); if (!r) return -1; for (var k = 0; k < r.length; k++) if (r[k].indexOf(si) >= 0) return k; return -1; }
  function segDone(setId, k) { var d = store.drafts[setId]; return !!(d && d.answers && d.answers["seg-" + k]); }
  function logActivity() { store.activity = store.activity || []; var t = today(); if (store.activity.indexOf(t) < 0) store.activity.push(t); if (store.activity.length > 400) store.activity.shift(); }
  function streak() {
    var days = {}; (store.activity || []).forEach(function (d) { days[d] = 1; });
    var n = 0, d = new Date();
    function key(x) { return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); }
    if (!days[key(d)]) d.setDate(d.getDate() - 1);
    while (days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function startRun(set) {
    var draft = store.drafts[set.id];
    run = { set: set, step: draft ? draft.step || 0 : 0, answers: draft ? draft.answers || {} : {}, seen: {} };
  }
  function persistDraft() { if (!run) return; store.drafts[run.set.id] = { step: run.step, answers: run.answers }; save(); }
  function A(si) { if (!run.answers[si]) run.answers[si] = { v: [] }; return run.answers[si]; }

  function viewRun(set) {
    if (!run || run.set.id !== set.id) startRun(set);
    var secs = set.sections, si = run.step, sec = secs[si];
    run.seen[si] = true;
    var skill = TYPE_SKILL[sec.type];
    var ranges = segRanges(set), k = segOf(set, si);
    var list = ranges ? ranges[k] : secs.map(function (_, i) { return i; });
    var pos = list.indexOf(si);
    var head = h("div", { class: "prog" },
      h("div", { class: "row", style: "justify-content:space-between" }, h("span", { class: "eyebrow" }, set.title + (ranges ? " · 第 " + (k + 1) + " 段 " + SEGS[k].name : "")), h("span", { class: "mono small muted" }, (pos + 1) + " / " + list.length)),
      h("div", { class: "prog-bar" }, h("i", { style: "width:" + ((pos + 1) / list.length * 100) + "%" })),
      h("div", { class: "steps" }, list.map(function (i, n) { return h("button", { type: "button", class: (i === si ? "cur" : "") + (run.seen[i] ? " seen" : ""), onclick: function () { go(i); } }, (n + 1) + " " + secs[i].title); })));
    var body = h("div", { class: "card" },
      h("div", { class: "row" }, skill ? h("span", { class: "skill-pill" }, SKILLS[skill]) : null, h("h2", null, sec.title)),
      renderSection(sec, si));
    var last = pos === list.length - 1;
    var others = ranges ? SEGS.filter(function (_, j) { return j !== k && !segDone(set.id, j); }).length : 0;
    var endBtn = !ranges ? h("button", { class: "btn primary", type: "button", onclick: finish }, "交卷")
      : others ? h("button", { class: "btn primary", type: "button", onclick: function () { finishSeg(k); } }, "完成这一段")
      : h("button", { class: "btn primary", type: "button", onclick: function () { run.answers["seg-" + k] = true; persistDraft(); finish(); } }, "完成并交卷");
    var nav = h("div", { class: "nav" },
      h("button", { class: "btn", type: "button", disabled: pos === 0, onclick: function () { go(list[pos - 1]); } }, "上一步"),
      last ? endBtn : h("button", { class: "btn primary", type: "button", onclick: function () { go(list[pos + 1]); } }, "下一步"));
    return [head, body, nav];
  }
  function go(i) { stopAll(); run.step = Math.max(0, Math.min(run.set.sections.length - 1, i)); persistDraft(); render(); window.scrollTo(0, 0); }
  function stopAll() { stopRec(); if (synth) synth.cancel(); if (ttsCap) { try { ttsCap.stop(); } catch (e) {} } clearInterval(run && run.tick); }
  function finishSeg(k) {
    stopAll();
    run.answers["seg-" + k] = true;
    logActivity();
    persistDraft();
    var setId = run.set.id;
    run = null;
    toast("第 " + (k + 1) + " 段完成，进度已保存");
    location.hash = "#home";
  }
  function finish() {
    stopAll();
    var set = run.set;
    var unanswered = 0;
    set.sections.forEach(function (sec, si) {
      var a = run.answers[si];
      if (sec.type === "vocab") return;
      if (!a || (Array.isArray(a.v) ? !a.v.some(function (x) { return x != null && x !== "" && !(Array.isArray(x) && !x.length); }) : !a.v)) unanswered++;
    });
    if (unanswered && !run.confirmFinish && !segRanges(set)) { run.confirmFinish = true; toast("还有 " + unanswered + " 个部分没作答。再点一次“交卷”确认提交。"); return; }
    logActivity();
    var res = { date: today(), ts: Date.now(), answers: run.answers, score: scoreRun(set, run.answers), claude: (store.results[set.id] || {}).claude || {} };
    store.results[set.id] = res;
    delete store.drafts[set.id];
    save();
    run = null;
    location.hash = "#result-" + set.id;
  }

  function playButton(label, getLines, maxPlays, key, onPlayed) {
    var plays = run.answers["plays-" + key] || 0;
    var btn = h("button", { class: "btn", type: "button" });
    function upd() { btn.textContent = plays >= maxPlays ? "已播放 " + plays + " 次" : label + (plays ? "（再听一次）" : ""); btn.disabled = plays >= maxPlays; }
    upd();
    btn.addEventListener("click", function () {
      if (!synth && !ttsCap) { if (onPlayed) onPlayed(true); return; }
      plays++; run.answers["plays-" + key] = plays; persistDraft(); upd();
      btn.textContent = "播放中……";
      speak(getLines()).then(function () { upd(); if (onPlayed) onPlayed(false); }, function () { upd(); if (onPlayed) onPlayed(true); });
    });
    return btn;
  }
  function options(opts, getSel, setSel) {
    var wrap = h("div", { class: "opts" });
    function draw() {
      wrap.textContent = "";
      opts.forEach(function (o, oi) {
        wrap.appendChild(h("button", { type: "button", class: "opt" + (getSel() === oi ? " sel" : ""), onclick: function () { setSel(oi); persistDraft(); draw(); } }, h("span", { class: "lt" }, LETTERS[oi]), h("span", null, o)));
      });
    }
    draw();
    return wrap;
  }
  function micArea(opts) {
    // opts: get(), set(text), continuous, seconds, label
    var ta = h("textarea", { class: "short", placeholder: canDictate() ? "点“开始说”后，你说的话会显示在这里。" : "点输入框，用手机键盘上的麦克风（语音输入）说英文。", spellcheck: "false" });
    ta.value = opts.get() || "";
    ta.addEventListener("input", function () { opts.set(ta.value); persistDraft(); });
    var partial = h("div", { class: "partial" });
    var timer = opts.seconds ? h("span", { class: "timer" }, opts.seconds + "s") : null;
    var btn = h("button", { class: "btn rec", type: "button", hidden: !canDictate() }, opts.label || "开始说");
    var startTimerBtn = h("button", { class: "btn", type: "button", hidden: canDictate() || !opts.seconds }, "开始计时");
    var ctl = null, left = opts.seconds;
    function end() {
      btn.classList.remove("on"); btn.textContent = opts.label || "开始说"; partial.textContent = "";
      clearInterval(run.tick); ctl = null;
    }
    btn.addEventListener("click", function () {
      if (ctl) { stopRec(); return; }
      if (!canDictate()) { ta.focus(); return; }
      if (opts.clear) { ta.value = ""; opts.set(""); }
      var base = ta.value.trim();
      btn.classList.add("on"); btn.textContent = "停止";
      ctl = startRec({
        continuous: !!opts.continuous,
        autoStopMs: opts.continuous ? 0 : 2500,
        onText: function (full) { ta.value = base && full ? base + " " + full : base || full; opts.set(ta.value); persistDraft(); },
        onFinal: function (t) { ta.value = (ta.value ? ta.value + " " : "") + t; opts.set(ta.value); persistDraft(); },
        onPartial: function (t) { partial.textContent = t; },
        onEnd: function (r) {
          end();
          if (r === "denied") toast("麦克风没有被允许。请在浏览器设置里允许本网站使用麦克风，或用键盘的语音输入作答。");
          else if (r === "network") toast("语音识别服务连不上（国内网络下 Chrome 常见）。请换 Safari/Edge，或用键盘的语音输入作答。");
          else if (r === "error") toast("语音识别不可用，请用键盘的语音输入作答");
        }
      });
      if (ctl && SR && !dict) partial.textContent = opts.continuous ? "正在听……" : "正在听……说完停顿两秒会自动结束";
      if (opts.seconds && ctl) runTimer();
    });
    function runTimer() {
        left = opts.seconds; timer.textContent = left + "s"; timer.classList.remove("out");
        clearInterval(run.tick);
        run.tick = setInterval(function () {
          left--; timer.textContent = Math.max(0, left) + "s";
          if (left <= 0) { timer.classList.add("out"); clearInterval(run.tick); setTimeout(stopRec, 600); }
        }, 1000);
    }
    startTimerBtn.addEventListener("click", function () { if (opts.clear) { ta.value = ""; opts.set(""); } runTimer(); ta.focus(); });
    return h("div", { class: "stack" }, h("div", { class: "row" }, btn, startTimerBtn, timer), partial, ta,
      h("div", { class: "small muted" }, canDictate()
        ? (opts.continuous ? "识别错的词可以在框里改。觉得网页识别不准，也可以点输入框，用键盘上的麦克风说（iPhone 自带听写通常更准）。" : "说完停顿两秒会自动结束。跟读题请不要手动改字，准确率才真实。")
        : "提示：在手机上点输入框，再点键盘上的麦克风图标，把输入语言切到英文，直接开口说。"));
  }
  function writingTimer(minutes, ta, si) {
    var t = h("span", { class: "timer" });
    var a = A(si);
    if (!a.start) { a.start = Date.now(); persistDraft(); }
    function upd() {
      var left = Math.round(minutes * 60 - (Date.now() - a.start) / 1000);
      var m = Math.floor(Math.abs(left) / 60), s = Math.abs(left) % 60;
      t.textContent = (left < 0 ? "超时 " : "剩余 ") + m + ":" + String(s).padStart(2, "0");
      t.classList.toggle("out", left < 0);
    }
    upd(); clearInterval(run.tick); run.tick = setInterval(upd, 1000);
    return t;
  }

  function renderSection(sec, si) {
    var a = A(si);
    switch (sec.type) {
      case "vocab":
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "点单词听发音，读两遍，记住中文意思就行。"),
          h("div", { class: "list" }, sec.items.map(function (w) {
            return h("div", { class: "list-row" }, h("div", null, h("b", null, w[0]), " ", h("span", { class: "muted" }, w[1])), h("button", { class: "btn ghost", type: "button", onclick: function () { speak(w[0]).catch(function () {}); } }, "发音"));
          })));
      case "cw": {
        var parts = parseCw(sec.text), bi = 0;
        var box = h("div", { class: "cw" });
        parts.forEach(function (p) {
          if (!p.ans) { box.appendChild(document.createTextNode(p.t)); return; }
          var idx = bi++;
          var inp = h("input", { type: "text", id: "cw-" + si + "-" + idx, maxlength: String(p.len + 2), autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": p.pre + " 后面缺 " + p.len + " 个字母", style: "width:" + (p.len + 1.2) + "ch" });
          inp.value = a.v[idx] || "";
          inp.addEventListener("input", function () { a.v[idx] = inp.value; persistDraft(); });
          box.appendChild(h("span", { class: "gap" }, p.pre, inp));
        });
        return h("div", { class: "stack" }, h("p", { class: "muted small" }, "每个空格补全单词剩下的字母，下划线长度约等于缺的字母数。"), box);
      }
      case "read":
        return h("div", { class: "stack" },
          h("div", { class: "passage" }, sec.passage),
          sec.questions.map(function (q, qi) {
            return h("div", { class: "q item" }, h("div", { class: "q-t" }, (qi + 1) + ". " + q.q), options(q.options, function () { return a.v[qi]; }, function (v) { a.v[qi] = v; }));
          }));
      case "lcr":
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "每句最多听两次，选出最自然的回应。"),
          sec.items.map(function (it, ii) {
            var reveal = h("div", { class: "hint", hidden: true }, it.audio);
            return h("div", { class: "item" },
              h("div", { class: "row" }, h("span", { class: "mono muted" }, (ii + 1) + "."), playButton("播放", function () { return it.audio; }, 2, si + "-" + ii, function (noTts) { if (noTts) reveal.hidden = false; })),
              reveal,
              options(it.options, function () { return a.v[ii]; }, function (v) { a.v[ii] = v; }));
          }));
      case "listen": {
        var script = h("div", { class: "passage", hidden: true }, sec.lines.map(function (l) { return l.who + ": " + l.text; }).join("\n\n"));
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "先听完再看题，最多听两次。"),
          h("div", { class: "row" }, playButton(sec.kind === "talk" ? "播放讲座" : sec.kind === "announcement" ? "播放广播" : "播放对话", function () { return sec.lines; }, 2, si + "-l", function (noTts) { if (noTts) script.hidden = false; })),
          script,
          sec.questions.map(function (q, qi) {
            return h("div", { class: "q item" }, h("div", { class: "q-t" }, (qi + 1) + ". " + q.q), options(q.options, function () { return a.v[qi]; }, function (v) { a.v[qi] = v; }));
          }));
      }
      case "bas":
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "依次点击词组，组成一句通顺的回答。点上面已选的词组可以撤回。"),
          sec.items.map(function (it, ii) {
            var wrap = h("div", { class: "item" });
            if (!run.answers["shuf-" + si + "-" + ii]) {
              var idxs = it.chunks.map(function (_, i) { return i; });
              do { for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t; } } while (idxs.every(function (v, k) { return v === k; }) && idxs.length > 1);
              run.answers["shuf-" + si + "-" + ii] = idxs;
            }
            var shuf = run.answers["shuf-" + si + "-" + ii];
            function draw() {
              var order = a.v[ii] || [];
              wrap.textContent = "";
              wrap.appendChild(h("div", null, h("span", { class: "muted" }, (ii + 1) + ". "), h("i", null, "“" + it.context + "”")));
              wrap.appendChild(h("div", { class: "chips slots" }, order.length ? order.map(function (ci, pos) {
                return h("button", { type: "button", class: "chip", onclick: function () { order.splice(pos, 1); a.v[ii] = order; persistDraft(); draw(); } }, it.chunks[ci]);
              }) : h("span", { class: "muted small" }, "（点下面的词组）"), order.length === it.chunks.length ? h("span", null, it.end) : null));
              wrap.appendChild(h("div", { class: "chips" }, shuf.filter(function (ci) { return order.indexOf(ci) < 0; }).map(function (ci) {
                return h("button", { type: "button", class: "chip", onclick: function () { order.push(ci); a.v[ii] = order; persistDraft(); draw(); } }, it.chunks[ci]);
              })));
            }
            draw();
            return wrap;
          }));
      case "email":
      case "discussion": {
        var ta = h("textarea", { id: "w-" + si, spellcheck: "false", placeholder: "在这里写。写作时关掉拼写检查，更接近真实考试。" });
        ta.value = a.v && typeof a.v === "string" ? a.v : "";
        var wc = h("span", { class: "mono small muted" }, words(ta.value) + " 词");
        ta.addEventListener("input", function () { a.v = ta.value; wc.textContent = words(ta.value) + " 词"; persistDraft(); });
        var target = sec.type === "email" ? "建议 80–120 词" : "建议 100 词以上";
        var prompt = sec.type === "email"
          ? h("div", { class: "stack" }, h("div", { class: "passage" }, sec.prompt), h("div", null, h("b", null, "邮件中需要："), h("ul", null, sec.points.map(function (p) { return h("li", null, p); }))))
          : h("div", { class: "stack" }, h("div", { class: "post prof" }, h("b", null, "Professor"), h("p", null, sec.professor)), sec.posts.map(function (p) { return h("div", { class: "post" }, h("b", null, p.name), h("p", null, p.text)); }));
        return h("div", { class: "stack" }, prompt, h("div", { class: "row", style: "justify-content:space-between" }, writingTimer(sec.minutes, ta, si), h("span", { class: "small muted" }, target, " · ", wc)), ta);
      }
      case "repeat":
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "听一句，马上一字不差地说出来。每句最多听两次。"),
          sec.items.map(function (it, ii) {
            var reveal = h("div", { class: "hint", hidden: true }, it);
            return h("div", { class: "item" },
              h("div", { class: "row" }, h("span", { class: "mono muted" }, (ii + 1) + "."), playButton("播放句子", function () { return it; }, 2, si + "-" + ii, function (noTts) { if (noTts) reveal.hidden = false; })),
              reveal,
              micArea({ get: function () { return a.v[ii]; }, set: function (v) { a.v[ii] = v; }, continuous: false, clear: true, label: "开始跟读" }));
          }));
      case "interview":
        return h("div", { class: "stack" },
          h("p", { class: "muted small" }, "听问题后马上回答，没有准备时间，尽量说满 " + sec.seconds + " 秒：观点 + 理由 + 一个自己的例子。"),
          sec.items.map(function (it, ii) {
            var reveal = h("div", { class: "hint", hidden: !run.answers["show-" + si + "-" + ii] }, it);
            return h("div", { class: "item" },
              h("div", { class: "row" }, h("span", { class: "mono muted" }, (ii + 1) + "."), playButton("播放问题", function () { return it; }, 2, si + "-" + ii, function (noTts) { if (noTts) reveal.hidden = false; }),
                h("button", { class: "btn ghost", type: "button", onclick: function () { reveal.hidden = false; run.answers["show-" + si + "-" + ii] = true; persistDraft(); } }, "显示文字")),
              reveal,
              micArea({ get: function () { return a.v[ii]; }, set: function (v) { a.v[ii] = v; }, continuous: true, seconds: sec.seconds, clear: true, label: "开始回答" }));
          }));
    }
    return h("p", null, "未知题型");
  }

  /* ---------- Claude grading ---------- */
  function gradePrompt(set, res) {
    return "你是新托福（2026年1月起的新版 TOEFL iBT）写作和口语阅卷老师。按新版 1–6 分制（0.5 一档；6≈C2，5≈C1，4≈B2，3≈B1，2≈A2，1≈A1）给下面考生的作答打分。\n" +
      "写作标准：邮件看是否完成全部要点、语气得体、语法用词准确；学术讨论看是否表明观点、回应同学、理由和例子充分、语言准确多样。字数明显不足要扣分，未作答记 1 分。\n" +
      "口语标准：内容来自语音转写（可能有识别错误，不要因个别识别错误扣分，也无法评价发音），看回答是否切题、是否有观点+理由+例子、长度是否足够（45 秒约 70–100 词）、语法和用词。未作答记 1 分。\n" +
      "用简体中文写点评，语气鼓励但具体。只回复一个 JSON 对象，不要其他文字，格式：\n" +
      '{"writing":{"band":数字,"summary":"一两句总体评价","issues":["最多3条最重要的问题，每条附一个原句→改正"],"improved":"把考生的写作改写成一篇高分范文（英文）"},' +
      '"speaking":{"band":数字,"summary":"一两句总体评价","issues":["最多3条问题与建议"],"sample":"针对第一道面试题的高分回答示范（英文，约80词）"},' +
      '"tip":"明天最值得练的一件事（一句中文）"}\n\n' + claudeRequest(set, res);
  }
  function gradeWithClaude(set, res, btn, status) {
    if (!sampleFn) return;
    btn.disabled = true; btn.textContent = "Claude 正在批改……";
    status.textContent = "大约需要 20–40 秒。";
    sampleFn.json(gradePrompt(set, res), { modelTier: "default" }).then(function (fbk) {
      if (!fbk || !fbk.writing || !fbk.speaking) throw { code: "bad_shape" };
      var wb = clampBand(roundHalf(Number(fbk.writing.band) || 1)), sb = clampBand(roundHalf(Number(fbk.speaking.band) || 1));
      fbk.writing.band = wb; fbk.speaking.band = sb;
      res.feedback = fbk;
      res.claude = { writing: wb, speaking: sb };
      save(); render();
      toast("批改完成");
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = "让 Claude 批改";
      if (e && e.code === "not_granted") { sampleFn = null; status.textContent = "没有允许页面调用 Claude。可以用下面的“复制批改请求”，发到 Claude 对话里。"; }
      else if (e && e.code === "rate_limited") status.textContent = "请求太频繁了，过一分钟再试。";
      else status.textContent = "这次批改没有成功，请再试一次。";
    });
  }
  function feedbackCard(fb) {
    function part(title, f, extraTitle, extra) {
      return h("div", { class: "stack" },
        h("div", { class: "row", style: "justify-content:space-between" }, h("h3", null, title), h("span", { class: "mono" }, fmtBand(f.band) + " · " + cefr(f.band))),
        h("p", null, f.summary || ""),
        f.issues && f.issues.length ? h("ul", null, f.issues.map(function (x) { return h("li", null, String(x)); })) : null,
        extra ? h("details", null, h("summary", null, extraTitle), h("div", { class: "passage" }, extra)) : null);
    }
    return h("div", { class: "card" }, h("h2", null, "Claude 的批改"),
      part("写作", fb.writing, "看高分范文", fb.writing.improved),
      part("口语", fb.speaking, "看回答示范", fb.speaking.sample),
      fb.tip ? h("div", { class: "hint" }, "明天重点：" + fb.tip) : null);
  }

  function parseScores(text) {
    function last(re) { var m, v = null; re.lastIndex = 0; while ((m = re.exec(text))) v = parseFloat(m[1]); return v; }
    var w = last(/(?:写作|writing)[^0-9\n]{0,8}([1-6](?:\.[05])?)/gi);
    var sp = last(/(?:口语|speaking)[^0-9\n]{0,8}([1-6](?:\.[05])?)/gi);
    return { writing: w, speaking: sp };
  }
  function aiCard(set, res, req) {
    var paste = h("textarea", { class: "short", id: "ai-reply-" + set.id, placeholder: "把 AI 的整段回复粘贴到这里" });
    var status = h("p", { class: "small muted" });
    function apply() {
      var sc = parseScores(paste.value);
      if (sc.writing == null && sc.speaking == null) { status.textContent = "没找到分数。请确认粘贴了 AI 回复的最后一行，比如“【分数】写作 3.5；口语 3”。"; return; }
      if (sc.writing != null) res.claude.writing = clampBand(sc.writing);
      if (sc.speaking != null) res.claude.speaking = clampBand(sc.speaking);
      res.aiReply = paste.value.slice(0, 20000);
      save(); render(); toast("分数已记录");
    }
    return h("div", { class: "card" }, h("h2", null, "用你的 AI 批改写作和口语"),
      h("ol", { class: "small", style: "margin:0;padding-left:1.2em" },
        h("li", null, "点“复制批改指令”。"),
        h("li", null, "打开你常用的 AI（Claude、ChatGPT、Kimi、DeepSeek 都行），粘贴发送。"),
        h("li", null, "把 AI 的回复全选复制，粘贴到下面，点“记录分数”。")),
      h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: function () {
        copyText(req).then(function (ok) { if (ok) toast("已复制，去 AI 里粘贴吧"); else toast("复制失败，请展开下面的内容手动复制"); });
      } }, "复制批改指令")),
      h("details", null, h("summary", { class: "small" }, "查看批改指令"), h("div", { class: "copybox", tabindex: "0" }, req)),
      paste,
      h("div", { class: "row" }, h("button", { class: "btn", type: "button", onclick: apply }, "记录分数")),
      status);
  }

  /* ---------- result ---------- */
  function viewResult(set) {
    var res = store.results[set.id];
    if (!res) return [h("div", { class: "card" }, h("p", null, "还没有这套题的成绩。"), h("a", { class: "btn primary", href: "#run-" + set.id }, "开始"))];
    var fb = finalBands(res);
    var req = claudeRequest(set, res);
    function bandSelect(key) {
      var sel = h("select", { id: "cb-" + key }, h("option", { value: "" }, "未批改"), [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].map(function (b) { return h("option", { value: String(b), selected: res.claude[key] === b }, b.toFixed(1)); }));
      sel.addEventListener("change", function () { res.claude[key] = sel.value ? parseFloat(sel.value) : null; save(); render(); });
      return sel;
    }
    var t = res.score.tally;
    var nd = nextDay();
    return [
      h("section", { class: "hero" }, h("span", { class: "eyebrow" }, set.title + " · " + res.date), h("h1", null, "总分 " + fmtBand(fb.overall) + "，约 " + cefr(fb.overall)),
        h("p", null, "阅读答对 " + t.reading[0] + "/" + t.reading[1] + "，听力答对 " + t.listening[0] + "/" + t.listening[1] + "，连词成句 " + t.writing[0] + "/" + t.writing[1] + "，跟读平均准确率 " + (t.speaking[1] ? Math.round(t.speaking[0] / t.speaking[1] * 100) : 0) + "%。")),
      h("div", { class: "card" }, ruler(fb.overall), skillTiles(fb, fb.pending),
        h("p", { class: "small muted" }, "分数按新托福 1–6 分制换算，题量少，只作参考。写作 = 连词成句 30% + 写作批改 70%；口语 = 跟读 40% + 面试批改 60%。")),
      res.aiReply ? h("div", { class: "card" }, h("div", { class: "row", style: "justify-content:space-between" }, h("h2", null, "AI 的批改"), h("span", { class: "mono" }, "写作 " + fmtBand(res.claude.writing) + " · 口语 " + fmtBand(res.claude.speaking))),
        h("details", null, h("summary", null, "展开看点评"), h("div", { class: "passage small" }, res.aiReply)),
        h("button", { class: "btn ghost", type: "button", onclick: function () { delete res.aiReply; res.claude = {}; save(); render(); } }, "重新批改")) : aiCard(set, res, req),
      h("details", { class: "card" }, h("summary", null, "手动改分"),
        h("div", { class: "row" }, h("span", null, "写作"), bandSelect("writing"), h("span", null, "口语"), bandSelect("speaking"))),
      h("details", { class: "card" }, h("summary", null, "错题回顾（" + res.score.review.length + "）"),
        res.score.review.length ? h("div", { class: "stack" }, res.score.review.map(function (r) {
          return h("div", { class: "rv no" }, h("small", null, r.sec), h("div", null, r.q), h("div", null, "你的答案：" + r.yours), h("div", null, "正确：" + r.right), r.script ? h("details", null, h("summary", { class: "small" }, "看听力原文"), h("div", { class: "passage small" }, r.script)) : null);
        })) : h("p", { class: "muted" }, "客观题全对。")),
      h("div", { class: "row" },
        nd ? h("a", { class: "btn primary", href: "#run-" + nd.id }, "下一套：" + nd.title) : null,
        h("a", { class: "btn", href: "#home" }, "回首页"),
        h("button", { class: "btn ghost", type: "button", onclick: function () { if (run && run.set.id === set.id) run = null; delete store.drafts[set.id]; save(); location.hash = "#run-" + set.id; } }, "重做这套"))
    ];
  }

  /* ---------- router ---------- */
  function render() {
    var hash = location.hash.replace(/^#/, "") || "home";
    var view;
    if (hash === "settings") { if (run) stopAll(); view = viewSettings(); }
    else if (/^run-[a-z0-9]+-s\d$/.test(hash) && getSet(hash.slice(4, hash.lastIndexOf("-s")))) {
      var sset = getSet(hash.slice(4, hash.lastIndexOf("-s"))), sk = parseInt(hash.slice(-1), 10);
      if (!run || run.set.id !== sset.id) startRun(sset);
      var rr = segRanges(sset);
      if (rr && rr[sk] && rr[sk].indexOf(run.step) < 0) run.step = rr[sk][0];
      view = viewRun(sset);
    }
    else if (hash.indexOf("run-") === 0 && getSet(hash.slice(4))) view = viewRun(getSet(hash.slice(4)));
    else if (hash.indexOf("result-") === 0 && getSet(hash.slice(7))) { if (run) stopAll(); view = viewResult(getSet(hash.slice(7))); }
    else { if (run) stopAll(); view = viewHome(); }
    app.textContent = "";
    add(app, view);
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  if (synth) synth.addEventListener && synth.addEventListener("voiceschanged", function () { if (location.hash === "#settings") render(); });
  render();
})();
