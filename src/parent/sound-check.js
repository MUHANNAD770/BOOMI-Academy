/* sound-check.js — «مراجعة النطق»: ولي الأمر يسمع كل حرف من أ إلى ي بكل أشكاله، ويضع ✗ على الخاطئ،
   ثم ينسخ قائمة الأخطاء ويرسلها لإعادة تسجيلها (tools/clips/letters_fix.py). العلامات محفوظة في هذا الجهاز. */
(() => {
  'use strict';
  const F = 'َ', K = 'ِ', D = 'ُ', S = 'ْ', SH = 'ّ';
  const LETTERS = 'ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
  const FORMS = [
    ['name', 'الاسم', l => l],
    ['fa', 'فتحة', l => l + F], ['ka', 'كسرة', l => l + K], ['da', 'ضمة', l => l + D],
    ['su', 'سكون', l => l + S],
    ['shf', 'شدة وفتحة', l => l + SH + F], ['shk', 'شدة وكسرة', l => l + SH + K], ['shd', 'شدة وضمة', l => l + SH + D],
    ['tf', 'تنوين فتح', l => l + 'ً'], ['td', 'تنوين ضم', l => l + 'ٌ'], ['tk', 'تنوين كسر', l => l + 'ٍ'],
    ['mf', 'مد بالألف', l => l + F + 'ا'], ['md', 'مد بالواو', l => l + D + 'و'], ['mk', 'مد بالياء', l => l + K + 'ي']
  ];
  const HAMZA = [['fa', 'فتحة', 'أَ'], ['ka', 'كسرة', 'إِ'], ['da', 'ضمة', 'أُ'], ['mf', 'مد بالألف', 'آ'], ['md', 'مد بالواو', 'أُو'], ['mk', 'مد بالياء', 'إِي']];
  const KEY = 'hurufi-soundcheck';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { return {}; } };
  const store = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (_) {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D0 = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  const rows = () => [['أ', HAMZA.map(([k, n, t]) => [k, n, t])], ...LETTERS.map(l => [l, FORMS.map(([k, n, f]) => [k, n, f(l)])])];
  const id = (l, k) => l + ':' + k;

  function count() {
    const m = load(), n = Object.keys(m).length;
    const c = document.getElementById('sc-n'); if (c) c.textContent = n ? `✗ ${D0(n)} خطأ` : 'لا أخطاء محدّدة';
    const b = document.getElementById('sc-copy'); if (b) b.disabled = !n;
  }

  window.soundCheck = function () {
    window.V = 'sec'; window.CS = 'set';
    const m = load();
    h(`<section class="sec sc-page">
      <button class=link onclick="goBack()">← رُجُوعٌ</button>
      <h2>🎧 مراجعة نطق الحروف</h2>
      <p class=mut>اضغط على أي شكل لتسمعه. إذا كان النطق خطأً اضغط ✗ بجانبه. في النهاية اضغط «انسخ الأخطاء» وأرسل القائمة لإعادة تسجيلها.</p>
      <div class=sc-bar><b id=sc-n></b><button class=big id=sc-copy onclick="soundCheckCopy()">📋 انسخ الأخطاء</button><button class=alt onclick="soundCheckClear()">🧹 مسح العلامات</button></div>
      <div id=sc-msg class=mut></div>
      ${rows().map(([l, fs]) => `<div class=sc-letter><h3>${esc(l === 'أ' ? 'أ (الهمزة)' : l)}</h3><div class=sc-grid>${fs.map(([k, n, t]) => {
        const i = id(l, k), bad = !!m[i];
        return `<div class="sc-item${bad ? ' bad' : ''}" data-i="${esc(i)}"><button class=sc-play onclick="soundCheckPlay(this)" data-t="${esc(t)}"><b>${esc(t)}</b><small>${esc(n)}</small></button><button class=sc-x onclick="soundCheckMark(this)" aria-label="نطق خاطئ">✗</button></div>`;
      }).join('')}</div></div>`).join('')}
    </section>`);
    count();
  };
  window.soundCheckPlay = b => { try { say(b.dataset.t, 'ar'); } catch (_) {} };
  window.soundCheckMark = b => {
    const it = b.closest('.sc-item'), i = it.dataset.i, m = load(), t = it.querySelector('.sc-play b').textContent, n = it.querySelector('.sc-play small').textContent;
    if (m[i]) delete m[i]; else m[i] = t + ' (' + n + ')';
    store(m); it.classList.toggle('bad', !!m[i]); count();
  };
  window.soundCheckCopy = () => {
    const m = load(), txt = 'أخطاء النطق: ' + Object.values(m).join('، ');
    const msg = document.getElementById('sc-msg');
    const done = ok => { if (msg) msg.textContent = ok ? '✅ نُسخت القائمة. أرسلها في المحادثة.' : txt; };
    try { navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)); } catch (_) { done(false); }
  };
  window.soundCheckClear = () => { store({}); soundCheck(); };
})();
