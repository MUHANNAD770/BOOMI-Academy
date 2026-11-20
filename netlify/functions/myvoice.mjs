/* myvoice.mjs — بوابة «صوتي الشخصي».
   • تعيد عنوان خادم الصوت (VOICE_SERVER_URL) وتذكرة تسجيل قصيرة العمر (10 دقائق) موقّعة بـ VOICE_SECRET.
   • السرّ يبقى في متغيّرات Netlify وخادم الصوت فقط: لا يظهر في GitHub ولا في المتصفح.
   • بلا إعداد الخادم: تعيد configured:false فيُعرض للمستخدم أن الخدمة غير جاهزة، ويبقى صوت بومي كما هو. */
const J = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const hex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');

export default async () => {
  const url = (process.env.VOICE_SERVER_URL || '').replace(/\/+$/, ''), secret = process.env.VOICE_SECRET || '';
  if (!url || !secret) return J(200, { configured: false });
  const exp = String(Math.floor(Date.now() / 1000) + 600);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const ticket = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('enroll|' + exp)));
  return J(200, { configured: true, url, ticket, exp });
};
