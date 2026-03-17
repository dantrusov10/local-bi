Тестовый контур для BI-ядра (ручной smoke-check)

Проверить обязательно:
1. COUNT / SUM / AVG / MAX / MIN
2. semantic metrics:
   - агрегация по полю
   - формула: revenue - cost
3. RLS:
   - admin видит всё
   - manager видит только owner === userName
   - teamlead видит только team === teamValue
   - viewer без userName не видит ничего
4. Cross-filtering + drill-down
5. Сравнение периодов:
   - previous_period
   - YTD
6. Загрузка CSV/XLSX > 10 МБ без заморозки вкладки
