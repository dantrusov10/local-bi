# NewLevel BI · No Server · Modern UI

Обновленная версия репозитория в стиле референсов:
- dark glass dashboard
- upload CSV/XLSX
- preview tables
- column type detection
- suggested joins
- manual join
- relation validation
- model schema
- explore builder
- chart / table output
- saved views
- local persistence via IndexedDB
- exports CSV/XLSX

## Deploy
Vercel:
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`


## Обновление v3
- все разделы и кнопки переведены на русский
- исправлен сайзинг по ширине
- добавлен явный раздел «Конструктор графиков»
- добавлены внутренние фильтры: содержит / не содержит / равно / не равно / начинается с / заканчивается на / больше / не менее / меньше / не более / пусто / не пусто


## Обновление v5
- кастомные выпадающие списки в стиле решения
- поиск внутри выпадающих списков
- новые виды визуалов: столбчатые, горизонтальные, линейные, область, комбинированные, круговые, донат, KPI, таблица
- breakdown / серия
- top N


## Обновление v6
- мультивыбор измерений через кастомный dropdown с поиском
- вторая метрика
- новые визуалы: воронка, KPI, table, hbar, area, combo, stacked, pie, donut
- дропдауны и визуалы в dark enterprise UI


## Обновление v7
- pivot table
- join preview перед построением визуала
- сохранение виджетов на дашборд
- ручная перестановка виджетов ↑ ↓
- несколько серий и вторая метрика в визуалах


## Обновление v8
- несколько отдельных дашбордов
- визуальная схема модели
- join preview внутри модели и дашборда
- виджеты с шириной 1x / 2x
- pivot builder и pivot table сохранены


## Обновление v9
- semantic layer (раздел «Метрики»)
- глобальные фильтры на весь дашборд
- cross-filtering по клику на график
- drill-down в таблицу исходных данных
- period comparison: предыдущий период / YTD
- все разделы и кнопки на русском языке


## v13 Enterprise
- RLS permissions
- API/webhooks
- write-back
- white label
- computed metrics
- stacked + legend (база)
- dashboard templates


## Обновление v13.1
- полноценнее RLS: admin / teamlead / manager / viewer
- реальные HTTP webhooks через fetch
- реальный write-back через API endpoint
- white label настройки применяются к интерфейсу через CSS variables
- все разделы и кнопки на русском


## Обновление v13.2 Stabilization
- убран new Function из metrics.js, добавлен безопасный формульный parser
- explore.js переписан: COUNT / SUM / AVG / MAX / MIN / semantic metrics / pivot / period compare
- RLS переведен в deny-by-default для viewer и неизвестных ролей
- подключен Web Worker для parsing + profiling CSV/XLSX
- uid и normalizeJoinKey вынесены в src/core/utils.js
- нормализация join-ключей разделена на soft и loose режимы


## Обновление v13.3 QA release
- логирование времени, строк, таблиц и колонок при загрузке через worker
- панель QA и диагностики загрузки
- постраничный preview таблиц по 50 строк
- реальный QA report по файлу CRM_pipeline_100_RU_IT_companies (1).xlsx
- сохранение qa-логов в workspace


## Обновление v13.4 Final Hardening
- App.jsx декомпозирован через hooks: usePersistentWorkspace, useDataWorkspace, useModeling, useAnalytics, useDashboards, useSecurityTheme
- analytics вынесена в отдельный worker: src/workers/analyticsWorker.js
- чистое ядро аналитики вынесено в src/core/exploreShared.js
- добавлены unit tests: metrics, permissions, explore
- package.json дополнен vitest и scripts test/test:watch
- вручную Excel не прогонялся в этой версии, как и просили; приоритет был на архитектуру, тесты и стабильность


## Обновление v13.5 Build + Smoke
- добавлен `npm run smoke`
- добавлен `scripts/smoke-check.mjs`
- добавлен `BUILD_AND_SMOKE_REPORT.md`
- автоматически прогнаны build и smoke-check
