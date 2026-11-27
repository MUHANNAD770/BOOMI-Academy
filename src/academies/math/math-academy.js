/* src/academies/math/math-academy.js — أكاديمية الرياضيات: ست مراحل من التأسيس إلى الإتقان، وفي كل مرحلة وحدات مهارية.
   • البيانات من دفعات data/math/*.json (الفهرس data/math/index.json): كل دفعة جديدة تُضاف بملف واحد دون تعديل الكود.
   • أول دخول: اختبار تحديد المستوى (سؤال في كل شاشة، بلا كشف الإجابات حتى النهاية، ونتيجة كل مرحلة وحدها).
   • اختبار لكل وحدة (درس) ولكل مرحلة. الإتقان ٨٥٪؛ ٦٠–٨٤٪ مراجعة وتدريب إضافي؛ أقل من ٦٠٪ شرح مبسّط ثم تدريب أسهل.
   • الخطأ: شرح الحل فورًا + مثال محلول مشابه + تمرين مشابه يعود لاحقًا في الجلسة (بأعداد جديدة إن أمكن).
   • تنويع: الأسئلة التي لم تُعرض مؤخرًا أولًا، ولا يتكرر السؤال في الجلسة. التصحيح يقبل الأرقام العربية والإنجليزية والإجابات المكافئة.
   • التقدّم في P.math (يُحفظ تلقائيًا ويُزامَن مع ملف الطالب، ويظهر في لوحة ولي الأمر). */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const girl = () => window.P && P.gender === 'female';
  const g = (m, f) => girl() ? f : m;
  const gx = t => girl() && window.studentGenderText ? studentGenderText(t) : t;
  const MASTER = 85, REVIEW = 60, MIN_Q = 10, STAGE_Q = 12, PLACE_PASS = 2;

  /* ---------- البيانات: دمج الدفعات ---------- */
  let DATA = null, LOADING = null;
  function merge(batches) {
    const st = [], byId = {}, Q = {}, place = [];
    for (const b of batches) {
      for (const s of (b.stages || [])) {
        let t = byId[s.id];
        if (!t) { t = byId[s.id] = { id: s.id, name: s.name, level: s.level, units: [], q: [] }; st.push(t); }
        if (!t.level && s.level) t.level = s.level;
        for (const u of (s.units || [])) if (!t.units.some(x => x.id === u.id)) t.units.push({ id: u.id, name: u.name, intro: u.intro || '' });
        for (const q of (s.questions || [])) if (!Q[q.id]) { const x = { ...q, options: q.options || [], stage_id: s.id }; Q[q.id] = x; t.q.push(x); }
      }
      const pt = b.placement_test;
      if (pt) for (const x of (pt.questions || [])) {
        const q = typeof x === 'string' ? Q[x] : x;
        if (q && !place.some(p => p.id === q.id)) place.push({ ...q, stage_id: q.stage_id || (Q[q.id] || {}).stage_id });
      }
    }
    /* وحدة بلا أسئلة لا تُعرض */
    st.forEach(s => { s.units = s.units.filter(u => s.q.some(q => q.unit_id === u.id)); });
    return { stages: st, Q, place };
  }
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (LOADING) return LOADING;
    LOADING = fetch('data/math/index.json?v=3', { cache: 'no-cache' }).then(r => r.json())
      .then(ix => Promise.all((ix.batches || []).map(f => fetch('data/math/' + f + '?v=3', { cache: 'no-cache' }).then(r => r.json()))))
      .then(bs => { DATA = merge(bs); migrate(DATA); return DATA; })
      .catch(e => { LOADING = null; throw e; });
    return LOADING;
  }

  /* أُضيفت مرحلة «ما قبل التأسيس» أوّلًا: رقم مرحلة البداية المحفوظ سابقًا يُزاح واحدًا حتى لا يرجع الطالب للخلف،
     ومن اختار سابقًا «ابدأ من المرحلة الأولى» يبقى من التأسيس */
  function migrate(d) {
    try {
      const m = window.P && P.math;
      if (!m || m.pv >= 2 || !d.stages[0] || d.stages[0].id !== 'pre_foundation') return;
      if (m.place && typeof m.place.stage === 'number') m.place.stage += 1;
      else if (m.skip && Object.keys(m.u || {}).length) m.from = 1;
      m.pv = 2;
      save();
    } catch (_) {}
  }

  /* ---------- التقدّم ---------- */
  const M = () => { const p = window.P; if (!p) return { u: {}, st: {}, seen: {} }; const m = p.math = p.math || {}; m.u = m.u || {}; m.st = m.st || {}; m.seen = m.seen || {}; return m; };
  const save = () => { try { window.save && window.save(); } catch (_) {} };
  const uk = (s, u) => s.id + '/' + u.id;
  const uStat = (s, u) => M().u[uk(s, u)] || null;
  const unitsFlat = d => d.stages.flatMap((s, si) => s.units.map((u, ui) => ({ s, si, u, ui })));
  const stagePassed = (d, si) => { const s = d.stages[si]; return !!(s && (M().st[s.id] || {}).passed); };
  /* الوحدة مفتوحة: في مرحلة البداية المقترحة أو قبلها، أو بعد إتقان الوحدة السابقة، أو باجتياز اختبار المرحلة السابقة */
  /* إتقان قبل الانتقال (طلب صاحب المشروع): لا ينتقل الطالب إلى الوحدة التالية إلا بعد إتقان السابقة (٨٥٪)،
     ولا إلى المرحلة التالية إلا بعد إتقان كل وحدات المرحلة أو اجتياز اختبارها. المراحل قبل نقطة البداية (من اختبار المستوى) مفتوحة */
  const startOf = m => m.place ? m.place.stage : (m.from || 0);
  const stageDone = (d, si) => { const s = d.stages[si]; return !s || si < startOf(M()) || stagePassed(d, si) || s.units.every(u => (uStat(s, u) || {}).mastered); };
  function unlocked(d, si, ui) {
    const m = M();
    if (m.unlockAll || (window.P && P.unlockAll)) return true;
    const start = startOf(m);
    if (si < start) return true;
    if (si > start && !stageDone(d, si - 1)) return false;
    if (ui === 0) return true;
    const s = d.stages[si], st = s && uStat(s, s.units[ui - 1]);
    return !!(st && st.mastered);
  }
  const stageOpen = (d, si) => unlocked(d, si, 0);
  const mark = id => { const m = M(); m.seen[id] = Date.now(); const ks = Object.keys(m.seen); if (ks.length > 500) ks.sort((a, b) => m.seen[a] - m.seen[b]).slice(0, ks.length - 500).forEach(k => delete m.seen[k]); };
  const log = e => { const m = M(); m.log = m.log || []; m.log.push({ ...e, t: Date.now() }); if (m.log.length > 60) m.log.shift(); };

  /* ---------- مقارنة الإجابة: الأرقام العربية والإنجليزية والإجابات المكافئة ---------- */
  const SUPD = { '٢': '²', '٣': '³', '٤': '⁴' };
  const norm = s => String(s == null ? '' : s).normalize('NFKC')
    .replace(/[0-9]/g, d => AD[d]).replace(/[۰-۹]/g, d => AD[d.charCodeAt(0) - 0x06F0]).replace(/%/g, '٪')
    .replace(/\^\s*([٠-٩])/g, (m, d) => SUPD[d] || m).replace(/[²³⁴]/g, c => c)
    .replace(/(?<![ء-ي])س([٢٣٤])(?![٠-٩])/g, (m, d) => 'س' + SUPD[d])
    .replace(/[\/⁄∕÷](?=\s*[٠-٩])/g, (m) => m === '÷' ? m : '⁄').replace(/[\/∕]/g, '⁄')
    .replace(/[−–—-]/g, '−').replace(/\.(?=[٠-٩])/g, '٫').replace(/[×xX*](?=\s*[٠-٩(])/g, '×')
    .replace(/[،,؛;]/g, '،').replace(/\s*،\s*/g, '،').replace(/\s+/g, '').replace(/[.。]$/, '')
    .replace(/^(.+?)(?:سم²|سم³|سم|م²|متر(?:ًا)?|ريال(?:ًا|ات)?|درجة|دقيقة|مل|كم⁄ساعة|كجم|لترًا|لتر)$/, (m, a) => /[٠-٩]/.test(a) ? a : m)
    .replace(/°$/, '').replace(/^\+/, '');
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  /* قيمة عددية: صحيح، عشري، كسر، نسبة مئوية → [بسط، مقام] */
  function num(s) {
    const t = norm(s).replace(/[٠-٩]/g, d => AD.indexOf(d)).replace('٫', '.').replace(/^−/, '-');
    let m = t.match(/^(-?\d+)⁄(\d+)$/);
    if (m) return { n: +m[1], d: +m[2], frac: true };
    m = t.match(/^(-?\d+(?:\.\d+)?)٪?$/);
    if (m) { const k = (m[1].split('.')[1] || '').length, d = 10 ** k; return { n: Math.round(+m[1] * d), d, pct: /٪$/.test(t) }; }
    return null;
  }
  const eqv = (a, b) => a && b && a.n * b.d === b.n * a.d;
  const setOf = s => norm(s).replace(/±(.+)/, '$1و−$1').split(/و|،|أو/).filter(Boolean).map(x => x.replace(/^\+/, '')).sort().join('|');
  function same(given, q) {
    const G = norm(given), C = [q.correct_answer, ...(q.alt || [])];
    if (C.some(c => norm(c) === G)) return true;
    const simplest = /بسط|مبسط|أبسط/.test(q.prompt);
    const gv = num(given);
    for (const c of C) {
      const cv = num(c);
      if (gv && cv && eqv(gv, cv)) { if (simplest && gv.frac && gcd(gv.n, gv.d) !== 1) return false; return true; }
      /* الجذور («٧ و−٧»): الترتيب لا يهم؛ أما القوائم المرتبة («١، ٢، ٣») فالترتيب جزء من الإجابة */
      if (/و|±/.test(norm(c)) && setOf(c) === setOf(given)) return true;
    }
    return false;
  }

  /* ---------- أسئلة مشابهة بأعداد جديدة (نفس الهدف التعليمي) ---------- */
  const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
  const toN = s => +String(s).replace(/[٠-٩]/g, d => AD.indexOf(d));
  const near = (ans, n) => { const o = new Set([ans]); let k = 1; while (o.size < n) { const c = ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.abs(ans) > 20 ? R(1, 3) : 1); if (c >= 0 || ans < 0) o.add(c); k++; } return shuf([...o]); };
  const range = x => x >= 100 ? [100, 999] : x >= 10 ? [10, 99] : [2, 9];
  function pair(op, a0, b0) {
    let a, b;
    for (let k = 0; k < 40; k++) {
      if (op === '÷') { b = R(...(b0 >= 10 ? [10, 19] : [2, 9])); a = b * R(2, a0 >= 100 ? 40 : 12); }
      else if (op === '×') { a = R(...(a0 > 12 ? range(a0) : [2, 12])); b = R(...(b0 > 12 ? [2, 9] : [2, 12])); }
      else { a = R(...range(a0)); b = R(...range(b0)); if (op === '−' && b > a) [a, b] = [b, a]; if (op === '−' && a === b) a++; }
      if (a !== a0 || b !== b0) break;
    }
    return [a, b];
  }
  const fx = (n, d) => { const k = gcd(n, d); return [n / k, d / k]; };
  const FR = (n, d) => d === 1 ? D(n) : `${D(n)}⁄${D(d)}`;
  function variant(q) {
    const t = q.prompt, ch = q.type === 'choice', base = { ...q, _v: 1 };
    let m = t.match(/^(ما ناتج |احسب: )([٠-٩]+) ([+−×÷]) ([٠-٩]+)(؟| = __|)$/);
    if (m) {
      const op = m[3], [a, b] = pair(op, toN(m[2]), toN(m[4])), ans = OPS[op](a, b);
      return { ...base, id: q.id + '~' + a + op + b, prompt: `${m[1]}${D(a)} ${op} ${D(b)}${m[5]}`, options: ch ? near(ans, q.options.length || 3).map(D) : [], correct_answer: D(ans), alt: [], explanation: `${D(a)} ${op} ${D(b)} = ${D(ans)}.` };
    }
    m = t.match(/^(أكمل: |ما العدد الناقص؟ )([٠-٩]+) ([+−×÷]) __ = ([٠-٩]+)$/);
    if (m) {
      const op = m[3], a0 = toN(m[2]); let a, x, c;
      if (op === '+') { a = R(...range(a0)); x = R(2, a0 >= 10 ? 60 : 9); c = a + x; }
      else if (op === '−') { a = R(Math.max(12, a0 / 2), Math.max(30, a0 * 1.5) | 0); x = R(2, Math.min(a - 1, 60)); c = a - x; }
      else if (op === '×') { a = R(2, 9); x = R(2, 9); c = a * x; }
      else { x = R(2, 9); c = R(2, 9); a = x * c; }
      const inv = op === '+' ? `${D(c)} − ${D(a)} = ${D(x)}` : op === '−' ? `${D(a)} − ${D(c)} = ${D(x)}` : op === '×' ? `${D(c)} ÷ ${D(a)} = ${D(x)}` : `${D(a)} ÷ ${D(c)} = ${D(x)}`;
      return { ...base, id: q.id + '~' + a + op + c, prompt: `${m[1]}${D(a)} ${op} __ = ${D(c)}`, options: ch ? near(x, q.options.length || 3).map(D) : [], correct_answer: D(x), alt: [], explanation: `${inv}.` };
    }
    m = t.match(/^(أكمل: |)([٠-٩]+) = (?:([٠-٩]+) \+ __|__ \+ ([٠-٩]+))$/);
    if (m) {
      const a = R(3, toN(m[2]) >= 10 ? 15 : 6), x = R(1, toN(m[2]) >= 10 ? 15 : 6), c = a + x;
      return { ...base, id: q.id + '~' + c + '=' + a, prompt: m[3] ? `${m[1]}${D(c)} = ${D(a)} + __` : `${m[1]}${D(c)} = __ + ${D(a)}`, options: [], correct_answer: D(x), alt: [], explanation: `${D(c)} − ${D(a)} = ${D(x)}.` };
    }
    m = t.match(/^حل المعادلة: س ([+−]) ([٠-٩]+) = ([٠-٩]+)(؛ س = __|)$/);
    if (m) {
      const op = m[1], a = R(2, 20), x = R(op === '−' ? 2 : 1, 25), c = op === '+' ? x + a : x - a;
      if (c <= 0) return null;
      return { ...base, id: q.id + '~' + a + op + c, prompt: `حل المعادلة: س ${op} ${D(a)} = ${D(c)}${m[4]}`, options: ch ? near(x, 3).map(D) : [], correct_answer: D(x), alt: [], explanation: op === '+' ? `نطرح ${D(a)} من الطرفين: س = ${D(c)} − ${D(a)} = ${D(x)}.` : `نضيف ${D(a)} إلى الطرفين: س = ${D(c)} + ${D(a)} = ${D(x)}.` };
    }
    m = t.match(/^حل المعادلة: ([٠-٩]+)س = ([٠-٩]+)(؛ س = __|)$/);
    if (m) {
      const a = R(2, 9), x = R(2, 12), c = a * x;
      return { ...base, id: q.id + '~' + a + 'x' + c, prompt: `حل المعادلة: ${D(a)}س = ${D(c)}${m[3]}`, options: [], correct_answer: D(x), alt: [], explanation: `نقسم الطرفين على ${D(a)}: س = ${D(c)} ÷ ${D(a)} = ${D(x)}.` };
    }
    m = t.match(/^احسب: ([٠-٩]+)⁄([٠-٩]+) ([×÷]) ([٠-٩]+)⁄([٠-٩]+) = __$/);
    if (m) {
      const op = m[3], a = R(1, 5), b = R(a + 1, 9), c = R(1, 5), e = R(c + 1, 9);
      const [n, d] = op === '×' ? fx(a * c, b * e) : fx(a * e, b * c);
      return { ...base, id: q.id + '~' + a + b + op + c + e, prompt: `احسب: ${D(a)}⁄${D(b)} ${op} ${D(c)}⁄${D(e)} = __`, options: [], correct_answer: FR(n, d), alt: [],
        explanation: op === '×' ? `نضرب البسطين والمقامين: ${D(a * c)}⁄${D(b * e)}، وأبسط صورة ${FR(n, d)}.` : `نضرب في مقلوب الكسر الثاني: ${D(a)}⁄${D(b)} × ${D(e)}⁄${D(c)} = ${FR(n, d)}.` };
    }
    m = t.match(/^(أكمل: |)([٠-٩]+)⁄([٠-٩]+) \+ ([٠-٩]+)⁄([٠-٩]+) = __$/);
    if (m && m[3] === m[5]) {
      const d0 = R(3, 9), a = R(1, d0 - 2), b = R(1, d0 - 1 - a), [n, d] = fx(a + b, d0);
      return { ...base, id: q.id + '~' + a + '+' + b + '/' + d0, prompt: `${m[1]}${D(a)}⁄${D(d0)} + ${D(b)}⁄${D(d0)} = __`, options: [], correct_answer: FR(n, d), alt: [`${D(a + b)}⁄${D(d0)}`], explanation: `المقامان متساويان؛ نجمع البسطين: ${D(a)} + ${D(b)} = ${D(a + b)}، فيكون ${D(a + b)}⁄${D(d0)}${n !== a + b ? ` = ${FR(n, d)}` : ''}.` };
    }
    return null;
  }

  /* ---------- قراءة الرموز الرياضية بالعربية (الكتابة لا تتغيّر) ---------- */
  const SUP = { '²': 'تَرْبِيع', '³': 'تَكْعِيب' }, SUPN = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
  function mathSpeech(t) {
    return String(t)
      .replace(/__/g, ' مَاذَا ')
      /* ألوان الأنماط تُقرأ (أحمر، أزرق…)؛ صور العدّ لا تُقرأ حتى لا يُكشف الجواب */
      .replace(/🔴/g, ' أَحْمَرُ، ').replace(/🔵/g, ' أَزْرَقُ، ').replace(/🟢/g, ' أَخْضَرُ، ').replace(/🟡/g, ' أَصْفَرُ، ')
      .replace(/\p{Extended_Pictographic}/gu, ' ').replace(/،\s*(مَاذَا|$)/g, '، $1').replace(/،\s*$/, '')
      .replace(/^\s*<\s*$/, 'أَصْغَرُ مِنْ').replace(/^\s*>\s*$/, 'أَكْبَرُ مِنْ').replace(/^\s*=\s*$/, 'يُسَاوِي')
      .replace(/\s>\s/g, ' أَكْبَرُ مِنْ ').replace(/\s<\s/g, ' أَصْغَرُ مِنْ ')
      .replace(/√\s*\(?([٠-٩]+)\)?/g, 'الْجَذْرُ التَّرْبِيعِيُّ لِـ $1')
      .replace(/∫/g, 'تَكَامُلُ ').replace(/±/g, 'مُوجَب أَوْ سَالِب ')
      .replace(/([٠-٩]+)\s*⁄\s*([٠-٩]+)/g, '$1 عَلَى $2')
      .replace(/([٠-٩]+) : ([٠-٩]+)/g, '$1 إِلَى $2')
      .replace(/(س|[٠-٩)]+)([²³])(?![⁰-⁹])/g, (m, a, e) => a + ' ' + SUP[e])
      .replace(/([٠-٩س)]+)([⁰¹⁴-⁹]+)/g, (m, a, e) => a + ' أُسّ ' + D([...e].map(c => SUPN[c]).join('')))
      .replace(/(^|[\s(،:=])−(?=[٠-٩])/g, '$1سَالِب ') /* «−٣» عدد سالب؛ «٩ − ٤» طرح (بمسافتين) يُقرأ «ناقص» */
      .replace(/٪/g, ' بِالْمِئَةِ').replace(/°/g, ' دَرَجَةً')
      .replace(/(?<![ء-ي])سم²/g, 'سَنْتِيمِتْرًا مُرَبَّعًا').replace(/(?<![ء-ي])سم³/g, 'سَنْتِيمِتْرًا مُكَعَّبًا').replace(/(?<![ء-ي])سم(?![ء-ي])/g, 'سَنْتِيمِتْرًا')
      .replace(/(?<![ء-ي])م²/g, 'مِتْرًا مُرَبَّعًا').replace(/كم\/ساعة/g, 'كِيلُومِتْرًا فِي السَّاعَةِ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------- صور «ما قبل التأسيس»: الخيار صورة لا كلمة ----------
     «⚽» صورة · «big:🎈»/«small:🎈» كبير/صغير · «long:✏️»/«short:✏️» طويل/قصير · «x3:🍎» مجموعة · «⚪ 🟦» صورتان */
  /* صورة ثلاثية الأبعاد بحجم نتحكّم فيه (لا مشهد بخلفية): للمقارنة بين كبير/صغير وطويل/قصير والمجموعات */
  const e3 = e => {
    const c = [...e].map(x => x.codePointAt(0).toString(16)).filter(x => x !== 'fe0f').join('-');
    return `<img class=mp-i src="img/3d/${c}.webp" alt="${esc(e)}" draggable=false data-no3d onerror="this.replaceWith(this.alt)">`;
  };
  function pic(t, inner) {
    let m;
    if ((m = /^x(\d+):(.+)$/.exec(t))) return `<span class=mp-grp>${Array.from({ length: +m[1] }, () => pic(m[2], 1)).join('')}</span>`;
    if ((m = /^(big|small):(.+)$/.exec(t))) return `<span class="mp-${m[1]}">${e3(m[2])}</span>`;
    if ((m = /^(long|short):(.+)$/.exec(t))) return `<span class="mp-len mp-${m[1]}"><i></i>${e3(m[2])}</span>`;
    return inner && /\p{Extended_Pictographic}/u.test(t) ? e3(t) : esc(t);
  }
  const optHTML = t => String(t).split(' ').map(pic).join(' ');
  const isPic = q => !!(q && (q.visual || q.labels || (q.options || []).some(o => /^(x\d+|big|small|long|short):/.test(o))));
  /* اسم الخيار المنطوق والمكتوب (الصور لها أسماء في labels) */
  const lab = (q, o) => (q && q.labels && q.labels[o]) || mathSpeech(o);

  /* ---------- الصوت: السؤال دائمًا، والخيارات في المراحل الأولى (ما قبل التأسيس، التأسيس، المبتدئ) ---------- */
  const speakQ = (q, si) => {
    try {
      if (window.muted && muted()) return;
      const L = [[mathSpeech(q.prompt), 'ar']];
      if (S && S.i === 0 && S.intro) L.unshift([S.intro, 'ar']);
      /* أسئلة الصور: نقرأ السؤال فقط (الطفل يختار الصورة)، ونقرأ أسماء الخيارات إن كانت أرقامًا أو ألوانًا */
      if (si <= 2 && q.type === 'choice' && q.options.length && !(isPic(q) && !q.labels)) { L.push(['الْخِيَارَاتُ', 'ar']); q.options.forEach(o => L.push([lab(q, o), 'ar'])); }
      (window.sayList || (l => say(l.map(x => x[0]).join('، '), 'ar')))(L);
    } catch (_) {}
  };

  /* ---------- واجهة الأكاديمية ---------- */
  const hd = () => `<div class="acad-hd math"><span class="acad-ic">١٢٣</span><div><b>أكاديمية الرياضيات</b><small>أعداد • عمليات • هندسة • جبر</small></div><span class=acad-em>🧮</span></div>`;
  const QH = { t1: 'أَكَادِيمِيَّةُ', t2: 'الرِّيَاضِيَّاتِ', sub: 'رِحْلَةٌ مُمْتِعَةٌ فِي عَالَمِ الْأَعْدَادِ وَالْأَشْكَالِ' };
  const back = () => `<button class=link onclick="home()">← الرئيسية</button>`;
  /* أول دخول: شاشة اختبار تحديد المستوى */
  function intro(d) {
    window.V = 'sec'; window.CS = 'math';
    h(`<section class="sec math-intro${window.Quest ? ' qx' : ''}">${window.Quest ? Quest.head(QH) : back() + hd()}
      <div class=math-intro-card><span class=math-intro-owl>🦉</span>
        <h2>${g('أَهْلًا بِكَ', 'أَهْلًا بِكِ')} فِي أَكَادِيمِيَّةِ الرِّيَاضِيَّاتِ!</h2>
        <p>${g('قَبْلَ أَنْ نَبْدَأَ، سَنَعْرِفُ مُسْتَوَاكَ بِاخْتِبَارٍ قَصِيرٍ', 'قَبْلَ أَنْ نَبْدَأَ، سَنَعْرِفُ مُسْتَوَاكِ بِاخْتِبَارٍ قَصِيرٍ')}: ${D(d.place.length)} سؤالًا من كل المراحل (نحو ١٥ دقيقة). لا تظهر الإجابات إلا في النهاية، فأجب بهدوء.</p>
        <ul class=math-intro-list><li>📊 نتيجة لكل مرحلة</li><li>💪 نقاط القوة</li><li>🔁 المهارات التي تحتاج مراجعة</li><li>🗺️ مسار تعلّم خاص بك</li></ul>
        <button class=big onclick="mathPlacement()">🎯 ${g('اِبْدَأِ', 'اِبْدَئِي')} اخْتِبَارَ تَحْدِيدِ الْمُسْتَوَى</button>
        <button class=alt onclick="mathSkipPlacement()">${g('اِبْدَأْ', 'اِبْدَئِي')} مِنَ الْمَرْحَلَةِ الْأُولَى بِدُونِ اخْتِبَارٍ</button>
      </div></section>`);
    try { if (!(window.muted && muted())) say(gx('أَهْلًا بِكَ فِي أَكَادِيمِيَّةِ الرِّيَاضِيَّاتِ! هَيَّا نَعْرِفُ مُسْتَوَاكَ بِاخْتِبَارٍ قَصِيرٍ.'), 'ar', null, 'cheer'); } catch (_) {}
  }
  window.mathSkipPlacement = () => { const m = M(); m.skip = 1; save(); academy(); };
  function academy() {
    window.V = 'sec'; window.CS = 'math';
    if (window.Skeleton && Skeleton.cards && !DATA) h(Skeleton.cards());
    load().then(d => {
      const m = M(), flat = unitsFlat(d);
      if (!m.place && !m.skip) return intro(d);
      const done = flat.filter(x => (uStat(x.s, x.u) || {}).mastered).length;
      const place = m.place, from = place ? place.stage : (m.from || 0);
      /* الخطوة التالية تبدأ من مرحلة البداية المقترحة (لا من المرحلة الأولى) */
      const open = x => !(uStat(x.s, x.u) || {}).mastered && unlocked(d, x.si, x.ui);
      const next = flat.find(x => x.si >= from && open(x)) || flat.find(open);
      const stg = d.stages.map((s, si) => {
        const us = s.units.map((u, ui) => {
          const st = uStat(s, u), open = unlocked(d, si, ui), n = s.q.filter(q => q.unit_id === u.id).length;
          const badge = st && st.mastered ? '✅' : st ? D(st.best) + '٪' : open ? '▶️' : '🔒';
          return `<button class="row math-unit" ${open ? `onclick="mathUnit(${si},${ui})"` : 'disabled'}><span>${badge}</span><b>${esc(u.name)}</b><small>${D(n)} ${n > 10 ? 'سؤالًا' : 'أسئلة'}${st ? ` · أفضل نتيجة ${D(st.best)}٪` : ''}</small></button>`;
        }).join('');
        const mst = s.units.filter(u => (uStat(s, u) || {}).mastered).length, sst = m.st[s.id], open = stageOpen(d, si);
        const pct = s.units.length ? Math.round(mst / s.units.length * 100) : 0;
        const test = `<button class="row math-stage-test" ${open ? `onclick="mathStageTest(${si})"` : 'disabled'}><span>${sst && sst.passed ? '🏆' : open ? '🏁' : '🔒'}</span><b>اختبار ${esc(s.name)}</b><small>${D(STAGE_Q)} سؤالًا من كل الوحدات${sst ? ` · أفضل نتيجة ${D(sst.best)}٪` : ''}</small></button>`;
        if (window.Quest) return `<details class="qx-st qx-c${si % 8}">${Quest.card({ tag: 'summary', c: si, ic: Quest.STAGE.math[si] || '', t: esc(s.name), s: `${esc(s.level || '')} · ${D(s.units.length)} وَحَدَاتٍ${sst && sst.passed ? ' · 🏆' : ''}`, n: mst })}<div class=list>${us}${test}</div></details>`;
        return `<details class="math-stage" ${(next ? next.si : (place ? place.stage : 0)) === si ? 'open' : ''}><summary><span class=math-stage-n>${D(si + 1)}</span><b>${esc(s.name)}</b><small>${esc(s.level || '')}</small><i class=math-stage-bar><em style="width:${pct}%"></em></i><small>${D(mst)}/${D(s.units.length)} ${sst && sst.passed ? '🏆' : ''}</small></summary><div class=list>${us}${test}</div></details>`;
      }).join('');
      const tot = Object.values(m.u).reduce((a, x) => [a[0] + (x.ok || 0), a[1] + (x.n || 0)], [0, 0]);
      if (window.Quest) {
        h(`<section class="sec qx qx-math">${Quest.head(QH)}
          <div class=qx-extra>
            <div class=qx-pill><span class=e>${Quest.img('1f4cd')}</span><span><b>${place ? `${g('مُسْتَوَاكَ', 'مُسْتَوَاكِ')}: ${esc(d.stages[place.stage] ? d.stages[place.stage].name : '')}` : g('بَدَأْتَ مِنَ الْمَرْحَلَةِ الْأُولَى', 'بَدَأْتِ مِنَ الْمَرْحَلَةِ الْأُولَى')}</b><small>${g('أَتْقَنْتَ', 'أَتْقَنْتِ')} ${D(done)} مِنْ ${D(flat.length)} وَحْدَةً${tot[1] ? ` · ${g('دِقَّةُ إِجَابَاتِكَ', 'دِقَّةُ إِجَابَاتِكِ')} ${D(Math.round(tot[0] / tot[1] * 100))}٪` : ''}</small></span><button class=alt onclick="mathPlacement()">🎯 ${place ? 'أَعِدِ الِاخْتِبَارَ' : 'اِخْتِبَارُ الْمُسْتَوَى'}</button></div>
            ${next ? `<button class="big math-next" onclick="mathUnit(${next.si},${next.ui})">▶️ ${g('تَابِعْ', 'تَابِعِي')}: ${esc(next.u.name)}</button>` : ''}
            ${(m.wrong || []).length ? `<button class="alt math-rev" onclick="mathReview()">🔁 مراجعة أخطائي (${D(m.wrong.length)})</button>` : ''}
          </div>
          <div class=qx-path>${stg}</div>${Quest.foot()}</section>`);
        return;
      }
      h(`<section class=sec>${back()}${hd()}
        <div class="math-place-res"><span>📍</span><div><b>${place ? `مستواك: ${esc(d.stages[place.stage] ? d.stages[place.stage].name : '')}` : 'بدأت من المرحلة الأولى'}</b><small>أتقنت ${D(done)} من ${D(flat.length)} وحدة${tot[1] ? ` · دقّة إجاباتك ${D(Math.round(tot[0] / tot[1] * 100))}٪` : ''}</small></div><button class=alt onclick="mathPlacement()">🎯 ${place ? 'إعادة اختبار المستوى' : 'اختبار تحديد المستوى'}</button></div>
        ${next ? `<button class="big math-next" onclick="mathUnit(${next.si},${next.ui})">▶️ ${g('تَابِعْ', 'تَابِعِي')}: ${esc(next.u.name)}</button>` : ''}
        ${(m.wrong || []).length ? `<button class="alt math-rev" onclick="mathReview()">🔁 مراجعة أخطائي (${D(m.wrong.length)})</button>` : ''}
        <h2 class=acad-h2>🧮 المراحل والوحدات</h2>${stg}</section>`);
    }).catch(() => h(`<section class=sec>${back()}${hd()}<p class=mut>تعذّر تحميل أكاديمية الرياضيات. تحقّق من الإنترنت ثم حاول مرة أخرى.</p><button class=big onclick="mathAcademy()">🔁 إعادة المحاولة</button></section>`));
  }

  /* ---------- الجلسة (وحدة، اختبار مرحلة، مراجعة، اختبار مستوى) ---------- */
  let S = null;
  function start(o) { S = { i: 0, ok: 0, seen: new Set(), wrong: [], answered: false, ...o }; S.qs.forEach(q => S.seen.add(q.id)); show(); }
  function show() {
    const q = S.qs[S.i]; if (!q) return finish();
    S.answered = false;
    window.V = 'quiz'; window.CS = 'math';
    const total = S.qs.length, place = S.kind === 'place';
    const body = q.type === 'fill'
      ? `<div class=bq-type><input id=mq-in class=bq-in inputmode=${/[س]/.test(q.correct_answer) ? 'text' : 'decimal'} autocomplete=off placeholder="${esc(g('اُكْتُبْ', 'اُكْتُبِي'))} الْإِجَابَةَ" onkeydown="if(event.key==='Enter')mathCheck()"><button class=big onclick="mathCheck()">${place ? 'التالي ←' : 'تحقّق ✓'}</button></div>`
      : `<div class="grid bq-opts math-opts${q.options.length === 2 ? ' two' : ''}${isPic(q) ? ' mp-opts' : ''}">${shuf(q.options).map(o => `<button class=opt data-v="${esc(o)}" aria-label="${esc(lab(q, o))}" onclick="mathAns(this)">${optHTML(o)}</button>`).join('')}</div>`;
    h(`<section class="sec bank-q math-q"><button class=link onclick="mathAcademy()">→ أكاديمية الرياضيات</button>
      <div class=bq-top><b>${esc(S.name)}</b><small>سؤال ${D(S.i + 1)} من ${D(total)}</small></div>
      <div class=bq-dots>${S.qs.map((x, k) => `<i class="${k < S.i ? (place ? 'cur' : x._ok ? 'ok' : 'no') : k === S.i ? 'cur' : ''}"></i>`).join('')}</div>
      <div class=bq-card>
        ${q._rt ? `<p class=bq-retry>🔁 ${q._v ? 'تَمْرِينٌ مُشَابِهٌ بِأَعْدَادٍ جَدِيدَةٍ' : 'فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ'}</p>` : ''}
        ${S.i === 0 && S.intro ? `<p class=mp-intro>🦉 ${esc(S.intro)}</p>` : ''}
        <div class="bq-q math-prompt" dir=rtl>${esc(q.prompt)}</div>
        ${q.visual ? `<div class=mp-vis>${optHTML(q.visual)}</div>` : ''}
        <div class=bq-tools><button class=alt onclick="mathSay()">🔊 اسمع السؤال</button></div>
        ${body}
        <div id=mq-fb class=bq-fb hidden></div>
      </div></section>`);
    setTimeout(() => speakQ(q, S.sid != null ? S.sid : stageIdx(q)), 250);
    const inp = document.getElementById('mq-in'); if (inp) setTimeout(() => inp.focus(), 50);
  }
  const stageIdx = q => DATA ? Math.max(0, DATA.stages.findIndex(s => s.id === q.stage_id)) : 0;
  window.mathSay = () => { const q = S && S.qs[S.i]; if (q) speakQ(q, S.sid != null ? S.sid : stageIdx(q)); };

  /* مثال محلول مشابه: سؤال مولَّد بأعداد جديدة، وإلا سؤال آخر من الوحدة نفسها */
  function example(q) {
    const v = variant(q);
    if (v) return v;
    if (!DATA) return null;
    const s = DATA.stages.find(x => x.id === q.stage_id); if (!s) return null;
    const pool = s.q.filter(x => x.unit_id === q.unit_id && x.id !== (q._src || q.id) && !(S && S.seen.has(x.id)) && x.explanation);
    return pool.length ? pool[R(0, pool.length - 1)] : null;
  }
  function answer(ok, given) {
    if (!S || S.answered) return;
    S.answered = true;
    const q = S.qs[S.i]; q._ok = ok; q._given = given;
    mark(q._src || q.id);
    try { window.say && say.stop(); } catch (_) {}
    if (S.kind === 'place') { save(); setTimeout(() => { S.i++; show(); }, 220); return; } /* اختبار المستوى: لا نكشف الإجابات حتى النهاية */
    let ex = null;
    if (ok) { if (!q._rt) S.ok++; }
    else {
      if (!q._rt) S.wrong.push(q);
      const m = M(); m.wrong = (m.wrong || []).filter(id => id !== (q._src || q.id)); if (!q._v) m.wrong.push(q._src || q.id); if (m.wrong.length > 40) m.wrong.shift();
      ex = example(q);
      /* تمرين مشابه يعود لاحقًا في الجلسة: بأعداد جديدة إن أمكن، وإلا السؤال نفسه مرة واحدة */
      if (!q._rt && S.kind !== 'stage') { const v = variant(q); const backQ = v && !S.seen.has(v.id) ? v : { ...q }; backQ._rt = 1; backQ._ok = undefined; backQ._src = q._src || q.id; S.seen.add(backQ.id); S.qs.splice(Math.min(S.qs.length, S.i + 3), 0, backQ); }
    }
    if (ok && q._rt) { const m = M(); m.wrong = (m.wrong || []).filter(id => id !== (q._src || q.id)); }
    save();
    try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch (_) {}
    const fb = document.getElementById('mq-fb');
    fb.hidden = false; fb.className = 'bq-fb ' + (ok ? 'good' : 'soft');
    const lead = ok ? g('أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ.', 'أَحْسَنْتِ! إِجَابَةٌ صَحِيحَةٌ.') : 'مُحَاوَلَةٌ جَيِّدَةٌ! الْإِجَابَةُ الصَّحِيحَةُ:';
    fb.innerHTML = `<b class=bq-lead>${ok ? '✅' : '💡'} ${lead}</b>${ok ? '' : `${given ? `<p class=bq-gave>إجابتك: <b>${esc(given)}</b> ✗</p>` : ''}<p class=bq-ans>${isPic(q) ? `<span class=mp-ans>${optHTML(q.correct_answer)}</span> ${esc(lab(q, q.correct_answer))}` : esc(q.correct_answer)}</p>`}
      ${q.explanation ? `<p class=bq-e>📘 <b>طريقة الحل:</b> ${esc(q.explanation)}</p>` : ''}
      ${ex ? `<div class=math-ex><b>🦉 مثال مشابه محلول</b><p dir=rtl>${esc(ex.prompt)}</p><p>✅ ${esc(ex.correct_answer)}${ex.explanation ? ` — ${esc(ex.explanation)}` : ''}</p>${S.kind !== 'stage' ? `<small>${g('سَتَجِدُ', 'سَتَجِدِينَ')} تَمْرِينًا مُشَابِهًا بَعْدَ قَلِيلٍ لِتُجَرِّبَ بِنَفْسِكَ.</small>` : ''}</div>` : ''}
      <div class=bq-next><button class=big onclick="mathNext()">${S.i + 1 < S.qs.length ? 'التالي ←' : 'النتيجة 🏁'}</button></div>`;
    try { if (!(window.muted && muted())) sayList(ok ? [[lead, 'ar']] : [[lead, 'ar'], [lab(q, q.correct_answer), 'ar'], [mathSpeech(q.explanation || ''), 'ar']].filter(x => x[0])); } catch (_) {}
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  window.mathAns = b => {
    if (!S || S.answered) return;
    const q = S.qs[S.i], v = b.dataset.v, ok = same(v, q);
    if (S.kind !== 'place') document.querySelectorAll('.math-opts .opt').forEach(x => { x.disabled = true; if (norm(x.dataset.v) === norm(q.correct_answer)) x.classList.add('ok'); });
    if (!ok && S.kind !== 'place') b.classList.add('no');
    if (S.kind === 'place') b.classList.add('picked');
    answer(ok, v);
  };
  window.mathCheck = () => {
    if (!S || S.answered) return;
    const q = S.qs[S.i], inp = document.getElementById('mq-in'), v = inp.value.trim();
    if (!v) return inp.focus();
    const ok = same(v, q);
    inp.disabled = true; if (S.kind !== 'place') inp.classList.add(ok ? 'ok' : 'no');
    answer(ok, v);
  };
  window.mathNext = () => { if (!S) return; S.i++; show(); };

  /* ---------- النتيجة: قواعد التعلّم التكيّفي ---------- */
  function finish() {
    if (S.kind === 'place') return placeResult();
    const n = S.qs.filter(q => !q._rt).length, pc = n ? Math.round(S.ok / n * 100) : 0;
    let msg = '', acts = '';
    const m = M();
    if (S.kind === 'unit') {
      const k = S.key, st = m.u[k] = m.u[k] || { att: 0, best: 0, ok: 0, n: 0 };
      st.att++; st.n += n; st.ok += S.ok; st.best = Math.max(st.best, pc); st.lastPc = pc; st.last = Date.now();
      const enough = n >= Math.min(MIN_Q, S.pool);
      const first = !st.mastered && pc >= MASTER && enough;
      if (pc >= MASTER && enough) st.mastered = 1;
      if (first && window.P) P.star = (+P.star || 0) + 3;
      log({ kind: 'unit', id: k, name: S.name, pc });
      const nx = DATA && (unitsFlat(DATA).find(x => x.si >= S.si && !(uStat(x.s, x.u) || {}).mastered && unlocked(DATA, x.si, x.ui)) || unitsFlat(DATA).find(x => !(uStat(x.s, x.u) || {}).mastered && unlocked(DATA, x.si, x.ui)));
      if (pc >= MASTER) { msg = g('مُمْتَازٌ! أَتْقَنْتَ هَذَا الدَّرْسَ، وَانْتَقَلْتَ إِلَى الْمُسْتَوَى التَّالِي.', 'مُمْتَازَةٌ! أَتْقَنْتِ هَذَا الدَّرْسَ، وَانْتَقَلْتِ إِلَى الْمُسْتَوَى التَّالِي.'); if (nx) acts += `<button class=big onclick="mathUnit(${nx.si},${nx.ui})">▶️ التالي: ${esc(nx.u.name)}</button>`; }
      else if (pc >= REVIEW) { msg = gx('جَيِّدٌ! رَاجِعْ أَخْطَاءَكَ أَدْنَاهُ، ثُمَّ تَدَرَّبْ عَلَيْهَا لِتَصِلَ إِلَى ٨٥٪.'); acts += `<button class=big onclick="mathUnit(${S.si},${S.ui},1)">🎯 تدريب إضافي على أخطائي</button>`; }
      else { msg = gx('لَا بَأْسَ، نَتَعَلَّمُ خُطْوَةً خُطْوَةً. اِقْرَأِ الشَّرْحَ الْمُبَسَّطَ ثُمَّ جَرِّبْ تَمَارِينَ أَسْهَلَ.'); acts += `<button class=big onclick="mathUnit(${S.si},${S.ui},2)">🌱 تمارين أسهل</button>`; }
      acts += `<button class=alt onclick="mathUnit(${S.si},${S.ui})">🔁 إعادة الدرس</button>`;
    } else if (S.kind === 'stage') {
      const s = DATA.stages[S.si], st = m.st[s.id] = m.st[s.id] || { att: 0, best: 0 };
      st.att++; st.best = Math.max(st.best, pc); st.last = Date.now();
      const first = !st.passed && pc >= MASTER;
      if (pc >= MASTER) st.passed = 1;
      if (first && window.P) P.star = (+P.star || 0) + 5;
      log({ kind: 'stage', id: s.id, name: S.name, pc });
      const nxs = DATA.stages[S.si + 1];
      if (pc >= MASTER) { msg = g(`رَائِعٌ! اجْتَزْتَ ${s.name}${nxs ? '، وَفُتِحَتْ ' + nxs.name : ''}.`, `رَائِعَةٌ! اجْتَزْتِ ${s.name}${nxs ? '، وَفُتِحَتْ ' + nxs.name : ''}.`); if (nxs) acts += `<button class=big onclick="mathUnit(${S.si + 1},0)">▶️ ${esc(nxs.name)}</button>`; }
      else if (pc >= REVIEW) { msg = gx('قَرِيبٌ جِدًّا! رَاجِعِ الْوَحَدَاتِ الَّتِي أَخْطَأْتَ فِيهَا ثُمَّ أَعِدِ الِاخْتِبَارَ.'); }
      else { msg = gx('نَحْتَاجُ إِلَى تَدَرُّبٍ أَكْثَرَ فِي هَذِهِ الْمَرْحَلَةِ؛ اِبْدَأْ بِالْوَحَدَاتِ أَدْنَاهُ.'); }
      const weak = [...new Set(S.wrong.map(q => q.unit_id))].map(uid => { const ui = s.units.findIndex(u => u.id === uid); return ui < 0 ? '' : `<button class=row onclick="mathUnit(${S.si},${ui},1)"><span>🎯</span><b>${esc(s.units[ui].name)}</b><small>تدريب موجّه</small></button>`; }).join('');
      if (weak) acts += `<div class=list>${weak}</div>`;
      acts += `<button class=alt onclick="mathStageTest(${S.si})">🔁 إعادة اختبار المرحلة</button>`;
    } else { msg = pc >= MASTER ? gx('أَحْسَنْتَ! صَحَّحْتَ أَخْطَاءَكَ.') : gx('تَحَسَّنْتَ! وَاصِلِ الْمُرَاجَعَةَ.'); log({ kind: 'review', name: S.name, pc }); }
    save();
    const W = S.wrong.map(q => `<li><b>${esc(q.prompt)}</b><span>الصحيح: ${isPic(q) ? optHTML(q.correct_answer) + ' ' + esc(lab(q, q.correct_answer)) : esc(q.correct_answer)}</span>${q.explanation ? `<small>📘 ${esc(q.explanation)}</small>` : ''}</li>`).join('');
    h(`<section class="sec math-res"><div class=be-hero><span>${pc >= MASTER ? '🏆' : pc >= REVIEW ? '🌟' : '🌱'}</span><b>${D(pc)}٪</b><small>${D(S.ok)} من ${D(n)} صحيحة</small></div>
      <p class=be-msg>${esc(msg)}</p>
      ${W ? `<h3>📘 أخطاء نتعلّم منها</h3><ul class=math-wrong>${W}</ul>` : ''}
      <div class=be-acts>${acts}<button class=alt onclick="mathAcademy()">🧮 أكاديمية الرياضيات</button></div></section>`);
    try { if (!(window.muted && muted())) say(msg, 'ar', null, pc >= MASTER ? 'cheer' : 'soft'); } catch (_) {}
    S = null;
  }

  /* ---------- اختيار أسئلة متنوعة: الأقل ظهورًا مؤخرًا أولًا ---------- */
  const fresh = (list, n) => { const seen = M().seen; return shuf(list).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)).slice(0, n); };
  const fill = (qs, base, n) => { const ids = new Set(qs.map(q => q.id)); for (let k = 0; qs.length < n && k < 60 && base.length; k++) { const v = variant(base[k % base.length]); if (v && !ids.has(v.id)) { ids.add(v.id); qs.push(v); } } return qs; };
  const easy = q => (q.type === 'fill') * 2 + (q.prompt.length > 45) + (q.options.length > 3);

  /* ---------- درس (وحدة): mode 1 = تدريب إضافي على الأخطاء، 2 = تمارين أسهل ---------- */
  window.mathUnit = (si, ui, mode) => load().then(d => {
    const s = d.stages[si], u = s && s.units[ui];
    if (!u || !unlocked(d, si, ui)) return academy();
    const base = s.q.filter(q => q.unit_id === u.id), m = M();
    let qs;
    if (mode === 1) { const w = new Set(m.wrong || []); qs = [...shuf(base.filter(q => w.has(q.id))), ...fresh(base.filter(q => !w.has(q.id)), MIN_Q)].slice(0, MIN_Q); }
    else if (mode === 2) qs = [...base].sort((a, b) => easy(a) - easy(b) || (m.seen[a.id] || 0) - (m.seen[b.id] || 0)).slice(0, MIN_Q);
    else qs = fresh(base, MIN_Q);
    fill(qs, base, MIN_Q);
    start({ kind: 'unit', si, ui, sid: si, key: uk(s, u), name: `${s.name} · ${u.name}`, qs, pool: qs.length, intro: u.intro ? gx(u.intro) : '' });
  }).catch(() => academy());

  /* ---------- اختبار المرحلة: أسئلة من كل وحداتها بالتساوي ---------- */
  window.mathStageTest = si => load().then(d => {
    const s = d.stages[si]; if (!s || !stageOpen(d, si)) return academy();
    const per = Math.max(1, Math.ceil(STAGE_Q / s.units.length));
    let qs = shuf(s.units.flatMap(u => fresh(s.q.filter(q => q.unit_id === u.id), per))).slice(0, STAGE_Q);
    fill(qs, s.q, STAGE_Q);
    start({ kind: 'stage', si, sid: si, name: `🏁 اختبار ${s.name}`, qs });
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
    const m = M(); m.place = { stage, at: Date.now(), scores: rows.map(r => [r.s.id, r.ok, r.q.length]), review, total: S.qs.filter(q => q._ok).length, of: S.qs.length };
    m.wrong = [...new Set([...(m.wrong || []), ...S.qs.filter(q => !q._ok).map(q => q.id)])].slice(-40);
    log({ kind: 'place', name: 'اختبار تحديد المستوى', pc: Math.round(m.place.total / m.place.of * 100), stage });
    save();
    const msg = `${g('اِنْتَهَيْتَ', 'اِنْتَهَيْتِ')} مِنَ الِاخْتِبَارِ! ${g('سَتَبْدَأُ', 'سَتَبْدَئِينَ')} مِنْ ${d.stages[stage].name}.`;
    h(`<section class="sec math-res"><div class=be-hero><span>🎯</span><b>${D(m.place.total)}/${D(S.qs.length)}</b><small>نقطة البداية: ${esc(d.stages[stage].name)}</small></div>
      <h3>📊 نتيجة كل مرحلة</h3><div class=list>${rows.map(r => `<div class=row><span>${r.pass ? '✅' : '📌'}</span><b>${esc(r.s.name)}</b><small>${D(r.ok)} من ${D(r.q.length)}</small></div>`).join('')}</div>
      ${strengths.length ? `<h3>💪 نقاط القوة</h3><p class=mut>${strengths.map(esc).join('، ')}</p>` : ''}
      ${review.length ? `<h3>🔁 مهارات تحتاج مراجعة</h3><p class=mut>${review.map(esc).join('، ')}</p>` : ''}
      <h3>📘 مراجعة الإجابات</h3><ul class=math-wrong>${S.qs.filter(q => !q._ok).map(q => `<li><b>${esc(q.prompt)}</b><span>الصحيح: ${isPic(q) ? optHTML(q.correct_answer) + ' ' + esc(lab(q, q.correct_answer)) : esc(q.correct_answer)}</span>${q.explanation ? `<small>📘 ${esc(q.explanation)}</small>` : ''}</li>`).join('') || '<li>✨ كل إجاباتك صحيحة!</li>'}</ul>
      <div class=be-acts><button class=big onclick="mathAcademy()">▶️ ${g('اِبْدَأْ', 'اِبْدَئِي')} رِحْلَتَكَ</button></div></section>`);
    try { if (!(window.muted && muted())) say(msg, 'ar', null, 'cheer'); } catch (_) {}
    S = null;
  }

  /* ---------- ملخّص للوحة ولي الأمر ---------- */
  function summary() {
    const m = (window.P && P.math) || null;
    if (!m || !DATA) return null;
    const flat = unitsFlat(DATA), us = flat.map(x => ({ stage: x.s.name, name: x.u.name, st: uStat(x.s, x.u) }));
    const tot = Object.values(m.u || {}).reduce((a, x) => [a[0] + (x.ok || 0), a[1] + (x.n || 0)], [0, 0]);
    return {
      place: m.place ? { stage: (DATA.stages[m.place.stage] || {}).name, total: m.place.total, of: m.place.of, at: m.place.at, review: m.place.review || [] } : null,
      mastered: us.filter(x => x.st && x.st.mastered).length, units: flat.length,
      accuracy: tot[1] ? Math.round(tot[0] / tot[1] * 100) : null, answered: tot[1],
      stages: DATA.stages.map(s => ({ name: s.name, passed: !!((m.st || {})[s.id] || {}).passed, best: ((m.st || {})[s.id] || {}).best || 0, mastered: s.units.filter(u => (uStat(s, u) || {}).mastered).length, units: s.units.length })),
      weak: us.filter(x => x.st && !x.st.mastered && x.st.best < REVIEW).map(x => x.name),
      practicing: us.filter(x => x.st && !x.st.mastered && x.st.best >= REVIEW).map(x => x.name),
      recent: (m.log || []).slice(-8).reverse(), wrong: (m.wrong || []).length
    };
  }

  window.mathAcademy = academy;
  window.MathAcademy = { load, variant, norm, same, merge, unlocked, summary, current: () => S && S.qs[S.i], speech: mathSpeech };
})();
