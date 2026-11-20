/* sync.mjs — حفظ تقدّم الطالب على الإنترنت (Netlify Blobs: تخزين مدمج في Netlify، بلا حساب أو مفاتيح إضافية).
   • كل طالب = سجل واحد صغير، مفتاحه «رمز الطالب» (8 أحرف يصعب تخمينها، مثل K7P2M9QX).
   • كل جهاز يحصل على مفتاح سري خاص به (يُخزَّن هنا مجزّأً SHA-256 فقط). الرمز وحده يربط جهازًا جديدًا.
   • الكتابة مشروطة (ETag): إذا حفظ جهازان في اللحظة نفسها لا يضيع شيء؛ يُرجَع الأحدث ليدمجه الجهاز ثم يعيد الحفظ.
   • لا تُحفظ محادثات الطالب مع بومي ولا أي تسجيلات صوتية؛ فقط التقدّم والإعدادات.
   الإجراءات: create | push | pull | link | remove */
import { getStore } from '@netlify/blobs';

const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => ALPH[b % ALPH.length]).join('');
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
const sha = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)))), b => b.toString(16).padStart(2, '0')).join('');
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const MAX = 250000; /* ~250KB لكل طالب: أكثر من كافٍ لسنوات من التقدّم */

/* حدّ بسيط لعدد المحاولات لكل عنوان (يمنع تخمين الرموز) */
const HITS = new Map();
const limited = (req, key, max) => {
  const ip = req.headers.get('x-nf-client-connection-ip') || String(req.headers.get('x-forwarded-for') || '').split(',')[0] || 'x';
  const k = key + '|' + ip, now = Date.now(), a = (HITS.get(k) || []).filter(t => now - t < 600000);
  a.push(now); HITS.set(k, a); if (HITS.size > 20000) HITS.clear(); return a.length > max;
};
/* تنظيف بيانات الطالب قبل الحفظ */
/* نحفظ الأشياء الثابتة فقط (نفس القائمة في sync.js) — تبقى البيانات صغيرة والحفظ مجانيًا */
const KEEP = ['name', 'gender', 'age', 'lang', 'stage', 'teacher', 'mic', 'snd', 'vol', 'rate', 'star', 'done', 'sc', 'fd', 'ml', 'cd', 'act', 'courseDone', 'badges', 'unlockAll', 'stories', 'wk', 'speed', 'vq', 'days', 'g2', 'courseQuiz', 'coursePractice', 'sk', 'mind', 'bank']; /* نفس قائمة sync.js (كانت vq وdays تُحذف هنا) */
function clean(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
  const o = {}; for (const k of KEEP) if (d[k] !== undefined) o[k] = d[k];
  o.name = String(o.name || '').replace(/[<>&"'`]/g, '').slice(0, 40);
  const s = JSON.stringify(o); return s.length > MAX ? null : o;
}
const store = () => getStore({ name: 'hurufi-students', consistency: 'strong' });
async function load(code) { const r = await store().getWithMetadata(code, { type: 'json' }); return r && r.data ? r : null; }
const owns = async (rec, token) => !!token && Array.isArray(rec.data.h) && rec.data.h.includes(await sha(token));

export default async req => {
  if (req.method !== 'POST') return J(405, { error: 'method' });
  const raw = await req.text(); if (raw.length > MAX + 4000) return J(413, { error: 'big' });
  let b; try { b = JSON.parse(raw || '{}') } catch (e) { return J(400, { error: 'bad' }) }
  try {
    if (b.action === 'create') {
      if (limited(req, 'create', 30)) return J(429, { error: 'rate' });
      const data = clean(b.data); if (!data) return J(400, { error: 'data' });
      const token = newToken(), now = Date.now();
      for (let i = 0; i < 5; i++) {
        const code = newCode();
        const w = await store().setJSON(code, { h: [await sha(token)], rev: 1, data, created: now, at: now }, { onlyIfNew: true });
        if (w.modified !== false) return J(200, { code, token, rev: 1 });
      }
      return J(503, { error: 'busy' });
    }
    const code = normCode(b.code); if (code.length !== 8) return J(400, { error: 'code' });
    if (b.action === 'link') {
      if (limited(req, 'link', 60)) return J(429, { error: 'rate' }); /* يكفي لمعلّم يضيف صفًا كاملًا */
      const r = await load(code); if (!r) return J(404, { error: 'notfound' });
      const token = newToken(), rec = r.data; rec.h = [...(rec.h || []), await sha(token)].slice(-12);
      const w = await store().setJSON(code, rec, { onlyIfMatch: r.etag });
      if (w.modified === false) return J(409, { error: 'retry' });
      return J(200, { code, token, rev: rec.rev, data: rec.data });
    }
    const r = await load(code); if (!r) return J(404, { error: 'notfound' });
    if (!(await owns(r, b.token))) return J(403, { error: 'token' });
    if (b.action === 'pull') return J(200, { rev: r.data.rev, data: r.data.data, at: r.data.at });
    if (b.action === 'push') {
      if (limited(req, 'push', 120)) return J(429, { error: 'rate' });
      const data = clean(b.data); if (!data) return J(400, { error: 'data' });
      if (+b.rev !== r.data.rev) return J(409, { rev: r.data.rev, data: r.data.data }); /* جهاز آخر حفظ قبلك: ادمج ثم أعد المحاولة */
      const rec = { ...r.data, data, rev: r.data.rev + 1, at: Date.now() };
      const w = await store().setJSON(code, rec, { onlyIfMatch: r.etag });
      if (w.modified === false) { const n = await load(code); return J(409, { rev: n.data.rev, data: n.data.data }) }
      return J(200, { rev: rec.rev, at: rec.at });
    }
    if (b.action === 'remove') { await store().delete(code); return J(200, { ok: true }) }
    return J(400, { error: 'action' });
  } catch (e) {
    return J(500, { error: 'server', detail: String(e && e.message || e).replace(/[^\w .:-]/g, '').slice(0, 80) });
  }
};
