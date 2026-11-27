/* /src/core/nav.js — شريط التنقل، الصفحة الرئيسية، أقسام العربية والإنجليزية والإنجازات، وتحميل الحزم الكسولة */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CURRICULUM_SCRIPTS = ['src/curriculum/course-data.js', 'src/curriculum/course-text.js', 'src/curriculum/course.js', 'src/curriculum/bank.js', 'src/curriculum/practice.js'];
  /* تسجيل الحزم الكسولة لتحميلها عند الحاجة فقط مع مؤشرات تحميل هيكلية */
  if (window.Lazy && Lazy.lazyStub) {
    Lazy.lazyStub(
      ['bank', 'bankSub', 'bankLesson', 'bankReview', 'bankPractice', 'courseLibrary', 'courseModule', 'courseViewer', 'coursePractice', 'practice'],
      CURRICULUM_SCRIPTS,
      null,
      'lesson'
    );
    Lazy.lazyStub(
      ['stories', 'story', 'talk', 'listenTest', 'readTest', 'sbStory', 'sbQuiz', 'sbTest'],
      ['src/stories/stories.js', 'src/stories/stories2.js', 'src/stories/stories-bank.js'],
      null,
      'stories'
    );
    Lazy.lazyStub(
      ['act', 'aLet', 'aLetP', 'aPath', 'aColAr', 'aColEn', 'aColQAr', 'aColQEn', 'aShpAr', 'aShpEn', 'aShpQAr', 'aShpQEn', 'aHar', 'aHarP', 'aHarQ', 'aAbj', 'aAbjP', 'aFirst', 'aOpp', 'aPat', 'aOdd', 'aDays', 'aEnPic', 'puzzles', 'riddles', 'logic', 'dragBuild', 'matchPics', 'dictation', 'dictationAdv', 'syllables', 'speedGame', 'weekly', 'advanced'],
      ['src/activities/activities.js', 'src/activities/activities2.js', 'src/activities/more.js', 'src/activities/puzzles.js'],
      null,
      'cards'
    );
    Lazy.lazyStub(
      ['gMem', 'gBuild', 'gPat', 'gOrd', 'games2d', 'g2levels', 'g2play'],
      ['src/games/engine.js', 'src/games/mini-games.js', 'src/games/games2d.js', 'src/games/phaser-games.js'],
      null,
      'cards'
    );
  }

  /* الأداء: محتوى القوائم المطوية يُبنى عند فتحها فقط */
  window.lzList = (() => {
    const M = new Map();
    let n = 0;
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (!d || !d.open || !d.querySelector) return;
      const L = d.querySelector(':scope>[data-lz]');
      if (!L) return;
      const k = L.dataset.lz;
      if (M.has(k)) {
        L.innerHTML = M.get(k);
        M.delete(k);
        L.removeAttribute('data-lz');
      }
    }, true);
    return (html, cls) => {
      const k = 'z' + (++n);
      if (M.size > 400) M.clear();
      M.set(k, html);
      return `<div class="${cls || 'list'}" data-lz="${k}"></div>`;
    };
  })();

  const NAV = [
    ['home', '🏠', 'الرئيسية', () => home()],
    ['les', '📖', 'الدروس', () => sec('les')],
    ['exams', '🏆', 'الاختبارات', () => examHub()],
    ['games', '🎮', 'الألعاب', () => sec('games')],
    ['ach', '⭐', 'إنجازاتي', () => sec('ach')],
    ['set', '⚙️', 'ولي الأمر', () => parentPanel()]
  ];
  window.__navGo = i => NAV[i] && NAV[i][3]();

  const nv = document.createElement('header');
  nv.id = 'gn';
  nv.innerHTML = `<div class=logo><img src="img/icon.png" alt=""><b>حروفي</b></div>
    <nav>${NAV.map((n, i) => `<button data-k=${n[0]} onclick="__navGo(${i})"><span>${n[1]}</span>${n[2]}</button>`).join('')}</nav>`;
  document.body.insertBefore(nv, document.body.firstChild);

  const oh = window.h;
  window.h = x => {
    oh(x);
    const show = !!window.P && !['setup', 'who', 'quiz', 'game'].includes(window.V);
    nv.style.display = show ? 'flex' : 'none';
    document.body.classList.toggle('hasnav', show);
    const active = window.V === 'home' ? 'home' : window.V === 'exam' ? 'exams' : window.V === 'parent' ? 'set' : (window.CS || '');
    nv.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === active));
  };

  const rid = () => { const c = window.coach && coach(); return c && c.u && c.u.id; };
  const unitLabel = u => u.id === '2-51' ? 'التَّاءُ الْمَرْبُوطَةُ وَالْمَفْتُوحَةُ (تَدْرِيبٌ إِضَافِيٌّ)' : u.n;
  const bt = u => {
    const open = !window.lessonUnlocked || lessonUnlocked(u);
    const ic = P.done[u.id] ? '✅' : !open ? '🔒' : '⭐';
    return `<button class="row${u.id === rid() ? ' rec' : ''}${open ? '' : ' locked'}" onclick="lesson('${u.id}')"><span>${ic}</span><b>${esc(unitLabel(u))}</b><small>${P.sc[u.id] != null ? D(P.sc[u.id]) + '/٥' : (open ? '' : 'مقفل')}</small></button>`;
  };

  const byLang = (l, extra0) => S.map((s, a) => ({ s, a, u: [...s.u.filter(u => u.l === l), ...(a === 0 && extra0 ? [extra0] : [])] }))
    .filter(x => x.u.length)
    .map(x => window.Quest ? `<details class="qx-st qx-c${x.a}" data-stage-idx="${x.a}">${Quest.card({ tag: 'summary', c: x.a, ic: (Quest.STAGE[l] || Quest.STAGE.ar)[x.a] || '', t: esc(x.s.n), s: `${x.s.a} سَنَوَات · ${D(x.u.length)} دَرْسًا` })}${lzList(x.u.map(bt).join(''))}</details>` : `<details class="lesson-menu" data-stage-idx="${x.a}"${x.a === +P.stage ? ' open' : ''}><summary><span><b>${esc(x.s.n)}</b><small>${x.s.a} سنوات · ${D(x.u.length)} درسًا</small></span><i>⌄</i></summary>${x.a === +P.stage ? `<div class=list>${x.u.map(bt).join('')}</div>` : lzList(x.u.map(bt).join(''))}</details>`).join('');

  function hydrateAcademy(sub) {
    if (window.mountAcademy) return window.mountAcademy(sub);
    if (window.Lazy && Lazy.loadBundle) {
      return Lazy.loadBundle(CURRICULUM_SCRIPTS).then(() => {
        try { window.Router && Router.wrapAll && Router.wrapAll(); } catch (_) {}
        return window.mountAcademy && window.mountAcademy(sub);
      }).catch(() => {});
    }
  }

  function achBody() {
    const sf = id => { try { return find(id); } catch (_) { return null; } };
    const K = o => Object.keys(o || {});
    const done = K(P.done).map(sf).filter(Boolean);
    const started = K(P.sc).filter(id => !P.done[id]).map(sf).filter(Boolean);
    const st = K(P.stories).length, cd = K(P.courseDone).length, ac = K(P.act).length, ch = K(P.cd).length;
    const any = done.length || started.length || st || cd || ac || ch || (P.star || 0) > 0;
    const nx = window.nextLesson && nextLesson(P.lang === 'en' ? 'en' : 'ar');
    const tile = (i, n, t) => `<div>${i}<br><b>${D(n)}</b><small>${t}</small></div>`;
    const row = u => `<button class=row onclick="lesson('${u.id}')"><span>${P.done[u.id] ? '✅' : '📘'}</span><b>${esc(u.n)}</b><small>${P.sc[u.id] != null ? D(P.sc[u.id]) + '/٥' : ''}</small></button>`;

    let out = `<div class="sum ach-sum">${tile('⭐', P.star || 0, 'نجمة')}${tile('✅', done.length, 'درس متقن')}${tile('📘', started.length, 'درس قيد التدريب')}${tile('🎯', ch, 'تحدٍّ يومي')}</div>`;
    out += (P.star || 0) >= 50
      ? '<button class=big onclick="cert()">🏆 شهادة إنجاز</button>'
      : `<p class=mut>اجمع ${D(50 - (P.star || 0))} نجمة للحصول على شهادة الإنجاز 🏆</p>`;

    if (window.badgeGrid) out += badgeGrid();

    if (!any) {
      return out + `<div class=ach-empty><span>🦉</span><h3>${P.gender === 'female' ? 'اِبْدَئِي دَرْسَكِ الْأَوَّلَ!' : 'اِبْدَأْ دَرْسَكَ الْأَوَّلَ!'}</h3>
        <p class=mut>${P.gender === 'female' ? 'عِنْدَمَا تُنْهِينَ الدُّرُوسَ سَتَظْهَرُ إِنْجَازَاتُكِ وَنُجُومُكِ وَشَارَاتُكِ هُنَا.' : 'عِنْدَمَا تُنْهِي الدُّرُوسَ سَتَظْهَرُ إِنْجَازَاتُكَ وَنُجُومُكَ وَشَارَاتُكَ هُنَا.'}</p>
        ${nx ? `<button class=big onclick="lesson('${nx.id}')">▶️ ابدأ: ${esc(nx.n)}</button>` : ''}</div>`;
    }

    out += `<h3>✅ الدروس المتقنة (${D(done.length)})</h3><div class=list>${done.map(row).join('') || '<p class=mut>لم تُتقن درسًا بعد — تحتاج ٤ من ٥ في اختبار الدرس.</p>'}</div>`;
    if (started.length) out += `<h3>📘 دروس بدأتها ولم تُتقنها بعد</h3><div class=list>${started.map(row).join('')}</div>`;
    const more = [
      [st, '📚', 'قصة مقروءة', 'stories()'],
      [cd, '🗂️', 'مادة تدريبية مكتملة', `sec('${P.lang === 'en' ? 'en' : 'ar'}')`],
      [ac, '🎨', 'نشاط منجز', 'act()']
    ].filter(x => x[0]);
    if (more.length) out += `<h3>🌟 إنجازات أخرى</h3><div class=list>${more.map(x => `<button class=row onclick="${x[3]}"><span>${x[1]}</span><b>${D(x[0])} ${x[2]}</b></button>`).join('')}</div>`;
    if (nx) out += `<button class=big onclick="lesson('${nx.id}')">▶️ الدرس التالي: ${esc(nx.n)}</button>`;
    return out;
  }

  const HD = {
    ar: ['ar', 'ض', 'أكاديمية العربية', 'مخارج • حروف • قراءة • قواعد', '📖'],
    en: ['en', 'ABC', 'أكاديمية الإنجليزية', 'Letters • Phonics • Words • Grammar', '🔤']
  };

  const fm = (m, f) => (window.P && P.gender === 'female' ? f : m);
  const uiImg = (src, alt) => `<img src="${src}" alt="${alt || ''}" draggable="false" data-no3d>`;
  /* بطاقات الأكاديميات والمعلّمين (تُستعمل في الرئيسية وصفحة الدروس) */
  const acadCards = (c0 = 0) => [
    Quest.card({ c: c0 + 2, ic: uiImg('img/ui/acad-ar.webp', 'ض'), t: 'أَكَادِيمِيَّةُ الْعَرَبِيَّةِ', s: 'حُرُوفٌ • مَخَارِجُ • قِرَاءَةٌ • قَوَاعِدُ', go: "sec('ar')" }),
    Quest.card({ c: c0 + 1, ic: uiImg('img/ui/acad-en.webp', 'ABC'), t: 'أَكَادِيمِيَّةُ الْإِنْجِلِيزِيَّةِ', en: 'Letters • Phonics • Words • Grammar', go: "sec('en')" }),
    Quest.card({ c: c0 + 3, ic: uiImg('img/ui/acad-math.webp', '١٢٣'), t: 'أَكَادِيمِيَّةُ الرِّيَاضِيَّاتِ', s: 'أَعْدَادٌ • عَمَلِيَّاتٌ • هَنْدَسَةٌ • جَبْرٌ', go: 'mathAcademy()' })
  ];
  const videoCard = c => Quest.card({ c, ic: Quest.img('1f4fa'), t: 'دُرُوسُ الْفِيدْيُو التَّفَاعُلِيَّةُ', s: 'حُرُوفٌ • كَلِمَاتٌ • نُطْقٌ — شَاهِدْ وَأَجِبْ بِالضَّغْطِ', go: 'videos()' });
  const teacherCards = c0 => [
    Quest.card({ c: c0, ic: Quest.img('1f469-200d-1f3eb'), t: 'مُعَلِّمُ الْعَرَبِيَّةِ', s: 'كَلِمَاتٌ جَدِيدَةٌ • نُطْقٌ • مُرَاجَعَةٌ ذَكِيَّةٌ', go: "teachers('ar')" }),
    Quest.card({ c: c0 + 1, ic: Quest.img('1f1ec-1f1e7'), t: 'مُعَلِّمُ الْإِنْجِلِيزِيَّةِ', en: 'English Smart Teacher', s: 'يَشْرَحُ بِالْعَرَبِيَّةِ أَوَّلًا', go: "teachers('en')" })
  ];
  window.QuestCards = { acadCards: c => acadCards(c), teacherCards: c => teacherCards(c) };
  const QX = {
    ar: () => ({ t1: 'أَكَادِيمِيَّةُ', t2: 'اللُّغَةِ الْعَرَبِيَّةِ', sub: 'رِحْلَةٌ مُمْتِعَةٌ نَحْوَ التَّمَيُّزِ فِي لُغَتِنَا الْجَمِيلَةِ',
      body: `<div id=acad-stages-ar class=qx-path>${byLang('ar', G.g1)}</div>` }),
    en: () => ({ t1: 'أَكَادِيمِيَّةُ', t2: 'اللُّغَةِ الْإِنْجِلِيزِيَّةِ', sub: 'رِحْلَةٌ مُمْتِعَةٌ لِتَعَلُّمِ الْإِنْجِلِيزِيَّةِ خُطْوَةً بِخُطْوَةٍ',
      body: `<div id=acad-stages-en class=qx-path>${byLang('en', G.g2)}</div>` }),
    les: () => {
      const c = window.coach && coach();
      return { t2: 'الدُّرُوسُ', sub: fm('اِخْتَرْ أَكَادِيمِيَّتَكَ وَابْدَأْ رِحْلَتَكَ', 'اِخْتَارِي أَكَادِيمِيَّتَكِ وَابْدَئِي رِحْلَتَكِ'),
        extra: c ? `<div class=qx-extra><button class=qx-pill onclick="lesson('${c.u.id}')"><span class=e>${Quest.img('1f680')}</span><span><small>${fm('دَرْسُكَ التَّالِي', 'دَرْسُكِ التَّالِي')}</small><b>${esc(c.u.n)}</b></span></button></div>` : '',
        body: `<div class=qx-path>${acadCards(0).join('')}${videoCard(7)}${teacherCards(4).join('')}</div>` };
    },
    games: () => {
      const dc = dueN(), unres = window.ExamEngine ? ExamEngine.unresolvedMistakes() : [];
      const L = [
        { ic: Quest.img('1f3af'), t: 'تَحَدِّي الْيَوْمِ', s: P.cd[day()] ? 'أُنْجِزَ الْيَوْمَ ✓' : '+٣ نُجُومٍ', go: 'daily()' },
        { ic: Quest.img('1f3c6'), t: 'الِاخْتِبَارَاتُ الْمُتَدَرِّجَةُ', s: 'مُبْتَدِئٌ • مُتَوَسِّطٌ • مُتَقَدِّمٌ • مُتْقِنٌ', go: 'examHub()' },
        unres.length ? { ic: Quest.img('1f4dd'), t: 'تَدْرِيبُ الْأَخْطَاءِ السَّابِقَةِ', s: `${D(unres.length)} سُؤَالًا`, go: 'practiceMistakes()' } : null,
        { ic: Quest.img('1f3ae'), t: 'أَلْعَابٌ تَعْلِيمِيَّةٌ', s: 'تَعَلَّمْ بِالْمَرَحِ', go: 'games2d()' },
        { ic: Quest.img('1f9e9'), t: 'أَنْشِطَةٌ تَفَاعُلِيَّةٌ وَإِمْلَاءٌ', s: 'حُرُوفٌ • مَقَاطِعُ • أَضْدَادٌ', go: 'act()' },
        { ic: Quest.img('1f3dd-fe0f'), t: 'جَزِيرَةُ الْأَلْغَازِ وَالتَّفْكِيرِ', go: 'puzzles()' },
        { ic: Quest.img('1f3a4'), t: 'تَدْرِيبُ النُّطْقِ بِالْمَيْكْرُوفُونِ', go: 'speak()' },
        dc ? { ic: Quest.img('1f501'), t: 'مُرَاجَعَةٌ ذَكِيَّةٌ', s: `${D(dc)} كَلِمَةً`, go: 'review()' } : null
      ].filter(Boolean);
      return { t1: 'عَالَمُ', t2: 'الْأَلْعَابِ وَالتَّدْرِيبِ', sub: fm('تَعَلَّمْ وَالْعَبْ وَاخْتَبِرْ مُسْتَوَاكَ', 'تَعَلَّمِي وَالْعَبِي وَاخْتَبِرِي مُسْتَوَاكِ'),
        body: `<div class=qx-path>${L.map((x, i) => Quest.card({ ...x, c: i })).join('')}</div>` };
    },
    ach: () => {
      const st = +P.star || 0, bd = Object.keys(P.badges || {}).length;
      return { t2: 'إِنْجَازَاتِي', sub: st ? `جَمَعْتَ ${D(st)} نَجْمَةً${bd ? ` وَ${D(bd)} شَارَةً` : ''}` : 'كُلُّ دَرْسٍ تُتْقِنُهُ يَمْنَحُكَ نُجُومًا وَشَارَاتٍ',
        body: `<div class="qx-panel">${achBody()}</div>` };
    }
  };

  function sec(k) {
    if (k === 'math') return window.mathAcademy ? mathAcademy() : home();
    window.V = 'sec';
    window.CS = k;
    ens();
    const dc = dueN();
    const unres = window.ExamEngine ? ExamEngine.unresolvedMistakes() : [];
    const T = {
      les: ['📖 الدروس', `<h3>🔤 أكاديمية العربية</h3><div id=acad-dash-ar></div><div id=acad-stages-ar>${byLang('ar', G.g1)}</div><h3>🔠 أكاديمية الإنجليزية</h3><div id=acad-dash-en></div><div id=acad-stages-en>${byLang('en', G.g2)}</div>`],
      ar: ['🔤 اللغة العربية', `
        <div class=list style="margin-bottom:10px">
          <button class=row onclick="arTeach()"><span>🦉</span><b>مُعَلِّمُ الْقَوَاعِدِ وَالْمَخَارِجِ</b><small>كلمات • نطق • مراجعة ذكية</small></button>
        </div>
        <div id=acad-dash-ar></div>
        <div id=acad-stages-ar>${byLang('ar', G.g1)}</div>`],
      en: ['🔠 English', `
        <div class=list style="margin-bottom:10px">
          <button class=row onclick="enTeach()"><span>🦉</span><b>English Smart Teacher</b><small>Phonics • Reading • Grammar • Mistakes review</small></button>
        </div>
        <div id=acad-dash-en></div>
        <div id=acad-stages-en>${byLang('en', G.g2)}</div>`],
      games: ['🎮 الألعاب والتدريب', `<div class=list>
        <button class=row onclick="daily()"><span>🎯</span><b>${P.cd[day()] ? 'تحدي اليوم (أُنجز) ✓' : 'تحدي اليوم +٣ ⭐'}</b></button>
        <button class=row onclick="examHub()"><span>🏆</span><b>الِاخْتِبَارَاتُ الْمُتَدَرِّجَةُ (عَرَبِي + إِنْجِلِيزِي)</b><small>مبتدئ • متوسط • متقدم • متقن</small></button>
        ${unres.length ? `<button class=row onclick="practiceMistakes()"><span>🩹</span><b>تَدْرِيبُ الْأَخْطَاءِ السَّابِقَةِ</b><small>${D(unres.length)} سؤال</small></button>` : ''}
        <button class=row onclick="games2d()"><span>🎮</span><b>أَلْعَابٌ تَعْلِيمِيَّةٌ ثُنَائِيَّةُ الْأَبْعَادِ</b></button>
        <button class=row onclick="act()"><span>🧩</span><b>أَنْشِطَةٌ تَفَاعُلِيَّةٌ وَإِمْلَاءٌ</b></button>
        <button class=row onclick="puzzles()"><span>🏝️</span><b>جَزِيرَةُ الْأَلْغَازِ وَالتَّفْكِيرِ</b></button>
        <button class=row onclick="speak()"><span>🎤</span><b>تَدْرِيبُ النُّطْقِ بِالْمَيْكْرُوفُونِ</b></button>
        ${dc ? `<button class=row onclick="review()"><span>🔁</span><b>مُرَاجَعَةٌ ذَكِيَّةٌ</b><small>${D(dc)}</small></button>` : ''}
      </div>`],
      ach: ['🏆 إنجازاتي', achBody()]
    };

    /* تصميم «رحلة بومي» الموحّد: لافتة خشبية + شريط + بومي + مسار بطاقات (src/shared/quest.js) */
    if (window.Quest && QX[k]) {
      const q = QX[k]();
      h(`<section class="sec qx qx-${k}">${Quest.head(q)}${q.extra || ''}${q.body}${Quest.foot()}</section>`);
      if (k === 'ar' || k === 'en') hydrateAcademy(k);
      return;
    }
    const [t, b] = T[k] || T.les;
    let hd = '';
    if (HD[k]) {
      const [c, ic, title, sub, em] = HD[k];
      hd = `<div class="acad-hd ${c}"><span class="acad-ic"${c === 'en' ? ' dir=ltr' : ''}>${ic}</span><div><b>${title}</b><small${c === 'en' ? ' dir=ltr' : ''}>${sub}</small></div><span class=acad-em>${em}</span></div>`;
    } else if (k === 'ach') {
      const st = +P.star || 0, bd = Object.keys(P.badges || {}).length;
      hd = `<div class=ach-hd><span class=ach-cup>🏆</span><div class=ach-rib>إنجازاتي</div><b>${st ? 'أحسنت يا بطل!' : 'هيا نبدأ رحلة الإنجازات!'}</b><small>${st ? `جمعت ${D(st)} نجمة${bd ? ` و${D(bd)} شارة` : ''} 🌟` : 'كل درس تتقنه يمنحك نجومًا وشارات جديدة'}</small><span class="ach-conf c1">🎉</span><span class="ach-conf c2">✨</span></div>`;
    }

    h(`<section class=sec>${hd}<h2 class="${HD[k] || k === 'ach' ? 'acad-h2' : ''}">${t}</h2>${b}</section>`);
    if (k === 'ar' || k === 'en') hydrateAcademy(k);
    else if (k === 'les' || !T[k]) { hydrateAcademy('ar'); hydrateAcademy('en'); }
  }

  function home() {
    window.V = 'home';
    window.CS = 'home';
    ens();
    const st = P.stage, us = units(st), dn = us.filter(u => P.done[u.id]).length;
    const c = window.coach && coach();
    const IC = {
      games: '<i class="ico ico-pic"><img src="img/3d/1f3ae.webp" alt="🎮"></i>',
      ach: '<i class="ico ico-pic"><img src="img/ui/medal.webp" alt="🏆"></i>'
    };
    const go = c ? `lesson('${c.u.id}')` : "sec('les')";

    let nx = null;
    try { nx = window.Mind && Mind.next(); } catch (_) {}
    if (!nx && c) nx = { icon: '▶️', t: c.u.n, go: `lesson('${c.u.id}')` };
    const nxHTML = nx ? `<button class="nx h2-next" onclick="${nx.go.replace(/"/g, '&quot;')}"><span>${nx.icon}</span><div><small>الخطوة التالية لك${nx.why ? ' · ' + esc(nx.why) : ''}</small><b>${esc(nx.t)}</b></div></button>` : '';

    /* تصميم «رحلة بومي» الموحّد: نفس نموذج الأكاديميات، وبطاقاته هي أقسام الموقع */
    if (window.Quest) {
      const nxQ = nx ? `<div class=qx-extra><button class="qx-pill h2-next" onclick="${nx.go.replace(/"/g, '&quot;')}"><span class=e>${Quest.img('1f680')}</span><span><small>${fm('خُطْوَتُكَ التَّالِيَةُ', 'خُطْوَتُكِ التَّالِيَةُ')}${nx.why ? ' · ' + esc(nx.why) : ''}</small><b>${esc(nx.t)}</b></span></button></div>` : '';
      const more = [
        { ic: Quest.img('1f4da'), t: 'عَالَمُ الْقِصَصِ', s: 'قِرَاءَةٌ وَاسْتِمَاعٌ', go: 'stories()' },
        { ic: Quest.img('1f3c6'), t: 'الِاخْتِبَارَاتُ الْمُتَدَرِّجَةُ', s: 'مُبْتَدِئٌ ← مُتْقِنٌ', go: 'examHub()' },
        { ic: Quest.img('1f3ae'), t: 'الْأَلْعَابُ وَالتَّدْرِيبُ', s: 'تَعَلَّمْ بِالْمَرَحِ', go: "sec('games')" },
        { ic: Quest.img('1f3af'), t: 'تَحَدِّي الْيَوْمِ', s: P.cd[day()] ? 'أُنْجِزَ الْيَوْمَ ✓' : '+٣ نُجُومٍ', go: 'daily()' },
        { ic: Quest.img('1f4ac'), t: 'اِسْأَلْ بُومِي', s: 'الْمُعَلِّمُ الذَّكِيُّ', go: 'bomi()' },
        { ic: Quest.img('1f3c5'), t: 'إِنْجَازَاتِي', s: '⭐ ' + D(P.star || 0), go: "sec('ach')" },
        { ic: Quest.img('1f468-200d-1f469-200d-1f467'), t: 'لَوْحَةُ وَلِيِّ الْأَمْرِ', s: `${D(dn)}/${D(us.length)} دُرُوسِ الْمَرْحَلَةِ`, go: 'parentPanel()' }
      ];
      h(`<section class="sec qx qx-home-pg">${Quest.head({ home: false, t1: fm('مَرْحَبًا بِكَ فِي', 'مَرْحَبًا بِكِ فِي'), t2: 'الْبُومَةِ التَّعْلِيمِيَّةِ', sub: fm('تَعَلَّمِ الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ وَالرِّيَاضِيَّاتِ بِمُتْعَةٍ', 'تَعَلَّمِي الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ وَالرِّيَاضِيَّاتِ بِمُتْعَةٍ') })}
        ${nxQ}<div class=qx-path>${acadCards(0).join('')}${videoCard(7)}${teacherCards(4).join('')}${more.map((x, i) => Quest.card({ ...x, c: (i + 6) % 8 })).join('')}</div>${Quest.foot()}</section>`);
      return;
    }
    const tl = [
      ['🏆', 'الاختبارات المتدرّجة', 'مبتدئ ← متقن', 'examHub()'],
      ['📚', 'عالم القصص', 'قراءة واستماع', 'stories()'],
      ['💬', 'المعلم الذكي بومي', 'اسأل وتعلّم معي', 'bomi()'],
      [IC.games, 'الألعاب التفاعلية', 'تعلّم بالمرح', 'games2d()'],
      ['🧩', 'الأنشطة والإملاء', 'حروف، مقاطع، أضداد', 'act()'],
      ['🎯', 'تحدي اليوم', P.cd[day()] ? 'أُنجز اليوم ✓' : '+٣ نجوم ⭐', 'daily()'],
      [IC.ach, 'إنجازاتي', '⭐ ' + D(P.star || 0), "sec('ach')"],
      ['⚙️', 'الإعدادات والملف الشخصي', esc(P.name || 'الطالب'), 'parentPanel()']
    ];

    h(`<section class="h2-hero">
        <div class=h2-cloud></div>
        <img class=h2-castle src="img/3d/1f3f0.webp" alt="">
        <img class=h2-owlbig src="img/ui/owl-book.webp" onerror="this.remove()" alt="">
        <span class="h2-star s1">⭐</span><span class="h2-star s2">✨</span>
        <div class=h2-txt>
          <h1>${P.gender === 'female' ? 'مَرْحَبًا بِكِ فِي' : 'مَرْحَبًا بِكَ فِي'} <b>البومة التعليمية الذكية</b></h1>
          <p>${P.gender === 'female' ? 'تَعَلَّمِي الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ بِمُتْعَةٍ.. وَحَقِّقِي إِنْجَازَاتٍ رَائِعَةً!' : 'تَعَلَّمْ الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ بِمُتْعَةٍ.. وَحَقِّقْ إِنْجَازَاتٍ رَائِعَةً!'}</p>
          <button class=h2-cta onclick="${go}">▶ ${P.gender === 'female' ? 'اِبْدَئِي رِحْلَتَكِ' : 'اِبْدَأْ رِحْلَتَكَ'} التَّعْلِيمِيَّةَ</button>
        </div>
      </section>
      ${nxHTML}
      <div class=h2-acad>
        <button class="h2-card ar" onclick="sec('ar')"><span class="h2-ic h2-img"><img src="img/ui/acad-ar.webp" alt="ض" onerror="this.parentNode.textContent='ض'"></span><b>أكاديمية العربية</b><small>حروف • مخارج • قراءة • قواعد</small><i class=h2-go>${P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأِ'} الْآنَ ▶</i></button>
        <button class="h2-card en" onclick="sec('en')"><span class="h2-ic h2-img" dir=ltr><img src="img/ui/acad-en.webp" alt="ABC" onerror="this.parentNode.textContent='ABC'"></span><b>أكاديمية الإنجليزية</b><small dir=ltr>Letters • Phonics • Words</small><i class=h2-go>${P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأِ'} الْآنَ ▶</i></button>
        <button class="h2-card math" onclick="mathAcademy()"><span class="h2-ic h2-img"><img src="img/ui/acad-math.webp" alt="١٢٣" onerror="this.parentNode.textContent='١٢٣'"></span><b>أكاديمية الرياضيات</b><small>أعداد • عمليات • هندسة</small><i class=h2-go>${P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأِ'} الْآنَ ▶</i></button>
      </div>
      <h3 class=h2-h>🎮 تعلّم والعب واختبر مستواك</h3>
      <div class="tl tl-glass">${tl.map(t => `<button class=gt onclick="${t[3]}">${t[0]}<b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div>
      <button class="h2-parent h2-parent-end" onclick="parentPanel()"><span class=e>👨‍👩‍👧</span><span><b>لَوْحَةُ وَلِيِّ الْأَمْرِ وَالْإِعْدَادَاتِ</b><small>المِلَفُّ الشَّخْصِيُّ وَالتَّقَدُّمُ وَالنَّتَائِجُ · ${D(dn)}/${D(us.length)} دروس المرحلة</small></span><i>←</i></button>`);
  }

  /* المعلّمون الأذكياء (خارج الأكاديميات): معلّم العربية ومعلّم الإنجليزية، بالتصميم نفسه */
  function teachers(k) {
    if (!window.Quest) return k === 'en' ? enTeach() : arTeach();
    window.V = 'sec';
    window.CS = 'les';
    ens();
    const en = k === 'en', C = en ? window.EnCoach : window.ArCoach, go = en ? 'enTeach' : 'arTeach';
    let st = {};
    try { st = (C && C.stats && C.stats()) || {}; } catch (_) {}
    let lv = '';
    try { if (en && C && C.level) lv = `<div class=qx-extra><div class=qx-pill><span class=e>${Quest.img('1f1ec-1f1e7')}</span><span><small>مُسْتَوَاكَ فِي الْإِنْجِلِيزِيَّةِ</small><b>الْمُسْتَوَى ${D(C.level())}: ${esc(C.levelName ? C.levelName() : '')}</b></span></div></div>`; } catch (_) {}
    const L = [
      { ic: Quest.img('1f469-200d-1f3eb'), t: fm('تَعَلَّمْ كَلِمَاتٍ جَدِيدَةً مَعَ الْمُعَلِّمِ', 'تَعَلَّمِي كَلِمَاتٍ جَدِيدَةً مَعَ الْمُعَلِّمِ'), s: `${D(st.K || 0)} ${fm('كَلِمَةً فَهِمْتَهَا', 'كَلِمَةً فَهِمْتِهَا')}`, go: `${go}('new')` },
      { ic: Quest.img('1f501'), t: 'مُرَاجَعَةٌ ذَكِيَّةٌ لِلْكَلِمَاتِ', s: `${D(st.Pn || 0)} ${fm('كَلِمَةً تَنْطِقُهَا', 'كَلِمَةً تَنْطِقِينَهَا')}`, go: `${go}('review')` },
      en ? { ic: Quest.img('1f989'), t: 'المعلّم الذكي', en: 'English Smart Teacher', s: 'Phonics • Reading • Grammar', go: `${go}()` }
         : { ic: Quest.img('1f989'), t: 'مُعَلِّمُ الْقَوَاعِدِ وَالْمَخَارِجِ', s: 'كَلِمَاتٌ • نُطْقٌ • مُرَاجَعَةٌ ذَكِيَّةٌ', go: `${go}()` }
    ];
    h(`<section class="sec qx qx-teach">${Quest.head({ t1: 'مُعَلِّمُ', t2: en ? 'الْإِنْجِلِيزِيَّةِ' : 'الْعَرَبِيَّةِ',
      sub: en ? 'يَشْرَحُ بِالْعَرَبِيَّةِ أَوَّلًا وَيَزِيدُ الْإِنْجِلِيزِيَّةَ حَسَبَ فَهْمِكَ' : 'كَلِمَاتٌ جَدِيدَةٌ بِالصُّوَرِ، وَمُرَاجَعَةٌ ذَكِيَّةٌ لَهَا' })}
      ${lv}<div class=qx-path>${L.map((x, i) => Quest.card({ ...x, c: en ? i + 1 : i })).join('')}</div>${Quest.foot()}</section>`);
  }
  window.teachers = teachers;
  window.sec = sec;
  window.home = home;

  /* التشغيل الأوّلي بعد تحميل النواة */
  P = load();
  ens();
  if (DB.kids.length > 1) who();
  else if (P) home();
  else setup();
})();
