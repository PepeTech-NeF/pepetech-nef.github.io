# PepeTech

Портфолио техники Minecraft, созданной **nef1c** на сервере **PepeLand**.

**Сайт:** https://pepetech-nef.github.io/  
**Редактор контента:** https://app.pagescms.org/

## Структура

- `src/data/builds/` — карточки техники;
- `src/data/categories/` и `src/data/countries/` — справочники категорий и стран;
- `src/data/site.json` — общие настройки и тексты;
- `public/images/` — изображения;
- `.pages.yml` — конфигурация Pages CMS.

## Локальный запуск

Требуется Node.js 22.12 или новее.

```bash
npm install
npm run dev
npm run build
```

Сайт автоматически собирается и публикуется через GitHub Actions при изменениях в ветке `main`. В портфолио нет демонстрационных карточек. Настоящие работы добавляются через Pages CMS, после сохранения сайт обновляется через GitHub Actions.
