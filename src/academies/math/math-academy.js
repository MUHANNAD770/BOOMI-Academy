/* src/academies/math/math-academy.js — أكاديمية الرياضيات: مراحل ووحدات متدرّجة من التأسيس إلى الإتقان.
   • البيانات من دفعات data/math/*.json (الفهرس data/math/index.json): كل دفعة جديدة تُضاف بملف واحد دون تعديل الكود.
   • اختبار تحديد المستوى أولًا (سؤال في كل شاشة، بلا كشف الإجابات حتى النهاية، ونتيجة كل مرحلة وحدها).
   • إتقان الوحدة عند ٨٥٪؛ ٦٠–٨٥٪ شرح الأخطاء وتدريب موجّه؛ أقل من ٦٠٪ شرح قصير ثم تدريب أسهل.
   • الخطأ: شرح فوري، ثم يعود السؤال لاحقًا في الجلسة بأعداد جديدة إن أمكن، ولا يتكرر السؤال نفسه في الجلسة.
   • التقدّم في P.math (يُحفظ ويُزامَن مع ملف الطالب). */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const girl = () => window.P && P.gender === 'female';
  const g = (m, f) => girl() ? f : m;
  const MASTER = 85, MIN_Q = 10, PLACE_PASS = 2; /* اجتياز مرحلة في اختبار المستوى: سؤالان من ثلاثة */

  /* ---------- البيانات: دمج الدفعات ---------- */
  let DATA = null, LOADING = null;
  function merge(batches) {
    const st = [], byId = {}, Q = {}, place = [];
    for (const b of batches) {
      for (const s of (b.stages || [])) {
        let t = byId[s.id];
        if (!t) { t = byId[s.id] = { id: s.id, name: s.name, level: s.level, units: [], q: [] }; st.push(t); }
        for (const u of (s.units || [])) if (!t.units.some(x => x.id === u.id)) t.units.push({ id: u.id, name: u.name });
        for (const q of (s.questions || [])) if (!Q[q.id]) { const x = { ...q, stage_id: s.id }; Q[q.id] = x; t.q.push(x); }
      }
      const pt = b.placement_test;
      if (pt) for (const x of (pt.questions || [])) {
        const q = typeof x === 'string' ? Q[x] : x;
        if (q && !place.some(p => p.id === q.id)) place.push({ ...q, stage_id: q.stage_id || (Q[q.id] || {}).stage_id });
      }
    }
    return { stages: st, Q, place };
  }
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (LOADING) return LOADING;
    LOADING = fetch('data/math/index.json?v=1', { cache: 'no-cache' }).then(r => r.json())
      .then(ix => Promise.all((ix.batches || []).map(f => fetch('data/math/' + f + '?v=1', { cache: 'no-cache' }).then(r => r.json()))))
      .then(bs => { DATA = merge(bs); return DATA; })
      .catch(e => { LOADING = null; throw e; });
    return LOADING;
  }

  /* ---------- التقدّم ---------- */
  const M = () => { const p = window.P; if (!p) return {}; p.math = p.math || {}; p.math.u = p.math.u || {}; return p.math; };
  const save = () => { try { window.save && window.save(); } catch (_) {} };
  const uk = (s, u) => s.id + '/' + u.id;
  const uStat = (s, u) => M().u[uk(s, u)] || null;
  const unitsFlat = d => d.stages.flatMap((s, si) => s.units.map((u, ui) => ({ s, si, u, ui })));
  /* الوحدة مفتوحة: في مرحلة البداية المقترحة أو قبلها، أو بعد إتقان الوحدة السابقة */
  function unlocked(d, si, ui) {
    const m = M();
    if (m.unlockAll || (window.P && P.unlockAll)) return true;
    const start = m.place ? m.place.stage : 0;
    if (si <= start) return true;
    const flat = unitsFlat(d), i = flat.findIndex(x => x.si === si && x.ui === ui);
    if (i <= 0) return true;
    const prev = flat[i - 1], st = uStat(prev.s, prev.u);
    return !!(st && st.mastered);
  }

  /* ---------- مقارنة الإجابة المكتوبة ---------- */
  const norm = s => String(s == null ? '' : s).normalize('NFKC')
    .replace(/[0-9]/g, d => AD[d]).replace(/[۰-۹]/g, d => AD[d.charCodeAt(0) - 0x06F0])
    .replace(/[\/⁄∕]/g, '⁄').replace(/[−–—-]/g, '−').replace(/\.(?=[٠-٩])/g, '٫')
    .replace(/[،,؛;]/g, '،').replace(/\s*،\s*/g, '،').replace(/\s+/g, '').replace(/[.。]$/, '');

  /* ---------- أسئلة بأعداد جديدة لنفس الهدف ---------- */
  const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
  const toN = s => +String(s).replace(/[٠-٩]/g, d => AD.indexOf(d));
  const near = (ans, n) => { const o = new Set([ans]); let k = 1; while (o.size < n) { const c = ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (ans > 20 ? R(1, 3) : 1); if (c >= 0) o.add(c); k++; } return shuf([...o]); };
  function variant(q) {
    const t = q.prompt;
    let m = t.match(/^ما ناتج ([٠-٩]+) ([+−×÷]) ([٠-٩]+)؟$/);
    if (m) {
      const op = m[2], a0 = toN(m[1]), b0 = toN(m[3]), big = x => x >= 10 ? [10, 99] : [2, 9];
      let a, b;
      for (let k = 0; k < 30; k++) {
        if (op === '÷') { b = R(2, 9); const c = R(2, 10); a = b * c; }
        else { a = R(...big(a0)); b = R(...big(b0)); if (op === '−' && b > a) [a, b] = [b, a]; }
        if (a !== a0 || b !== b0) break;
      }
      const ans = OPS[op](a, b);
      return { ...q, id: q.id + '~' + a + op + b, prompt: `ما ناتج ${D(a)} ${op} ${D(b)}؟`, options: q.type === 'choice' ? near(ans, (q.options || []).length || 3).map(D) : [], correct_answer: D(ans), explanation: `${D(a)} ${op} ${D(b)} = ${D(ans)}.`, _v: 1 };
    }
    m = t.match(/^أكمل: ([٠-٩]+) ([+−×÷]) __ = ([٠-٩]+)$/);
    if (m) {
      const op = m[2], a0 = toN(m[1]);
      let a, x, c;
      if (op === '+') { a = R(5, 20); x = R(2, 9); c = a + x; }
      else if (op === '−') { a = R(12, 30); x = R(2, 9); c = a - x; }
      else if (op === '×') { a = R(2, 9); x = R(2, 9); c = a * x; }
      else { x = R(2, 9); c = R(2, 9); a = x * c; }
      const inv = op === '+' ? `${D(c)} − ${D(a)} = ${D(x)}` : op === '−' ? `${D(a)} − ${D(c)} = ${D(x)}` : op === '×' ? `${D(c)} ÷ ${D(a)} = ${D(x)}` : `${D(a)} ÷ ${D(c)} = ${D(x)}`;
      return { ...q, id: q.id + '~' + a + op + c, prompt: `أكمل: ${D(a)} ${op} __ = ${D(c)}`, options: [], correct_answer: D(x), explanation: `${inv}.`, _v: 1 };
    }
    return null;
  }

  /* ---------- قراءة الرموز الرياضية بالعربية (الكتابة لا تتغيّر) ---------- */
  const SUP = { '²': 'تَرْبِيع', '³': 'تَكْعِيب' }, SUPN = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
  function mathSpeech(t) {
    return String(t)
      .replace(/__/g, ' مَاذَا ')
      .replace(/\p{Extended_Pictographic}/gu, ' ')
      .replace(/^\s*<\s*$/, 'أَصْغَرُ مِنْ').replace(/^\s*>\s*$/, 'أَكْبَرُ مِنْ').replace(/^\s*=\s*$/, 'يُسَاوِي')
      .replace(/([٠-٩]+)\s*⁄\s*([٠-٩]+)/g, '$1 عَلَى $2')
      .replace(/(س|[٠-٩)]+)([²³])(?![⁰-⁹])/g, (m, a, e) => a + ' ' + SUP[e])
      .replace(/([٠-٩س)]+)([⁰¹⁴-⁹]+)/g, (m, a, e) => a + ' أُسّ ' + D([...e].map(c => SUPN[c]).join('')))
      .replace(/(^|[\s(،:=])−(?=[٠-٩])/g, '$1سَالِب ') /* «−٣» عدد سالب؛ «٩ − ٤» طرح (بمسافتين) يُقرأ «ناقص» */
      .replace(/٪/g, ' بِالْمِئَةِ').replace(/°/g, ' دَرَجَةً').replace(/(?<![\u0621-\u064A])سم²/g, 'سَنْتِيمِتْرًا مُرَبَّعًا').replace(/(?<![\u0621-\u064A])سم(?![\u0621-\u064A])/g, 'سَنْتِيمِتْرًا')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------- الصوت: السؤال دائمًا، والخيارات في مرحلتي التأسيس والمبتدئ فقط ---------- */
  const speakQ = (q, si) => {
    try {
      if (window.muted && muted()) return;
      const L = [[mathSpeech(q.prompt), 'ar']];
      if (si <= 1 && q.type === 'choice' && q.options.length) { L.push(['الْخِيَارَاتُ', 'ar']); q.options.forEach(o => L.push([mathSpeech(o), 'ar'])); }
      (window.sayList || (l => say(l.map(x => x[0]).join('، '), 'ar')))(L);
    } catch (_) {}
  };

  /* ---------- واجهة الأكاديمية ---------- */
  const hd = () => `<div class="acad-hd math"><span class="acad-ic">١٢٣</span><div><b>أكاديمية الرياضيات</b><small>أعداد • عمليات • هندسة • جبر</small></div><span class=acad-em>🧮</span></div>`;
  function academy() {
    window.V = 'sec'; window.CS = 'math';
    if (window.Skeleton && Skeleton.cards && !DATA) h(Skeleton.cards());
    load().then(d => {
      const m = M(), flat = unitsFlat(d);
      const done = flat.filter(x => (uStat(x.s, x.u) || {}).mastered).length;
      const next = flat.find(x => !(uStat(x.s, x.u) || {}).mastered && unlocked(d, x.si, x.ui));
      const place = m.place;
      const stg = d.stages.map((s, si) => {
        const us = s.units.map((u, ui) => {
          const st = uStat(s, u), open = unlocked(d, si, ui), n = s.q.filter(q => q.unit_id === u.id).length;
          const badge = st && st.mastered ? '✅' : st ? D(st.best) + '٪' : open ? '▶️' : '🔒';
          return `<button class=row ${open ? `onclick="mathUnit(${si},${ui})"` : 'disabled'}><span>${badge}</span><b>${esc(u.name)}</b><small>${D(n)} ${n > 10 ? 'سؤالًا' : 'أسئلة'}${st ? ` · أفضل نتيجة ${D(st.best)}٪` : ''}</small></button>`;
        }).join('');
        const mst = s.units.filter(u => (uStat(s, u) || {}).mastered).length;
        return `<details class="math-stage" ${(place ? place.stage : 0) === si || (next && next.si === si) ? 'open' : ''}><summary><b>${D(si + 1)}. ${esc(s.name)}</b><small>${esc(s.level || '')} · ${D(mst)}/${D(s.units.length)}</small></summary><div class=list>${us}</div></details>`;
      }).join('');
      h(`<section class=sec>${hd()}<h2 class=acad-h2>🧮 ${g('رِحْلَتُكَ', 'رِحْلَتُكِ')} فِي الرِّيَاضِيَّاتِ</h2>
        ${!place ? `<div class="math-place-cta"><b>🎯 ${g('اِبْدَأْ', 'اِبْدَئِي')} بِاخْتِبَارِ تَحْدِيدِ الْمُسْتَوَى</b><p class=mut>${D(d.place.length)} سؤالًا (نحو ١٥ دقيقة) لنعرف من أين ${g('تَبْدَأُ', 'تَبْدَئِينَ')}. يمكنك أيضًا البدء من الأول مباشرة.</p><button class=big onclick="mathPlacement()">${g('اِبْدَأِ', 'اِبْدَئِي')} الِاخْتِبَارَ ✨</button></div>`
          : `<div class="math-place-res"><span>📍</span><div><b>مستواك: ${esc(d.stages[place.stage] ? d.stages[place.stage].name : '')}</b><small>أتقنت ${D(done)} من ${D(flat.length)} وحدة</small></div><button class=alt onclick="mathPlacement()">🔁 إعادة اختبار المستوى</button></div>`}
        ${next ? `<button class="big math-next" onclick="mathUnit(${next.si},${next.ui})">▶️ ${g('تَابِعْ', 'تَابِعِي')}: ${esc(next.u.name)}</button>` : ''}
        ${(m.wrong || []).length ? `<button class=alt onclick="mathReview()">🔁 مراجعة أخطائي (${D(m.wrong.length)})</button>` : ''}
        ${stg}</section>`);
    }).catch(() => h(`<section class=sec>${hd()}<p class=mut>تعذّر تحميل أكاديمية الرياضيات. تحقّق من الإنترنت ثم حاول مرة أخرى.</p><button class=big onclick="mathAcademy()">🔁 إعادة المحاولة</button></section>`));
  }

  /* ---------- الجلسة (تدريب وحدة، مراجعة، اختبار مستوى) ---------- */
  let S = null;
  function start(o) { S = { i: 0, ok: 0, seen: new Set(), wrong: [], answered: false, ...o }; S.qs.forEach(q => S.seen.add(q.id)); show(); }
  function show() {
    const q = S.qs[S.i]; if (!q) return finish();
    S.answered = false;
    window.V = 'quiz'; window.CS = 'math';
    const total = S.qs.length, place = S.kind === 'place';
    const body = q.type === 'fill'
      ? `<div class=bq-type><input id=mq-in class=bq-in inputmode=${/[س]/.test(q.correct_answer) ? 'text' : 'decimal'} autocomplete=off placeholder="${esc(g('اُكْتُبْ', 'اُكْتُبِي'))} الْإِجَابَةَ" onkeydown="if(event.key==='Enter')mathCheck()"><button class=big onclick="mathCheck()">${place ? 'التالي ←' : 'تحقّق ✓'}</button></div>`
      : `<div class="grid bq-opts math-opts${q.options.length === 2 ? ' two' : ''}">${shuf(q.options).map(o => `<button class=opt data-v="${esc(o)}" onclick="mathAns(this)">${esc(o)}</button>`).join('')}</div>`;
    h(`<section class="sec bank-q math-q"><button class=link onclick="mathAcademy()">→ أكاديمية الرياضيات</button>
      <div class=bq-top><b>${esc(S.name)}</b><small>سؤال ${D(S.i + 1)} من ${D(total)}</small></div>
      <div class=bq-dots>${S.qs.map((x, k) => `<i class="${k < S.i ? (place ? 'cur' : x._ok ? 'ok' : 'no') : k === S.i ? 'cur' : ''}"></i>`).join('')}</div>
      <div class=bq-card>
        ${q._rt ? `<p class=bq-retry>🔁 ${q._v ? 'سُؤَالٌ مُشَابِهٌ بِأَعْدَادٍ جَدِيدَةٍ' : 'فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ'}</p>` : ''}
        <div class="bq-q math-prompt" dir=rtl>${esc(q.prompt)}</div>
        <div class=bq-tools><button class=alt onclick="mathSay()">🔊 اسمع السؤال</button></div>
        ${body}
        <div id=mq-fb class=bq-fb hidden></div>
      </div></section>`);
    setTimeout(() => speakQ(q, S.sid != null ? S.sid : stageIdx(q)), 250);
    const inp = document.getElementById('mq-in'); if (inp) setTimeout(() => inp.focus(), 50);
  }
  const stageIdx = q => DATA ? Math.max(0, DATA.stages.findIndex(s => s.id === q.stage_id)) : 0;
  window.mathSay = () => { const q = S && S.qs[S.i]; if (q) speakQ(q, S.sid != null ? S.sid : stageIdx(q)); };

  function answer(ok, given) {
    if (!S || S.answered) return;
    S.answered = true;
    const q = S.qs[S.i]; q._ok = ok; q._given = given;
    try { window.say && say.stop(); } catch (_) {}
    if (S.kind === 'place') { setTimeout(() => { S.i++; show(); }, 220); return; } /* اختبار المستوى: لا نكشف الإجابات حتى النهاية */
    if (ok) { if (!q._rt) S.ok++; }
    else {
      if (!q._rt) S.wrong.push(q);
      const m = M(); m.wrong = (m.wrong || []).filter(id => id !== (q._src || q.id)); m.wrong.push(q._src || q.id); if (m.wrong.length > 40) m.wrong.shift();
      /* يعود لاحقًا في الجلسة: بأعداد جديدة إن أمكن، وإلا السؤال نفسه مرة واحدة */
      if (!q._rt) { const v = variant(q); const back = v && !S.seen.has(v.id) ? v : { ...q }; back._rt = 1; back._ok = undefined; back._src = q._src || q.id; S.seen.add(back.id); S.qs.splice(Math.min(S.qs.length, S.i + 3), 0, back); }
    }
    if (ok && q._rt) { const m = M(); m.wrong = (m.wrong || []).filter(id => id !== (q._src || q.id)); }
    save();
    try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch (_) {}
    const fb = document.getElementById('mq-fb');
    fb.hidden = false; fb.className = 'bq-fb ' + (ok ? 'good' : 'soft');
    const lead = ok ? g('أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ.', 'أَحْسَنْتِ! إِجَابَةٌ صَحِيحَةٌ.') : 'مُحَاوَلَةٌ جَيِّدَةٌ! الْإِجَابَةُ الصَّحِيحَةُ:';
    fb.innerHTML = `<b class=bq-lead>${ok ? '✅' : '💡'} ${lead}</b>${ok ? '' : `${given ? `<p class=bq-gave>إجابتك: <b>${esc(given)}</b> ✗</p>` : ''}<p class=bq-ans>${esc(q.correct_answer)}</p>`}${q.explanation ? `<p class=bq-e>📘 ${esc(q.explanation)}</p>` : ''}
      <div class=bq-next><button class=big onclick="mathNext()">${S.i + 1 < S.qs.length ? 'التالي ←' : 'النتيجة 🏁'}</button></div>`;
    try { if (!(window.muted && muted())) sayList(ok ? [[lead, 'ar']] : [[lead, 'ar'], [mathSpeech(q.correct_answer), 'ar'], [mathSpeech(q.explanation || ''), 'ar']].filter(x => x[0])); } catch (_) {}
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  window.mathAns = b => {
    if (!S || S.answered) return;
    const q = S.qs[S.i], v = b.dataset.v, ok = norm(v) === norm(q.correct_answer);
    if (S.kind !== 'place') document.querySelectorAll('.math-opts .opt').forEach(x => { x.disabled = true; if (norm(x.dataset.v) === norm(q.correct_answer)) x.classList.add('ok'); });
    if (!ok && S.kind !== 'place') b.classList.add('no');
    if (S.kind === 'place') b.classList.add('picked');
    answer(ok, v);
  };
  window.mathCheck = () => {
    if (!S || S.answered) return;
    const q = S.qs[S.i], inp = document.getElementById('mq-in'), v = inp.value.trim();
    if (!v) return inp.focus();
    const ok = norm(v) === norm(q.correct_answer) || (q.alt || []).some(a => norm(a) === norm(v));
    inp.disabled = true; if (S.kind !== 'place') inp.classList.add(ok ? 'ok' : 'no');
    answer(ok, v);
  };
  window.mathNext = () => { if (!S) return; S.i++; show(); };

  /* ---------- نتيجة جلسة الوحدة: قواعد التعلّم التكيّفي ---------- */
  function finish() {
    if (S.kind === 'place') return placeResult();
    const n = S.qs.filter(q => !q._rt).length, pc = n ? Math.round(S.ok / n * 100) : 0;
    let msg = '', acts = '';
    if (S.kind === 'unit') {
      const m = M(), k = S.key, st = m.u[k] = m.u[k] || { att: 0, best: 0, ok: 0, n: 0 };
      st.att++; st.n += n; st.ok += S.ok; st.best = Math.max(st.best, pc); st.last = Date.now();
      const enough = n >= Math.min(MIN_Q, S.pool);
      if (pc >= MASTER && enough) { st.mastered = 1; if (window.P) P.star = (+P.star || 0) + 3; }
      save();
      const nx = DATA && unitsFlat(DATA).find(x => !(uStat(x.s, x.u) || {}).mastered && unlocked(DATA, x.si, x.ui));
      if (pc >= MASTER) { msg = g('مُمْتَازٌ! أَتْقَنْتَ هَذِهِ الْوَحْدَةَ، وَفُتِحَتِ الْوَحْدَةُ التَّالِيَةُ.', 'مُمْتَازَةٌ! أَتْقَنْتِ هَذِهِ الْوَحْدَةَ، وَفُتِحَتِ الْوَحْدَةُ التَّالِيَةُ.'); if (nx) acts += `<button class=big onclick="mathUnit(${nx.si},${nx.ui})">▶️ الوحدة التالية: ${esc(nx.u.name)}</button>`; }
      else if (pc >= 60) { msg = 'جَيِّدٌ! رَاجِعْ أَخْطَاءَكَ أَدْنَاهُ، ثُمَّ تَدَرَّبْ عَلَيْهَا لِتَصِلَ إِلَى ٨٥٪.'; acts += `<button class=big onclick="mathUnit(${S.si},${S.ui},1)">🎯 تدريب موجّه على أخطائي</button>`; }
      else { msg = 'لَا بَأْسَ، نَتَعَلَّمُ خُطْوَةً خُطْوَةً. اِقْرَأِ الشَّرْحَ ثُمَّ جَرِّبْ تَدْرِيبًا أَسْهَلَ.'; acts += `<button class=big onclick="mathUnit(${S.si},${S.ui},2)">🌱 تدريب أسهل</button>`; }
      acts += `<button class=alt onclick="mathUnit(${S.si},${S.ui})">🔁 إعادة الوحدة</button>`;
    } else { msg = pc >= 85 ? 'أَحْسَنْتَ! صَحَّحْتَ أَخْطَاءَكَ.' : 'تَحَسَّنْتَ! وَاصِلِ الْمُرَاجَعَةَ.'; }
    const W = S.wrong.map(q => `<li><b>${esc(q.prompt)}</b><span>الصحيح: ${esc(q.correct_answer)}</span>${q.explanation ? `<small>📘 ${esc(q.explanation)}</small>` : ''}</li>`).join('');
    h(`<section class="sec math-res"><div class=be-hero><span>${pc >= MASTER ? '🏆' : pc >= 60 ? '🌟' : '🌱'}</span><b>${D(pc)}٪</b><small>${D(S.ok)} من ${D(n)} صحيحة</small></div>
      <p class=be-msg>${girl() ? window.studentGenderText ? studentGenderText(msg) : msg : msg}</p>
      ${W ? `<h3>📘 أخطاء نتعلّم منها</h3><ul class=math-wrong>${W}</ul>` : ''}
      <div class=be-acts>${acts}<button class=alt onclick="mathAcademy()">🧮 أكاديمية الرياضيات</button></div></section>`);
    try { if (!(window.muted && muted())) say(msg, 'ar', null, pc >= MASTER ? 'cheer' : 'soft'); } catch (_) {}
    S = null;
  }

  /* ---------- تدريب وحدة: mode 1 = موجّه على الأخطاء، 2 = أسهل ---------- */
  window.mathUnit = (si, ui, mode) => load().then(d => {
    const s = d.stages[si], u = s && s.units[ui];
    if (!u || !unlocked(d, si, ui)) return academy();
    const base = s.q.filter(q => q.unit_id === u.id);
    let qs = shuf(base);
    const m = M();
    if (mode === 1) { const w = new Set(m.wrong || []); qs = [...qs.filter(q => w.has(q.id)), ...qs.filter(q => !w.has(q.id))]; }
    if (mode === 2) qs = [...base].sort((a, b) => (a.type === 'fill') - (b.type === 'fill') || a.prompt.length - b.prompt.length);
    /* نكمل حتى ١٠ أسئلة بأسئلة مشابهة بأعداد جديدة (نفس الهدف التعليمي) */
    const seen = new Set(qs.map(q => q.id));
    for (let k = 0; qs.length < MIN_Q && k < 40; k++) { const v = variant(base[k % base.length]); if (v && !seen.has(v.id)) { seen.add(v.id); qs.push(v); } }
    start({ kind: 'unit', si, ui, sid: si, key: uk(s, u), name: `${s.name} · ${u.name}`, qs, pool: qs.length });
  }).catch(() => academy());

  window.mathReview = () => load().then(d => {
    const ids = (M().wrong || []).slice(-12), qs = shuf(ids.map(id => d.Q[id]).filter(Boolean));
    if (!qs.length) return academy();
    start({ kind: 'review', name: '🔁 مراجعة أخطائي', qs });
  }).catch(() => academy());

  /* ---------- اختبار تحديد المستوى ---------- */
  window.mathPlacement = () => load().then(d => {
    const qs = d.stages.flatMap(s => shuf(d.place.filter(q => q.stage_id === s.id))).map(q => ({ ...q }));
    if (!qs.length) return academy();
    start({ kind: 'place', name: '🎯 اختبار تحديد المستوى', qs });
  }).catch(() => academy());

  function placeResult() {
    const d = DATA, rows = d.stages.map((s, si) => { const q = S.qs.filter(x => x.stage_id === s.id), ok = q.filter(x => x._ok).length; return { s, si, q, ok, pass: q.length ? ok >= Math.min(PLACE_PASS, q.length) : true }; });
    /* أعلى مرحلة متتالية مجتازة: أول مرحلة غير مجتازة هي نقطة البداية؛ إن اجتاز الجميع يبدأ بالإتقان */
    const firstFail = rows.find(r => !r.pass), stage = firstFail ? firstFail.si : rows.length - 1;
    const strengths = rows.filter(r => r.pass && r.q.length).map(r => r.s.name);
    const review = S.qs.filter(q => !q._ok).map(q => { const s = d.stages.find(x => x.id === q.stage_id), u = s && s.units.find(x => x.id === q.unit_id); return u ? u.name : ''; }).filter((x, i, a) => x && a.indexOf(x) === i);
    const m = M(); m.place = { stage, at: Date.now(), scores: rows.map(r => [r.s.id, r.ok, r.q.length]), review };
    m.wrong = [...new Set([...(m.wrong || []), ...S.qs.filter(q => !q._ok).map(q => q.id)])].slice(-40);
    save();
    const total = S.qs.filter(q => q._ok).length;
    const msg = `${g('اِنْتَهَيْتَ', 'اِنْتَهَيْتِ')} مِنَ الِاخْتِبَارِ! ${g('سَتَبْدَأُ', 'سَتَبْدَئِينَ')} مِنْ ${d.stages[stage].name}.`;
    h(`<section class="sec math-res"><div class=be-hero><span>🎯</span><b>${D(total)}/${D(S.qs.length)}</b><small>نقطة البداية: ${esc(d.stages[stage].name)}</small></div>
      <h3>📊 نتيجة كل مرحلة</h3><div class=list>${rows.map(r => `<div class=row><span>${r.pass ? '✅' : '📌'}</span><b>${esc(r.s.name)}</b><small>${D(r.ok)} من ${D(r.q.length)}</small></div>`).join('')}</div>
      ${strengths.length ? `<h3>💪 نقاط القوة</h3><p class=mut>${strengths.map(esc).join('، ')}</p>` : ''}
      ${review.length ? `<h3>🔁 مهارات تحتاج مراجعة</h3><p class=mut>${review.map(esc).join('، ')}</p>` : ''}
      <h3>📘 مراجعة الإجابات</h3><ul class=math-wrong>${S.qs.filter(q => !q._ok).map(q => `<li><b>${esc(q.prompt)}</b><span>الصحيح: ${esc(q.correct_answer)}</span>${q.explanation ? `<small>📘 ${esc(q.explanation)}</small>` : ''}</li>`).join('') || '<li>✨ كل إجاباتك صحيحة!</li>'}</ul>
      <div class=be-acts><button class=big onclick="mathAcademy()">▶️ ${g('اِبْدَأْ', 'اِبْدَئِي')} رِحْلَتَكَ</button></div></section>`);
    try { if (!(window.muted && muted())) say(msg, 'ar', null, 'cheer'); } catch (_) {}
    S = null;
  }

  window.mathAcademy = academy;
  window.MathAcademy = { load, variant, norm, merge, unlocked, current: () => S && S.qs[S.i], speech: mathSpeech };
})();
