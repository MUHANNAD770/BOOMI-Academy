/* studio.js — «استوديو صوتي»: صاحب الموقع يقرأ بصوته كل نصوص الموقع (الحروف بأشكالها، الكلمات، الجمل، القصص، والإنجليزية).
   • كل تسجيل يُنظَّف (حذف الصمت أوله وآخره، توحيد الارتفاع) ويُحفظ في الجهاز (IndexedDB) فيُسمع فورًا في الموقع بدل أي صوت آخر.
   • ويُرفع أيضًا إلى مخزن الموقع (netlify/functions/studio.mjs) ليُضاف إلى ملفات المشروع (tools/clips/studio_pack.py) فيسمعه كل الطلاب.
   • المفتاح هو مفتاح المقاطع نفسه (HurufiClips.key) لكل جزء كما يقسّمه محرّك الصوت، فيطابق ما يُنطق في الدروس تمامًا. */
(() => {
  'use strict';
  const DBN = 'hurufi-studio', OS = 'rec', API = '/.netlify/functions/studio';
  const LS = { tok: 'hurufi-studio-tok', code: 'hurufi-studio-code', on: 'hurufi-rec-on' };
  const lsg = k => { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } };
  const lss = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D0 = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const norm = t => String(t || '').replace(/\s+/g, ' ').trim().normalize('NFC');
  const keyOf = (t, l) => (window.HurufiClips && HurufiClips.key ? HurufiClips.key(norm(t), l === 'en' ? 'en' : 'ar') : null);

  /* ---------- التخزين في الجهاز ---------- */
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((ok, no) => {
    try {
      const r = indexedDB.open(DBN, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(OS);
      r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
    } catch (e) { no(e); }
  }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((ok, no) => { const t = d.transaction(OS, mode), s = t.objectStore(OS), r = fn(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error); }); };
  const idbGet = k => tx('readonly', s => s.get(k));
  const idbPut = (k, v) => tx('readwrite', s => s.put(v, k));
  const idbDel = k => tx('readwrite', s => s.delete(k));
  const idbAll = () => db().then(d => new Promise((ok, no) => {
    const out = new Map(), t = d.transaction(OS, 'readonly'), c = t.objectStore(OS).openCursor();
    c.onsuccess = () => { const x = c.result; if (x) { const v = x.value || {}; out.set(x.key, { at: v.at || 0, up: !!v.up, t: v.t, l: v.l }); x.continue(); } };
    t.oncomplete = () => ok(out); t.onerror = () => no(t.error);
  }));

  const st = { meta: new Map(), ready: null, stream: null, rec: null, cat: 'letters', only: 'todo', q: '', page: 0, items: null, cats: null, upBusy: 0, focus: null, srv: null };
  st.ready = idbAll().then(m => { st.meta = m; }).catch(() => {});

  /* ---------- التشغيل في الموقع ---------- */
  const on = () => !st.boomi && lsg(LS.on) !== '0';
  const has = (t, l) => { const k = keyOf(t, l); return !!(k && st.meta.has(k)); };
  const blobOf = async k => { const v = await idbGet(k); return v && v.b ? v.b : null; };
  const play = (t, l, valid, onStart) => {
    const k = keyOf(t, l), m = k && st.meta.get(k), H = window.HurufiClips;
    if (!m || !H || !H.playBlob) return Promise.resolve(false);
    return H.playBlob(() => blobOf(k), 'rec:' + k + ':' + m.at, valid, onStart);
  };
  window.MyRec = { on, has, play, count: () => st.meta.size };

  /* ---------- تنظيف التسجيل: أحادي 24kHz، حذف الصمت، توحيد الارتفاع، WAV ---------- */
  const SR = 24000;
  async function clean(blob) {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    let buf;
    try { buf = await ac.decodeAudioData(await blob.arrayBuffer()); } finally { try { ac.close(); } catch (_) {} }
    const len = Math.max(1, Math.ceil(buf.duration * SR));
    const off = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, len, SR);
    const src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start(0);
    const out = await off.startRendering(), x = out.getChannelData(0);
    /* بداية الكلام ونهايته: نوافذ ١٠ م.ث أعلى من ٧٪ من أعلى قمة (وأعلى من الضجيج) */
    const W = SR / 100, n = Math.floor(x.length / W), rms = new Float32Array(n);
    let peak = 0;
    for (let i = 0; i < n; i++) { let s = 0; for (let j = i * W; j < (i + 1) * W; j++) s += x[j] * x[j]; rms[i] = Math.sqrt(s / W); if (rms[i] > peak) peak = rms[i]; }
    if (peak < 0.004) throw new Error('silent');
    const sorted = Array.from(rms).sort((a, b) => a - b), floor = sorted[Math.floor(n * 0.1)] || 0;
    const thr = Math.max(peak * 0.07, floor * 3);
    let a = 0, b = n - 1;
    while (a < n && rms[a] < thr) a++;
    while (b > a && rms[b] < thr) b--;
    const s0 = Math.max(0, (a - 8) * W), s1 = Math.min(x.length, (b + 16) * W);
    const y = x.subarray(s0, s1);
    let mx = 0; for (let i = 0; i < y.length; i++) { const v = Math.abs(y[i]); if (v > mx) mx = v; }
    const g = mx > 0 ? Math.min(8, 0.89 / mx) : 1, fade = Math.min(y.length / 4, SR * 0.012);
    const pcm = new Int16Array(y.length);
    for (let i = 0; i < y.length; i++) {
      let v = y[i] * g;
      if (i < fade) v *= i / fade; else if (i > y.length - fade) v *= (y.length - i) / fade;
      pcm[i] = Math.max(-32767, Math.min(32767, Math.round(v * 32767)));
    }
    const h = new DataView(new ArrayBuffer(44)), w = (o, s) => { for (let i = 0; i < s.length; i++) h.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); h.setUint32(4, 36 + pcm.byteLength, true); w(8, 'WAVE'); w(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
    h.setUint32(24, SR, true); h.setUint32(28, SR * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, 'data'); h.setUint32(40, pcm.byteLength, true);
    return new Blob([h.buffer, pcm.buffer], { type: 'audio/wav' });
  }

  /* ---------- الرفع إلى مخزن الموقع ---------- */
  const srv = async (a, o) => { const r = await fetch(API + '?a=' + a + (o && o.k ? '&k=' + o.k : ''), { method: o && o.m || 'GET', headers: o && o.h || {}, body: o && o.b, cache: 'no-store' }); let j = null; try { j = r.headers.get('content-type').includes('json') ? await r.json() : null; } catch (_) {} return { ok: r.ok, status: r.status, j }; };
  async function ensureOwner() {
    if (lsg(LS.tok)) return 'ok';
    const i = await srv('info');
    if (!i.ok) return 'net';
    if (i.j && i.j.claimed) return 'link';
    const c = await srv('claim', { m: 'POST' });
    if (c.ok && c.j && c.j.token) { lss(LS.tok, c.j.token); lss(LS.code, c.j.code); return 'ok'; }
    return c.status === 409 ? 'link' : 'net';
  }
  async function upload() {
    if (st.upBusy || navigator.onLine === false) return;
    st.upBusy = 1;
    try {
      const o = await ensureOwner(); if (o !== 'ok') { st.srv = o; return; }
      st.srv = 'ok';
      for (const [k, m] of st.meta) {
        if (m.up) continue;
        const v = await idbGet(k); if (!v || !v.b) continue;
        const r = await srv('put', { m: 'POST', k, b: v.b, h: { 'x-token': lsg(LS.tok), 'x-t': encodeURIComponent(v.t || ''), 'x-l': v.l || 'ar', 'content-type': 'audio/wav' } });
        if (r.status === 403) { lss(LS.tok, null); st.srv = 'link'; break; }
        if (!r.ok) break;
        const cur = await idbGet(k);
        if (cur && cur.at === v.at) { cur.up = 1; await idbPut(k, cur); m.up = true; }
        bar();
      }
    } catch (_) {} finally { st.upBusy = 0; bar(); }
  }
  addEventListener('online', () => setTimeout(upload, 2000));
  st.ready.then(() => setTimeout(upload, 8000));

  /* ---------- القوائم ---------- */
  const partsOf = (t, l) => { try { const ps = window.VoiceParts ? VoiceParts.parts(t, l) : null; if (ps && ps.length) return ps.filter(p => p && p[0] && /[\p{L}\p{N}]/u.test(p[0])); } catch (_) {} return [[t, l]]; };
  /* نصوص القوالب البرمجية (فيها $ أو علامات اقتباس أو رموز) ليست مما يُنطق: لا تُعرض للتسجيل */
  const junk = t => /[$"{}<>\\|`=_]|^'|'$/.test(t) || !/[\p{L}]/u.test(t) || (t.split('(').length !== t.split(')').length);
  const item = (t, l, g, n) => { if (junk(t)) return null; const k = keyOf(t, l); return k ? { t: norm(t), l, k, g, n } : null; };
  async function cats() {
    if (st.cats) return st.cats;
    const C = { letters: [], arw: [], ars: [], stories: [], enw: [], ens: [] }, seen = new Set();
    const push = (arr, it) => { if (it && !seen.has(it.k)) { seen.add(it.k); arr.push(it); } };
    for (const [L, fs] of (window.SoundCheckRows ? SoundCheckRows() : [])) for (const [, n, t] of fs) for (const [pt, pl] of partsOf(t, 'ar')) push(C.letters, item(pt, pl, L, n));
    try {
      const sb = await (await fetch('data/stories-bank.json')).json();
      for (const sg of sb.stages || []) for (const s of sg.stories || []) {
        const l = s.l === 'en' ? 'en' : 'ar';
        for (const line of [s.t, ...(s.s || [])]) for (const [pt, pl] of partsOf(line, l)) push(C.stories, item(pt, pl, s.t));
      }
    } catch (_) {}
    try {
      const tx = await (await fetch('audio/studio/texts.json')).json();
      for (const t of tx.ar || []) push(/\s/.test(t) ? C.ars : C.arw, item(t, 'ar'));
      for (const t of tx.en || []) push(/\s/.test(t) ? C.ens : C.enw, item(t, 'en'));
    } catch (_) {}
    return (st.cats = C);
  }
  const CATS = [['letters', '🔤 الحروف'], ['arw', '📝 الكلمات'], ['ars', '💬 الجمل'], ['stories', '📚 القصص'], ['enw', '🇬🇧 English words'], ['ens', '🇬🇧 English sentences']];
  const PER = 40;
  const list = () => {
    const all = (st.cats && st.cats[st.cat]) || [], q = norm(st.q).replace(/[ً-ْ]/g, '');
    return all.filter(it => (st.only !== 'todo' || !st.meta.has(it.k)) && (st.only !== 'done' || st.meta.has(it.k)) && (!q || it.t.replace(/[ً-ْ]/g, '').includes(q) || (it.g && it.g.replace(/[ً-ْ]/g, '').includes(q))));
  };

  /* ---------- الميكروفون ---------- */
  async function mic() {
    if (st.stream && st.stream.active) return st.stream;
    st.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    return st.stream;
  }
  const micOff = () => { try { st.stream && st.stream.getTracks().forEach(t => t.stop()); } catch (_) {} st.stream = null; };
  async function startRec(it, done) {
    try { window.BumiHush && BumiHush(); } catch (_) {}
    try { window.HurufiClips && HurufiClips.stop(); } catch (_) {}
    if (!navigator.mediaDevices || !window.MediaRecorder) { note('هذا المتصفح لا يدعم التسجيل'); return false; }
    let s; try { s = await mic(); } catch (_) { note('🎙️ اسمح للموقع باستعمال الميكروفون من إعدادات المتصفح'); return false; }
    const ch = [], r = new MediaRecorder(s);
    st.rec = { r, k: it.k, t0: Date.now() };
    r.ondataavailable = e => { if (e.data && e.data.size) ch.push(e.data); };
    r.onstop = async () => {
      const ms = Date.now() - st.rec.t0; st.rec = null;
      if (ms < 250) { done && done(false); return; }
      try {
        const b = await clean(new Blob(ch, { type: r.mimeType || 'audio/webm' })), at = Date.now();
        await idbPut(it.k, { b, t: it.t, l: it.l, at, up: 0 });
        st.meta.set(it.k, { at, up: false, t: it.t, l: it.l });
        done && done(true); setTimeout(upload, 300);
      } catch (e) { note(e && e.message === 'silent' ? '🔇 لم يُسمع صوت. اقترب من الميكروفون وأعد' : '⚠️ تعذّر حفظ التسجيل، أعد المحاولة'); done && done(false); }
    };
    r.start();
    return true;
  }
  const stopRec = () => { try { st.rec && st.rec.r.state !== 'inactive' && st.rec.r.stop(); } catch (_) {} };
  const note = m => { try { const e = document.createElement('div'); e.className = 'mv-toast'; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 3500); } catch (_) {} };
  const playMine = k => { const m = st.meta.get(k); if (m) HurufiClips.playBlob(() => blobOf(k), 'rec:' + k + ':' + m.at); };
  const playBoomi = it => { st.boomi = 1; clearTimeout(st.bt); st.bt = setTimeout(() => { st.boomi = 0; }, 20000); try { say(it.t, it.l, () => { st.boomi = 0; }); } catch (_) { st.boomi = 0; } };

  /* ---------- الصفحة ---------- */
  function bar() {
    const e = document.getElementById('st-bar'); if (!e) return;
    let up = 0; for (const m of st.meta.values()) if (m.up) up++;
    const total = st.cats ? Object.values(st.cats).reduce((a, x) => a + x.length, 0) : 0;
    const srvTxt = st.srv === 'net' ? '☁️ يُرفع إلى مشروعك عند الاتصال بالإنترنت' : st.srv === 'link'
      ? `<span class=st-warn>☁️ الاستوديو مرتبط بجهاز آخر. أدخل رمز الاستوديو: <input id=st-code maxlength=8 dir=ltr placeholder="XXXXXXXX"><button class=alt onclick="studioLink()">ربط</button></span>`
      : `☁️ محفوظ في مشروعك: ${D0(up)} / ${D0(st.meta.size)}${st.upBusy ? ' (يُرفع الآن…)' : ''}`;
    e.innerHTML = `<b>🎙️ سجّلت ${D0(st.meta.size)}${total ? ' من ' + D0(total) : ''}</b><span>${srvTxt}</span>${lsg(LS.code) ? `<small>رمز الاستوديو لجهاز آخر: <bdi dir=ltr>${esc(lsg(LS.code))}</bdi></small>` : ''}`;
  }
  function rows() {
    const L = list(), pages = Math.max(1, Math.ceil(L.length / PER));
    if (st.page >= pages) st.page = pages - 1;
    const part = L.slice(st.page * PER, st.page * PER + PER);
    const el = document.getElementById('st-list'); if (!el) return;
    el.innerHTML = part.length ? part.map(it => {
      const m = st.meta.get(it.k);
      return `<div class="st-row${m ? ' done' : ''}" data-k="${it.k}" dir=${it.l === 'en' ? 'ltr' : 'rtl'}>
        <div class=st-txt>${it.g && it.g !== it.t ? `<small>${esc(it.g)}${it.n ? ' • ' + esc(it.n) : ''}</small>` : (it.n ? `<small>${esc(it.n)}</small>` : '')}<b>${esc(it.t)}</b></div>
        <div class=st-btns>
          <button class=st-b onclick="studioBoomi('${it.k}')" title="بومي" aria-label="اسمع بومي">🦉</button>
          <button class="st-b st-rec" onclick="studioRec(this,'${it.k}')" aria-label="سجّل">🎙️</button>
          ${m ? `<button class=st-b onclick="studioMine('${it.k}')" aria-label="اسمع تسجيلي">▶</button><button class=st-b onclick="studioDel('${it.k}')" aria-label="احذف">🗑</button>` : ''}
        </div></div>`;
    }).join('') : `<p class=mut>${st.only === 'todo' ? '🎉 سجّلت كل ما في هذا القسم' : 'لا شيء هنا'}</p>`;
    const pg = document.getElementById('st-pg');
    if (pg) pg.innerHTML = pages > 1 ? `<button class=alt onclick="studioPage(-1)" ${st.page ? '' : 'disabled'}>→ السابق</button><span>${D0(st.page + 1)} / ${D0(pages)} (${D0(L.length)})</span><button class=alt onclick="studioPage(1)" ${st.page < pages - 1 ? '' : 'disabled'}>التالي ←</button>` : `<span>${D0(L.length)}</span>`;
    bar();
  }
  const find = k => { for (const a of Object.values(st.cats || {})) for (const it of a) if (it.k === k) return it; return null; };

  window.studio = async function () {
    window.V = 'sec'; window.CS = 'set';
    h(`<section class="sec st-page">
      <button class=link onclick="studioLeave()">← رُجُوعٌ</button>
      <h2>🎙️ استوديو صوتي</h2>
      <p class=mut>اقرأ بصوتك نصوص الموقع كلها. كل ما تسجّله يُنطق في الموقع بصوتك بدل أي صوت آخر، ويُحفظ في مشروعك ليسمعه كل الطلاب.
      اضغط ⏺ وابدأ القراءة، ثم اضغط ⏹ عند الانتهاء. 🦉 يُسمعك نطق بومي الحالي.</p>
      <div id=st-bar class=st-bar></div>
      <label class=st-on><input type=checkbox ${on() ? 'checked' : ''} onchange="studioOn(this.checked)"> استعمل تسجيلاتي في الموقع</label>
      <div class=st-tabs>${CATS.map(([k, n]) => `<button class="st-tab${st.cat === k ? ' on' : ''}" onclick="studioCat('${k}')">${n}</button>`).join('')}</div>
      <div class=st-tools>
        <select onchange="studioOnly(this.value)"><option value=todo ${st.only === 'todo' ? 'selected' : ''}>غير المسجّل</option><option value=done ${st.only === 'done' ? 'selected' : ''}>المسجّل</option><option value=all ${st.only === 'all' ? 'selected' : ''}>الكل</option></select>
        <input type=search placeholder="ابحث…" value="${esc(st.q)}" oninput="studioQ(this.value)">
        <button class=big onclick="studioFocus()">▶ قراءة متتالية</button>
      </div>
      <div id=st-list class=st-list><p class=mut>⏳ تُجهَّز القائمة…</p></div>
      <div id=st-pg class=st-pg></div>
    </section>`);
    await st.ready; await cats(); rows(); upload();
  };
  window.studioLeave = () => { stopRec(); micOff(); studioFocusClose(); goBack(); };
  window.studioOn = v => lss(LS.on, v ? null : '0');
  window.studioCat = k => { st.cat = k; st.page = 0; document.querySelectorAll('.st-tab').forEach(b => b.classList.toggle('on', b.getAttribute('onclick').includes("'" + k + "'"))); rows(); };
  window.studioOnly = v => { st.only = v; st.page = 0; rows(); };
  let qt = 0; window.studioQ = v => { clearTimeout(qt); qt = setTimeout(() => { st.q = v; st.page = 0; rows(); }, 250); };
  window.studioPage = d => { st.page += d; rows(); const l = document.getElementById('st-list'); l && l.scrollIntoView({ block: 'start' }); };
  window.studioBoomi = k => { const it = find(k); it && playBoomi(it); };
  window.studioMine = k => playMine(k);
  window.studioDel = async k => {
    if (st.delK !== k || Date.now() - st.delAt > 4000) { st.delK = k; st.delAt = Date.now(); note('🗑 اضغط مرة أخرى للحذف'); return; }
    st.delK = null;
    await idbDel(k); st.meta.delete(k);
    try { if (lsg(LS.tok)) srv('del', { m: 'POST', k, h: { 'x-token': lsg(LS.tok) } }); } catch (_) {}
    rows();
  };
  window.studioRec = async (btn, k) => {
    if (st.rec) { const same = st.rec.k === k; stopRec(); if (same) return; }
    const it = find(k); if (!it) return;
    const ok = await startRec(it, saved => { btn.classList.remove('on'); btn.textContent = '🎙️'; if (saved) { playMine(k); const r = btn.closest('.st-row'); r && r.classList.add('done'); setTimeout(rows, 1200); } });
    if (ok) { btn.classList.add('on'); btn.textContent = '⏹'; }
  };
  window.studioLink = async () => {
    const c = (document.getElementById('st-code') || {}).value || '';
    const r = await srv('link', { m: 'POST', b: JSON.stringify({ code: c }), h: { 'content-type': 'application/json' } });
    if (r.ok && r.j && r.j.token) { lss(LS.tok, r.j.token); lss(LS.code, c.toUpperCase()); st.srv = 'ok'; note('✅ تم الربط'); upload(); } else note('✗ الرمز غير صحيح');
    bar();
  };

  /* ---------- القراءة المتتالية: نص كبير واحد، سجّل ← يُعاد عليك ← التالي ---------- */
  function focusDraw() {
    const f = st.focus, el = document.getElementById('st-focus'); if (!f || !el) return;
    const it = f.L[f.i];
    if (!it) { el.innerHTML = `<div class=st-fc><p>🎉 انتهت القائمة</p><button class=big onclick="studioFocusClose()">إغلاق</button></div>`; return; }
    const m = st.meta.get(it.k), rec = st.rec && st.rec.k === it.k;
    el.innerHTML = `<div class=st-fc>
      <div class=st-fhead><button class=alt onclick="studioFocusClose()">✕ إغلاق</button><span>${D0(f.i + 1)} / ${D0(f.L.length)}</span></div>
      ${it.g && it.g !== it.t ? `<small class=st-fg>${esc(it.g)}${it.n ? ' • ' + esc(it.n) : ''}</small>` : it.n ? `<small class=st-fg>${esc(it.n)}</small>` : ''}
      <div class=st-ft dir=${it.l === 'en' ? 'ltr' : 'rtl'}>${esc(it.t)}</div>
      <button class="st-big${rec ? ' on' : ''}" onclick="studioFocusRec()">${rec ? '⏹ أوقف' : (m ? '🔁 أعد التسجيل' : '🎙️ سجّل')}</button>
      <div class=st-frow>
        <button class=alt onclick="studioFocusGo(-1)">→ السابق</button>
        <button class=alt onclick="studioBoomi('${it.k}')">🦉 بومي</button>
        ${m ? `<button class=alt onclick="studioMine('${it.k}')">▶ تسجيلي</button>` : ''}
        <button class=${m ? 'big' : 'alt'} onclick="studioFocusGo(1)">${m ? 'التالي ✓' : 'تخطَّ ⏭'} ←</button>
      </div></div>`;
  }
  window.studioFocus = () => {
    const L = list(); if (!L.length) return note('لا نصوص في هذه القائمة');
    st.focus = { L: L.slice(), i: 0 };
    let el = document.getElementById('st-focus');
    if (!el) { el = document.createElement('div'); el.id = 'st-focus'; document.body.appendChild(el); }
    focusDraw();
  };
  window.studioFocusClose = () => { stopRec(); st.focus = null; const el = document.getElementById('st-focus'); el && el.remove(); if (document.getElementById('st-list')) rows(); };
  window.studioFocusGo = d => { const f = st.focus; if (!f) return; stopRec(); f.i = Math.max(0, Math.min(f.L.length, f.i + d)); focusDraw(); };
  window.studioFocusRec = async () => {
    const f = st.focus; if (!f) return; const it = f.L[f.i]; if (!it) return;
    if (st.rec) { stopRec(); return; }
    const ok = await startRec(it, saved => { focusDraw(); if (saved) playMine(it.k); });
    if (ok) focusDraw();
  };
})();
