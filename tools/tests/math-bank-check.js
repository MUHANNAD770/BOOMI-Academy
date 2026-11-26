// فحص دفعات بنك الرياضيات (data/math): كل إجابة ضمن خياراتها، الوحدات موجودة، لا خيارات مكررة، أسئلة الاختبار موجودة،
// والأسئلة المولّدة بأعداد جديدة صحيحة حسابيًا. التشغيل: node tools/tests/math-bank-check.js
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..');
global.window = global; global.P = {};
require(path.join(ROOT, 'src/academies/math/math-academy.js'));
const ix = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/math/index.json'), 'utf8'));
const batches = ix.batches.map(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/math', f), 'utf8')));
const d = MathAcademy.merge(batches), N = MathAcademy.norm, bad = [];
const ids = new Set();
for (const b of batches) for (const s of b.stages || []) for (const q of s.questions || []) { if (ids.has(q.id)) bad.push('معرّف مكرر ' + q.id); ids.add(q.id); }
for (const s of d.stages) for (const q of s.q) {
  if (!s.units.some(u => u.id === q.unit_id)) bad.push('وحدة غير موجودة ' + q.id);
  if (!q.prompt || !q.correct_answer) bad.push('سؤال ناقص ' + q.id);
  if (q.type === 'choice' && !q.options.some(o => N(o) === N(q.correct_answer))) bad.push('الإجابة ليست ضمن الخيارات ' + q.id);
  if (q.type === 'choice' && new Set(q.options.map(N)).size !== q.options.length) bad.push('خيارات مكررة ' + q.id);
}
for (const p of d.place) if (!p.stage_id) bad.push('سؤال اختبار المستوى بلا مرحلة ' + p.id);
const AD = '٠١٢٣٤٥٦٧٨٩', toN = s => +String(s).replace(/[٠-٩]/g, x => AD.indexOf(x));
let vn = 0;
for (const q of Object.values(d.Q)) for (let k = 0; k < 100; k++) {
  const v = MathAcademy.variant(q); if (!v) break; vn++;
  let m = v.prompt.match(/^ما ناتج ([٠-٩]+) ([+−×÷]) ([٠-٩]+)؟$/);
  if (m) { const a = toN(m[1]), b = toN(m[3]), r = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]]; if (toN(v.correct_answer) !== r || !Number.isInteger(r) || r < 0 || (v.options.length && !v.options.includes(v.correct_answer))) bad.push('سؤال مولّد خاطئ ' + v.prompt); }
  m = v.prompt.match(/^أكمل: ([٠-٩]+) ([+−×÷]) __ = ([٠-٩]+)$/);
  if (m) { const a = toN(m[1]), c = toN(m[3]), x = toN(v.correct_answer); if ({ '+': a + x, '−': a - x, '×': a * x, '÷': a / x }[m[2]] !== c) bad.push('سؤال مولّد خاطئ ' + v.prompt); }
}
console.log(`الدفعات ${batches.length} · المراحل ${d.stages.length} · الأسئلة ${Object.keys(d.Q).length} · اختبار المستوى ${d.place.length} · أسئلة مولّدة مفحوصة ${vn}`);
if (bad.length) { console.log('✗ ' + bad.slice(0, 20).join('\n✗ ')); process.exit(1); }
console.log('✓ بنك الرياضيات سليم');
