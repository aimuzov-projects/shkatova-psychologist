import { siteChecks } from '@aimuzov-projects/infra-site-kit/playwright/checks'

// Общие проверки сайтов: страницы из sitemap, axe, отложенная Яндекс Метрика и 404.
// Кнопки темы на сайте нет.
siteChecks({ metrika: true, notFound: true })
