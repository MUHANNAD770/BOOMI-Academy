@echo off
chcp 65001 >nul
REM تشغيل موقع «حروفي/بومي» محليًا للتجربة (محركات الصوت لا تعمل عند فتح index.html مباشرة كملف).
REM بعد التشغيل افتح: http://localhost:8080
cd /d "%~dp0"
set PYCODE=import http.server,mimetypes;mimetypes.add_type('application/wasm','.wasm');mimetypes.add_type('text/javascript','.mjs');mimetypes.add_type('text/javascript','.js');print('افتح http://localhost:8080 - للإيقاف اضغط Ctrl+C');http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=8080,bind='127.0.0.1')
where python >nul 2>nul && (start "" http://localhost:8080 & python -c "%PYCODE%" & goto :eof)
where py >nul 2>nul && (start "" http://localhost:8080 & py -c "%PYCODE%" & goto :eof)
where npx >nul 2>nul && (start "" http://localhost:8080 & npx --yes serve -l 8080 . & goto :eof)
echo لم أجد Python أو Node.js على هذا الجهاز. ثبّت أحدهما (python.org أو nodejs.org) ثم أعد تشغيل هذا الملف،
echo أو جرّب الموقع بعد نشره على Netlify مباشرة.
pause
