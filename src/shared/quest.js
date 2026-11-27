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
      <img class="qx-owl" src="img/ui/owl-book.webp" alt="" draggable="false" onerror="this.remove()">
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
      <span class="qx-ic">${o.ic || ''}</span>${badge}
      <span class="qx-txt"><b>${o.t}</b>${o.en ? `<span class="en">${o.en}</span>` : ''}${o.s ? `<small>${String(o.s).replace(/\s*·\s*/g, ' • ')}</small>` : ''}</span>
      <span class="qx-go">${GO}</span>
    </${tag}>`;
  }

  const foot = () => `<div class="qx-foot"><div class="qx-post">مَعَ بُومِي<br>نَصِلُ إِلَى الْقِمَّةِ<span class="h">❤️</span></div></div>`;

  /* المشهد الخلفي يُضاف مرة واحدة ويظهر فقط مع صفحات .qx (عبر CSS) */
  const scene = () => {
    if (document.getElementById('qx-scene') || !document.body) return;
    const s = document.createElement('div');
    s.id = 'qx-scene';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<i class="q-shelf"></i><i class="q-castle"></i><i class="q-books"></i><i class="q-palm1"></i><i class="q-palm2"></i>';
    document.body.prepend(s);
  };
  if (document.body) scene(); else addEventListener('DOMContentLoaded', scene, { once: true });

  /* أيقونات المراحل السبع بترتيب الصورة: لعبة، حروف، كتاب، أحجية، كتب، قبعة تخرّج، كأس */
  const STAGE = {
    ar: [img('1f9f8'), blocks(['أ', 'ب', 'ت']), img('1f4d6'), img('1f9e9'), img('1f4da'), img('1f393'), img('1f3c6')],
    en: [img('1f9f8'), blocks(['A', 'B', 'C']), img('1f4d6'), img('1f9e9'), img('1f4da'), img('1f393'), img('1f3c6')],
    math: [img('1f9f8'), blocks(['١', '٢', '٣']), img('1f522'), img('1f4d0'), img('1f9ee'), img('1f9e0'), img('1f3c6'), img('1f393')]
  };

  window.Quest = { head, card, foot, img, blocks, D, esc, STAGE, GO };
})();
