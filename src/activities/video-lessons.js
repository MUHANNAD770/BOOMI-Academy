/* video-lessons.js — «دروس الفيديو التفاعلية»: فيديو متحرّك يشرحه بومي بصوته المسجَّل، ويتوقف ليسأل والطفل يجيب بالضغط.
   • كل حلقة تُبنى من وحدة في المنهج (S): حروف عربية، حروف إنجليزية، كلمات وصور، النطق (الحركات، المدّ، التنوين).
   • المشهد يتقدّم تلقائيًا بعد انتهاء صوت بومي؛ زر إيقاف/تشغيل، إعادة المشهد، وشريط تقدّم.
   • نقطة السؤال توقف الفيديو: الإجابة الصحيحة تكمل، والخطأ يعيد الشرح بطريقة أبسط ثم يسأل من جديد.
   • النتيجة (نجوم من الإجابة من أول محاولة) تُحفظ في P.tv وتظهر في لوحة ولي الأمر. */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fm = (m, f) => (window.P && P.gender === 'female' ? f : m);
  const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const strip = s => String(s).replace(/[ً-ْٰـ]/g, '');
  const isPic = s => /\p{Extended_Pictographic}/u.test(s || '');

  /* ---------- الحلقات من المنهج ---------- */
  const units = () => (window.S || []).flatMap((s, a) => (s.u || []).map(u => ({ u, a })));
  const kindOf = u => {
    const n = strip(u.n || '');
    if (u.l === 'ar' && /^الحروف\s*:|حروفي العربية الأولى/.test(n)) return 'ar-letters';
    if (u.l === 'en' && /letters/i.test(u.n || '')) return 'en-letters';
    if (u.l === 'ar' && /الحركات|المد بالتشكيل|التنوين/.test(n)) return 'sounds';
    if ((u.i || []).length >= 3 && (u.i || []).every(x => isPic(x[1]))) return u.l === 'en' ? 'en-words' : 'ar-words';
    return null;
  };
  const CATS = [
    { k: 'ar-letters', t: 'الْحُرُوفُ الْعَرَبِيَّةُ', s: 'شَكْلُ الْحَرْفِ وَصَوْتُهُ وَكَلِمَةٌ تَبْدَأُ بِهِ', ic: 'blocks-ar' },
    { k: 'sounds', t: 'النُّطْقُ وَالْحَرَكَاتُ', s: 'الْفَتْحَةُ وَالْكَسْرَةُ وَالضَّمَّةُ وَالْمَدُّ وَالتَّنْوِينُ', ic: '1f5e3-fe0f' },
    { k: 'ar-words', t: 'كَلِمَاتٌ وَصُوَرٌ', s: 'نَسْمَعُ الْكَلِمَةَ وَنَرَى صُورَتَهَا', ic: '1f5bc-fe0f' },
    { k: 'en-letters', t: 'English Letters', s: 'الْحُرُوفُ الْإِنْجِلِيزِيَّةُ بِالصُّوَرِ', ic: 'blocks-en' },
    { k: 'en-words', t: 'English Words', s: 'كَلِمَاتٌ إِنْجِلِيزِيَّةٌ بِالصُّوَرِ', ic: '1f1ec-1f1e7' }
  ];
  const episodes = k => units().filter(x => kindOf(x.u) === k);
  const unitById = id => { const x = units().find(y => y.u.id === id); return x && x.u; };

  /* ---------- بناء المشاهد ---------- */
  const big = (h, cls) => `<div class="tv-big ${cls || ''}">${h}</div>`;
  const pic = e => `<span class="tv-pic">${esc(e)}</span>`;
  const firstLetter = w => { const c = strip(w).replace(/^ال/, '').trim()[0] || ''; return c === 'أ' || c === 'إ' || c === 'آ' ? 'أ' : c; };
  const HARAKAT = l => l === 'أ' || l === 'ا' ? ['أَ', 'إِ', 'أُ'] : [l + 'َ', l + 'ِ', l + 'ُ']; /* الكسرة تحت الألف: إِ */

  function scenesFor(u) {
    const kind = kindOf(u), items = (u.i || []).slice(0, 6), L = u.l === 'en' ? 'en' : 'ar', sc = [];
    sc.push({ k: 'show', html: `<div class="tv-title"><img src="img/ui/owl-book.webp" alt=""><b>${esc(u.n)}</b></div>`, say: [[fm('هَيَّا نُشَاهِدُ وَنَتَعَلَّمُ مَعَ بُومِي!', 'هَيَّا نُشَاهِدُ وَنَتَعَلَّمُ مَعَ بُومِي!'), 'ar']] });
    if (kind === 'ar-letters' || kind === 'en-letters') {
      const letters = kind === 'ar-letters'
        ? (strip(u.n).split(':')[1] || '').trim().split(/\s+/).filter(x => x && x !== 'ـ').map(x => x.replace('هـ', 'ه'))
        : items.map(x => strip(x[0])[0].toUpperCase());
      items.forEach((it, i) => {
        const letter = (kind === 'ar-letters' ? (letters[i] || firstLetter(it[0])) : letters[i]) || firstLetter(it[0]);
        const lw = kind === 'en-letters' ? letter + ' ' + letter.toLowerCase() : letter;
        sc.push({ k: 'show', html: big(`<span class="tv-letter" ${L === 'en' ? 'dir=ltr' : ''}>${esc(lw)}</span>`, 'tv-pop'), say: [[letter, L]] });
        if (kind === 'ar-letters') sc.push({ k: 'show', html: big(HARAKAT(letter).map(x => `<span class="tv-syl">${esc(x)}</span>`).join(''), 'tv-row'), say: HARAKAT(letter).map(x => [x, 'ar']) });
        const w = esc(it[0]), hl = L === 'ar' ? w : `<b>${esc(it[0][0])}</b>${esc(it[0].slice(1))}`;
        sc.push({ k: 'show', html: big(`${pic(it[1])}<span class="tv-word" ${L === 'en' ? 'dir=ltr' : ''}>${hl}</span>`, 'tv-slide'), say: [[it[0], L]], teach: true });
        /* نقطة سؤال بعد كل حرفين، وبعد الأخير */
        if (i % 2 === 1 || i === items.length - 1) {
          const t = items[i], ans = kind === 'ar-letters' ? (letters[i] || firstLetter(t[0])) : letters[i];
          const pool = kind === 'ar-letters' ? (letters.length >= 3 ? letters : [...letters, 'ب', 'م', 'س']) : (letters.length >= 3 ? letters : [...letters, 'B', 'M', 'S']);
          const opts = shuf([ans, ...shuf(pool.filter(x => x !== ans)).slice(0, 2)]);
          sc.push({ k: 'ask', back: sc.length - 1,
            html: big(`${pic(t[1])}<span class="tv-word" ${L === 'en' ? 'dir=ltr' : ''}>${esc(t[0])}</span>`, 'tv-q'),
            q: kind === 'ar-letters' ? [[`بِأَيِّ حَرْفٍ تَبْدَأُ كَلِمَةُ ${t[0]}`, 'ar']] : [['بِأَيِّ حَرْفٍ تَبْدَأُ', 'ar'], [t[0], 'en']],
            opts: opts.map(o => ({ v: o, html: `<span ${L === 'en' ? 'dir=ltr' : ''}>${esc(o)}</span>`, say: [o, L] })), ans });
        }
      });
    } else if (kind === 'sounds') {
      items.forEach((it, i) => {
        sc.push({ k: 'show', html: big(`<span class="tv-letter">${esc(it[0])}</span><span class="tv-tag">${esc(it[1])}</span>`, 'tv-pop'), say: [[it[0], 'ar'], [it[1], 'ar']], teach: true });
        if (i % 2 === 1 || i === items.length - 1) {
          const ans = items[i][0], opts = shuf([ans, ...shuf(items.map(x => x[0]).filter(x => x !== ans)).slice(0, 2)]);
          sc.push({ k: 'ask', back: sc.length - 1, html: big(`<span class="tv-ear">👂</span>`, 'tv-q'), q: [[fm('اِسْمَعْ وَاخْتَرْ', 'اِسْمَعِي وَاخْتَارِي'), 'ar'], [ans, 'ar']], sub: '👂 ' + fm('اِسْمَعْ وَاخْتَرْ', 'اِسْمَعِي وَاخْتَارِي'),
            opts: opts.map(o => ({ v: o, html: `<span class=tv-syl>${esc(o)}</span>`, say: [o, 'ar'] })), ans });
        }
      });
    } else {
      items.forEach((it, i) => {
        sc.push({ k: 'show', html: big(`${pic(it[1])}<span class="tv-word" ${L === 'en' ? 'dir=ltr' : ''}>${esc(it[0])}</span>`, i % 2 ? 'slide' : 'tv-pop'), say: [[it[0], L]], teach: true });
        if (i % 2 === 1 || i === items.length - 1) {
          const t = items[i], opts = shuf([t, ...shuf(items.filter(x => x !== t)).slice(0, 2)]);
          sc.push({ k: 'ask', back: sc.length - 1, html: big(`<span class="tv-ear">👂</span>`, 'tv-q'), q: [['أَيْنَ صُورَةُ', 'ar'], [t[0], L]],
            opts: opts.map(o => ({ v: o[0], html: pic(o[1]), say: [o[0], L] })), ans: t[0] });
        }
      });
    }
    sc.push({ k: 'end' });
    return sc;
  }

  /* ---------- المشغّل ---------- */
  let V = null;
  const $ = id => document.getElementById(id);
  const speak = (list, then) => {
    const tk = V && V.tk, t0 = Date.now(), min = 1600;
    const go = () => { if (!V || V.tk !== tk) return; const w = Math.max(0, min - (Date.now() - t0)); setTimeout(() => { if (V && V.tk === tk && !V.paused) then && then(); else if (V && V.tk === tk) V.resume = then; }, w + 350); };
    try { if (window.muted && muted()) return go(); window.sayList ? sayList(list, go) : (say(list.map(x => x[0]).join('، '), list[0][1]), setTimeout(go, 2500)); } catch (_) { go(); }
  };
  function bar() {
    const b = $('tv-bar'); if (!b || !V) return;
    b.style.width = Math.round(V.i / Math.max(1, V.sc.length - 1) * 100) + '%';
  }
  function scene(i) {
    if (!V) return;
    V.i = i; V.tk++; bar();
    const s = V.sc[i], box = $('tv-scene'), ask = $('tv-ask');
    if (!s || !box) return;
    try { window.say && say.stop && say.stop(); } catch (_) {}
    ask.innerHTML = ''; ask.hidden = true;
    if (s.k === 'end') return end();
    box.innerHTML = `<div class="tv-sc tv-in">${s.html}</div>`;
    $('tv-sub').textContent = s.sub || (s.q || s.say || []).map(x => x[0]).join(' '); /* سؤال الاستماع لا يكشف الإجابة في الترجمة */
    if (s.k === 'show') return speak(s.say, () => scene(i + 1));
    /* نقطة السؤال: يتوقف الفيديو حتى يجيب الطفل */
    ask.hidden = false;
    ask.innerHTML = `<div class="tv-opts">${s.opts.map((o, k) => `<button type="button" class="tv-opt" data-k="${k}" onclick="tvAns(${k})">${o.html}</button>`).join('')}</div>`;
    s.tries = s.tries || 0;
    speak(s.q, null);
  }
  window.tvAns = k => {
    if (!V) return;
    const s = V.sc[V.i]; if (!s || s.k !== 'ask' || s.done) return;
    const o = s.opts[k], b = document.querySelector(`.tv-opt[data-k="${k}"]`);
    if (o.v === s.ans) {
      s.done = 1; if (!s.tries) V.stars++;
      b && b.classList.add('ok');
      try { window.HurufiSound && HurufiSound.play('correct'); } catch (_) {}
      try { const r = b.getBoundingClientRect(); window.BumiFX && BumiFX.burst(r.left + r.width / 2, r.top + r.height / 2, 14); } catch (_) {}
      V.tk++; speak([[fm('أَحْسَنْتَ!', 'أَحْسَنْتِ!'), 'ar']], () => scene(V.i + 1));
    } else {
      s.tries++;
      b && b.classList.add('no');
      try { window.HurufiSound && HurufiSound.play('wrong'); } catch (_) {}
      /* الخطأ: نعيد الشرح بطريقة أبسط (المشهد التعليمي مرة أخرى) ثم نسأل من جديد */
      V.tk++;
      speak([[fm('لَا بَأْسَ، اُنْظُرْ وَاسْمَعْ مَرَّةً أُخْرَى', 'لَا بَأْسَ، اُنْظُرِي وَاسْمَعِي مَرَّةً أُخْرَى'), 'ar']], () => {
        const back = V.sc[s.back];
        if (!back) return scene(V.i);
        const box = $('tv-scene'), ask = $('tv-ask');
        ask.hidden = true;
        box.innerHTML = `<div class="tv-sc tv-in tv-again">${back.html}</div>`;
        speak(back.say, () => scene(V.i));
      });
    }
  };
  function end() {
    const asks = V.sc.filter(s => s.k === 'tv-q').length, st = V.stars, pc = asks ? Math.round(st / asks * 100) : 100;
    const P0 = window.P; if (P0) { P0.tv = P0.tv || {}; const r = P0.tv[V.id] || {}; P0.tv[V.id] = { best: Math.max(r.best || 0, pc), n: (r.n || 0) + 1, d: Date.now() }; if (pc >= 85 && !(r.best >= 85)) P0.star = (P0.star || 0) + 3; try { window.save && save(); } catch (_) {} }
    $('tv-sub').textContent = '';
    $('tv-scene').innerHTML = `<div class="tv-sc tv-in"><div class="tv-end"><span>${pc >= 85 ? '🏆' : '💪'}</span><b>${D(st)} / ${D(asks)}</b><small>${pc >= 85 ? fm('أَحْسَنْتَ! فَهِمْتَ الدَّرْسَ.', 'أَحْسَنْتِ! فَهِمْتِ الدَّرْسَ.') : fm('شَاهِدْ مَرَّةً أُخْرَى لِتُتْقِنَهُ.', 'شَاهِدِي مَرَّةً أُخْرَى لِتُتْقِنِيهِ.')}</small></div></div>`;
    $('tv-ask').hidden = false;
    $('tv-ask').innerHTML = `<div class="tv-opts end"><button class=big onclick="video('${V.id}')">🔁 ${fm('شَاهِدْ مِنْ جَدِيدٍ', 'شَاهِدِي مِنْ جَدِيدٍ')}</button><button class=alt onclick="videos('${V.cat}')">📺 دُرُوسٌ أُخْرَى</button></div>`;
    V.tk++; speak([[pc >= 85 ? fm('أَحْسَنْتَ! فَهِمْتَ الدَّرْسَ.', 'أَحْسَنْتِ! فَهِمْتِ الدَّرْسَ.') : fm('شَاهِدْ مَرَّةً أُخْرَى لِتُتْقِنَهُ.', 'شَاهِدِي مَرَّةً أُخْرَى لِتُتْقِنِيهِ.'), 'ar']], null);
    bar();
  }
  window.tvToggle = () => {
    if (!V) return;
    V.paused = !V.paused;
    const b = $('tv-pp'); if (b) b.textContent = V.paused ? '▶️' : '⏸️';
    $('tv-wrap') && $('tv-wrap').classList.toggle('paused', V.paused);
    try { if (V.paused) say.stop(); } catch (_) {}
    if (!V.paused) { const f = V.resume; V.resume = null; f ? f() : scene(V.i); }
  };
  window.tvReplay = () => { if (V) { V.paused = false; const b = $('tv-pp'); if (b) b.textContent = '⏸️'; scene(V.i); } };

  /* ---------- الصفحات ---------- */
  function video(id) {
    const u = unitById(id); if (!u) return videos();
    window.V = 'lesson'; window.CS = 'les';
    const k = kindOf(u);
    V = { id, cat: k, sc: scenesFor(u), i: 0, tk: 0, stars: 0, paused: false };
    h(`<section class="sec tv">
      <button class=link onclick="goBack()">← رُجُوعٌ</button>
      <h2 class=tv-h>🎬 ${esc(u.n)}</h2>
      <div class="tv-wrap" id="tv-wrap">
        <div class="tv-screen"><div class="tv-sky"></div><div id="tv-scene"></div><div class="tv-sub" id="tv-sub"></div></div>
        <div class="tv-ctrl"><button type="button" id="tv-pp" onclick="tvToggle()" aria-label="إيقاف أو تشغيل">⏸️</button><div class="tv-prog"><i id="tv-bar"></i></div><button type="button" onclick="tvReplay()" aria-label="إعادة المشهد">🔁</button></div>
      </div>
      <div id="tv-ask" class="tv-ask" hidden></div>
    </section>`);
    setTimeout(() => scene(0), 300);
  }
  function videos(cat) {
    if (!window.Quest) return;
    window.V = 'sec'; window.CS = 'les';
    if (cat && CATS.some(c => c.k === cat)) {
      const c = CATS.find(x => x.k === cat), eps = episodes(cat), tv = (window.P && P.tv) || {};
      h(`<section class="sec qx qx-tv">${Quest.head({ t1: 'الدُّرُوسُ الْمَرْئِيَّةُ', t2: c.t, sub: c.s, back: 'videos()' })}
        <div class=qx-path>${eps.map((x, i) => Quest.card({ c: i, ic: icon(x.u), t: esc(x.u.n), s: tv[x.u.id] ? `${tv[x.u.id].best >= 85 ? '✅ ' : ''}أَفْضَلُ نَتِيجَةٍ ${D(tv[x.u.id].best)}٪` : `${D(Math.min(6, (x.u.i || []).length))} مَشَاهِدَ وَأَسْئِلَةٌ`, go: `video('${x.u.id}')` })).join('')}</div>${Quest.foot()}</section>`);
      return;
    }
    h(`<section class="sec qx qx-tv">${Quest.head({ t1: 'الدُّرُوسُ', t2: 'الْمَرْئِيَّةُ', sub: fm('شَاهِدْ وَاسْتَمِعْ، ثُمَّ أَجِبْ بِلَمْسِ الصُّورَةِ', 'شَاهِدِي وَاسْتَمِعِي، ثُمَّ أَجِيبِي بِلَمْسِ الصُّورَةِ') })}
      <div class=qx-path>${CATS.map((c, i) => { const n = episodes(c.k).length; return n ? Quest.card({ c: i, ic: catIcon(c), t: c.t, s: `${c.s} • ${D(n)} دَرْسًا`, go: `videos('${c.k}')` }) : ''; }).join('')}</div>${Quest.foot()}</section>`);
  }
  const catIcon = c => c.ic === 'blocks-ar' ? Quest.blocks(['أ', 'ب', 'ت']) : c.ic === 'blocks-en' ? Quest.blocks(['A', 'B', 'C']) : Quest.img(c.ic);
  const icon = u => { const it = (u.i || []).find(x => isPic(x[1])); return it ? `<span class="tv-cardpic">${esc(it[1])}</span>` : Quest.img('1f4fa'); };

  window.video = video;
  window.videos = videos;
  window.VideoLessons = { episodes, kindOf, scenesFor, CATS };
  /* الخروج من صفحة الفيديو يوقف المشغّل */
  const oh = window.h;
  if (typeof oh === 'function') window.h = function () { if (V && !(arguments[0] && String(arguments[0]).includes('id="tv-wrap"'))) { V.tk++; V = null; } return oh.apply(this, arguments); };
})();
