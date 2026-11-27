/* studio.mjs — «استوديو صوتي»: تسجيلات صاحب الموقع بصوته لكل نص في الموقع تُحفظ في Netlify Blobs،
   ثم تُضاف إلى ملفات المشروع (tools/clips/studio_pack.py) فيسمعها كل الطلاب.
   • أول جهاز يفتح الاستوديو «يملكه» (claim) ويحصل على مفتاح سري + رمز ربط قصير لإضافة جهاز آخر (link).
   • الرفع والحذف بالمفتاح فقط. القراءة (list/get) مفتوحة لأنها صوت سيُنشر في الموقع على أي حال.
   الإجراءات: ?a=claim | link | put&k= | del&k= | list | get&k= | info */
import { getStore } from '@netlify/blobs';

const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => ALPH[b % ALPH.length]).join('');
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
const sha = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)))), b => b.toString(16).padStart(2, '0')).join('');
const MAX = 4 * 1024 * 1024;
const okKey = k => /^[0-9a-z]{1,9}_[0-9a-z]{1,4}$/.test(String(k || ''));
const store = () => getStore({ name: 'hurufi-studio', consistency: 'strong' });

const HITS = new Map();
const limited = (req, key, max) => {
  const ip = req.headers.get('x-nf-client-connection-ip') || String(req.headers.get('x-forwarded-for') || '').split(',')[0] || 'x';
  const k = key + '|' + ip, now = Date.now(), a = (HITS.get(k) || []).filter(t => now - t < 600000);
  a.push(now); HITS.set(k, a); if (HITS.size > 20000) HITS.clear(); return a.length > max;
};
const owner = async () => { const r = await store().getWithMetadata('_owner', { type: 'json' }); return r && r.data ? r : null; };
const allowed = async token => { const o = await owner(); return !!(o && token && (o.data.h || []).includes(await sha(token))); };

export default async req => {
  const u = new URL(req.url), a = u.searchParams.get('a') || '', k = u.searchParams.get('k') || '';
  try {
    if (a === 'info') { const o = await owner(); return J(200, { claimed: !!o }); }
    if (a === 'list') {
      const out = {};
      for await (const page of store().list({ prefix: 'r/', paginate: true })) for (const b of page.blobs) out[b.key.slice(2)] = 1;
      return J(200, { keys: Object.keys(out) });
    }
    if (a === 'get') {
      if (!okKey(k)) return J(400, { error: 'key' });
      const r = await store().getWithMetadata('r/' + k, { type: 'arrayBuffer' });
      if (!r) return J(404, { error: 'notfound' });
      const m = r.metadata || {};
      return new Response(r.data, { headers: { 'content-type': m.type || 'audio/wav', 'cache-control': 'no-store', 'x-t': encodeURIComponent(m.t || ''), 'x-l': m.l || 'ar' } });
    }
    if (req.method !== 'POST') return J(405, { error: 'method' });
    if (a === 'claim') {
      if (limited(req, 'claim', 10)) return J(429, { error: 'rate' });
      const token = newToken(), code = newCode();
      const w = await store().setJSON('_owner', { h: [await sha(token)], code: await sha(code), at: Date.now() }, { onlyIfNew: true });
      if (w.modified === false) return J(409, { error: 'claimed' });
      return J(200, { token, code });
    }
    if (a === 'link') {
      if (limited(req, 'link', 10)) return J(429, { error: 'rate' });
      const b = JSON.parse((await req.text()) || '{}'), code = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const o = await owner(); if (!o) return J(404, { error: 'notclaimed' });
      if (code.length !== 8 || (await sha(code)) !== o.data.code) return J(403, { error: 'code' });
      const token = newToken(); o.data.h = [...(o.data.h || []), await sha(token)].slice(-8);
      const w = await store().setJSON('_owner', o.data, { onlyIfMatch: o.etag });
      if (w.modified === false) return J(409, { error: 'retry' });
      return J(200, { token });
    }
    const token = req.headers.get('x-token') || '';
    if (!(await allowed(token))) return J(403, { error: 'token' });
    if (!okKey(k)) return J(400, { error: 'key' });
    if (a === 'put') {
      if (limited(req, 'put', 1500)) return J(429, { error: 'rate' });
      const body = await req.arrayBuffer();
      if (!body.byteLength || body.byteLength > MAX) return J(413, { error: 'size' });
      const t = decodeURIComponent(req.headers.get('x-t') || '').slice(0, 2000), l = req.headers.get('x-l') === 'en' ? 'en' : 'ar';
      await store().set('r/' + k, body, { metadata: { t, l, type: (req.headers.get('content-type') || 'audio/wav').slice(0, 60), at: Date.now() } });
      return J(200, { ok: true });
    }
    if (a === 'del') { await store().delete('r/' + k); return J(200, { ok: true }); }
    return J(400, { error: 'action' });
  } catch (e) {
    return J(500, { error: 'server', detail: String(e && e.message || e).replace(/[^\w .:-]/g, '').slice(0, 80) });
  }
};
