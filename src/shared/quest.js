/* quest.js — مكوّنات تصميم «رحلة بومي» الموحّد (src/styles/quest.css):
   Quest.head(): زر الرئيسية + بومي بالكتاب + لافتة خشبية + شريط؛ Quest.card(): بطاقة مرحلة/قسم ملوّنة؛ Quest.foot(): لافتة النهاية.
   تستعملها الأكاديميات (العربية، الإنجليزية، الرياضيات)، صفحة الدروس، الألعاب، المعلّمون، والصفحة الرئيسية. */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const at = s => String(s).replace(/"/g, '&quot;');
  const GO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* صورة ثلاثية الأبعاد من img/3d (data-no3d: لا يعيد emoji3d تحويلها) */
  const img = (code, alt) => `<img src="img/3d/${code}.webp" alt="${esc(alt || '')}" draggable="false" data-no3d>`;
  const blocks = ls => `<span class="qx-blocks" aria-hidden="true">${ls.map((l, i) => `<i class="b${i}">${esc(l)}</i>`).join('')}</span>`;

  function head(o) {
    return `<div class="qx-top">
      ${o.home === false ? '' : `<button type="button" class="qx-home" onclick="${at(o.back || 'home()')}" aria-label="الرئيسية">${img('1f3e0', '')}</button>`}
      <img class="qx-owl" src="img/ui/quest/owl.webp" alt="" draggable="false" onerror="this.src='img/ui/owl-book.webp'">
      <div class="qx-sign">${o.t1 ? `<span class="qx-t1">${o.t1}</span>` : ''}<b class="qx-t2">${o.t2}</b></div>
      ${o.sub ? `<div class="qx-rib"><span class="s">${img('2b50')}</span><p style="margin:0">${o.sub}</p><span class="s">${img('2b50')}</span></div>` : ''}
    </div>`;
  }

  /* o: {c: رقم اللون ٠–٧، ic: html الأيقونة، t: العنوان، en: سطر إنجليزي، s: الوصف، n: عدد المتقن (شارة «أتقن»)، go: onclick، tag: 'button'|'summary'، locked} */
  function card(o) {
    const tag = o.tag || 'button';
    const act = tag === 'button' ? ` type="button"${o.go ? ` onclick="${at(o.go)}"` : ''}${o.locked ? ' aria-disabled="true"' : ''}` : '';
    const badge = o.n ? `<span class="qx-badge"><small>أتقن</small><b>${D(o.n)} ${img('2b50')}</b></span>` : (o.badge || '');
    return `<${tag} class="qx-card qx-c${(o.c || 0) % 8}${o.locked ? ' locked' : ''}"${act}>
      <span class="qx-ic">${o.ic || ''}${o.locked ? `<i class="qx-lock">${img('1f512', '')}</i>` : ''}</span>${badge}
      <span class="qx-txt"><b>${o.t}</b>${o.en ? `<span class="en">${o.en}</span>` : ''}${o.s ? `<small>${String(o.s).replace(/\s*·\s*/g, ' • ')}</small>` : ''}</span>
      <span class="qx-go">${o.locked ? img('1f512', 'مقفل') : GO}</span>
    </${tag}>`;
  }

  /* رسوم التصميم الأصلي (img/ui/quest/): مقصوصة من تصميم صاحب المشروع بلا خلفية */
  const art = (n, alt) => `<img class="qx-art" src="img/ui/quest/${n}.webp" alt="${esc(alt || '')}" draggable="false" data-no3d>`;
  const foot = () => `<div class="qx-foot"><img class="qx-signpost" src="img/ui/quest/sign.webp" alt="مع بومي نصل إلى القمة" draggable="false" data-no3d></div>`;

  /* المشهد الخلفي يُضاف مرة واحدة ويظهر فقط مع صفحات .qx (عبر CSS) */
  const scene = () => {
    if (document.getElementById('qx-scene') || !document.body) return;
    const s = document.createElement('div');
    s.id = 'qx-scene';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<i class="q-left"></i><i class="q-right"></i><i class="q-grass"></i>';
    document.body.prepend(s);
  };
  if (document.body) scene(); else addEventListener('DOMContentLoaded', scene, { once: true });

  /* أيقونات المراحل السبع بترتيب الصورة: لعبة، حروف، كتاب، أحجية، كتب، قبعة تخرّج، كأس */
  const STAGE = {
    ar: ['st0', 'st1', 'st2', 'st3', 'st4', 'st5', 'st6'].map(n => art(n)),
    en: [art('st0'), blocks(['A', 'B', 'C']), art('st2'), art('st3'), art('st4'), art('st5'), art('st6')],
    math: [img('1f9f8'), blocks(['١', '٢', '٣']), img('1f522'), img('1f4d0'), img('1f9ee'), img('1f9e0'), img('1f3c6'), img('1f393')]
  };

  /* صفحات القوائم القديمة (الأنشطة، جزيرة الألغاز): نحوّلها إلى التصميم نفسه من محتواها — عنوانها، وصفها، وأزرارها */
  const HUBS = { act: ['أَنْشِطَةٌ', 'تَفَاعُلِيَّةٌ'], puzzles: ['جَزِيرَةُ', 'الْأَلْغَازِ وَالتَّفْكِيرِ'] };
  const SCENE = /^(stories|examHub|games2d)$/; /* صفحات لها رأسها الخاص: نضيف لها خلفية المشهد فقط */
  function decorate() {
    try {
      const app = document.getElementById('app'), sec = app && app.querySelector(':scope>section.sec');
      const e = window.Router && Router.entry && Router.entry(), fn = e && e.fn;
      if (!sec || !fn || sec.classList.contains('qx')) return;
      if (SCENE.test(fn) && window.V === 'sec') { sec.classList.add('qx-scene'); return; }
      const hub = HUBS[fn];
      if (!hub || window.V !== 'sec') return;
      const rows = [...sec.querySelectorAll(':scope>.list>button.row[onclick]')];
      if (!rows.length) return;
      const sub = (sec.querySelector(':scope>p.mut') || {}).textContent || '';
      const cards = rows.map((r, i) => {
        const ic = r.querySelector(':scope>span'), b = r.querySelector(':scope>b'), sm = r.querySelector(':scope>small');
        return card({ c: i, ic: ic ? `<span class="qx-em">${ic.innerHTML}</span>` : '', t: b ? b.innerHTML : r.textContent, s: sm ? sm.textContent : '', go: r.getAttribute('onclick') });
      }).join('');
      sec.classList.add('qx', 'qx-hub');
      sec.innerHTML = head({ t1: hub[0], t2: hub[1], sub: esc(sub) }) + `<div class="qx-path">${cards}</div>` + foot();
    } catch (_) {}
  }
  const oh = window.h;
  if (typeof oh === 'function') window.h = function () { const r = oh.apply(this, arguments); decorate(); return r; };

  window.Quest = { head, card, foot, img, art, blocks, D, esc, STAGE, GO, decorate };
})();
