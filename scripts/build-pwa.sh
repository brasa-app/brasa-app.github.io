#!/usr/bin/env bash
# Genera la web instalable (PWA) en dist/ para publicarla en GitHub Pages en brasa-app.github.io
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
npx expo export -p web
python3 - <<'PY'
p = 'dist/index.html'
s = open(p, encoding='utf-8').read()
head = '''
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="theme-color" content="#e8501f" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Brasa" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/icon-180.png" />
'''
s = s.replace('<html lang="en">', '<html lang="es">')
s = s.replace('initial-scale=1, shrink-to-fit=no', 'initial-scale=1, viewport-fit=cover')
s = s.replace('</head>', head + '</head>', 1)
s = s.replace('</body>', '<script src="/sw-register.js"></script>\n</body>', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
# GitHub Pages: cualquier ruta sirve la app (enlaces directos a /brasa/search, etc.)
cp dist/index.html dist/404.html
touch dist/.nojekyll
