#!/usr/bin/env node
/* يولّد قائمة كل ملفات الموقع (الكود، البيانات، الصور والأيقونات، المكتبات، مؤثرات الصوت) داخل sw.js
   ليحفظها عامل الخدمة كلها في الجهاز من أول زيارة، فيعمل كل شيء بلا إنترنت.
   التشغيل: node tools/offline/gen-sw-list.js        (يحدّث sw.js)
            node tools/offline/gen-sw-list.js --check (يفشل إن كانت القائمة قديمة) */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const DIRS = ['src', 'data', 'img', 'lib'];
const EXT = /\.(js|css|json|webp|png|jpe?g|svg|gif|wav|mp3|woff2?)$/i;
const out = ['./', './index.html', './manifest.webmanifest'];
const walk = d => { for (const n of fs.readdirSync(path.join(ROOT, d)).sort()) {
  const r = d + '/' + n, st = fs.statSync(path.join(ROOT, r));
  if (st.isDirectory()) walk(r); else if (EXT.test(n)) out.push('./' + r);
} };
DIRS.forEach(walk);
for (const n of fs.readdirSync(path.join(ROOT, 'audio')).sort()) if (/\.wav$/.test(n)) out.push('./audio/' + n);
const body = '/* OFFLINE-LIST:BEGIN — يولّدها tools/offline/gen-sw-list.js، لا تعدّلها يدويًا */\nconst OFFLINE = ' +
  JSON.stringify(out).replace(/","/g, '",\n"') + ';\n/* OFFLINE-LIST:END */';
const swp = path.join(ROOT, 'sw.js'), sw = fs.readFileSync(swp, 'utf8');
const re = /\/\* OFFLINE-LIST:BEGIN[\s\S]*?\/\* OFFLINE-LIST:END \*\//;
if (!re.test(sw)) { console.error('sw.js: لا توجد علامات OFFLINE-LIST'); process.exit(1); }
const next = sw.replace(re, body);
if (process.argv.includes('--check')) {
  if (next !== sw) { console.error('✗ قائمة ملفات العمل بلا إنترنت في sw.js قديمة: شغّل node tools/offline/gen-sw-list.js'); process.exit(1); }
  console.log('✓ قائمة العمل بلا إنترنت محدّثة (' + out.length + ' ملفًا)');
} else { fs.writeFileSync(swp, next); console.log('sw.js: ' + out.length + ' ملفًا'); }
