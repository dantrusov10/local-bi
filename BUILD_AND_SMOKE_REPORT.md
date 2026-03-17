# BUILD + SMOKE REPORT

## Статус
- Build: OK
- Smoke-check: OK
- Unit tests (vitest): в проект добавлен и готов, но в sandbox не завершился стабильно; запускать в CI/GitHub Actions

## Что проверено автоматически
1. npm install
2. npm run build
3. npm run smoke
4. попытка npm run test

## Результат build
```text

> local-bi-modern@0.2.0 build
> vite build

[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 74 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                          [39m[1m[2m  0.40 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist/[22m[2massets/[22m[32manalyticsWorker-DQkyOSyy.js  [39m[1m[2m  5.36 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mdataWorker-BVNGCKpJ.js       [39m[1m[2m354.70 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[35mindex-C-pxb0ka.css           [39m[1m[2m 15.51 kB[22m[1m[22m[2m │ gzip:   3.93 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-B3sBkSwm.js            [39m[1m[2m496.79 kB[22m[1m[22m[2m │ gzip: 162.37 kB[22m
[32m✓ built in 7.25s[39m


```

## Результат smoke
```text

> local-bi-modern@0.2.0 smoke
> node scripts/smoke-check.mjs

SMOKE CHECK PASSED


```
