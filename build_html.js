const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { gfmHeadingId } = require('marked-gfm-heading-id');

marked.use(gfmHeadingId());
marked.setOptions({ breaks: true, gfm: true });

const root = 'c:/GitHub/leelaclue.github.io';
const langs = ['en', 'de', 'ru'];

// ─── Carousel image sets per section ────────────────────────────────────────
//
// To change carousel images: drop .webp files into the relevant directory and
// run `node build_html.js`. No code changes needed.
//
//   assets/images/carousel/hero/      → Section 1 (What is LeelaClue)
//   assets/images/carousel/sor/       → Section 2 (S·O·R Framework)
//   assets/images/carousel/practice/  → Section 3 (Six Steps)
//   assets/images/carousel/anna/      → Section 4 (Case Study: Anna)
//   assets/images/carousel/daily/     → Section 5 (Daily Card)

const sectionDefs = [
    { key: 'hero',     id: 'section-hero',     extraClass: ' hero-section', isHero: true },
    { key: 'sor',      id: 'section-sor',       extraClass: ' alt-bg' },
    { key: 'practice', id: 'section-practice',  extraClass: '' },
    { key: 'anna',     id: 'section-anna',      extraClass: ' alt-bg' },
    { key: 'daily',    id: 'section-daily',     extraClass: '' },
];

// Read all .webp files from a carousel directory, sorted alphabetically
function getCarouselImages(key) {
    const dir = path.join(root, 'assets', 'images', 'carousel', key);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => /\.webp$/i.test(f))
        .sort();
}

// ─── Store badges ────────────────────────────────────────────────────────────

const IOS_URL    = 'https://apps.apple.com/us/app/leelaclue-mindfulness/id6757707003';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.ikaengel.leelaclue';
const IOS_BADGE  = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
const GP_BADGE   = 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

function storeBadges(eager) {
    const la = eager ? '' : ' loading="lazy"';
    return `<div class="carousel-cta">
                        <a href="${IOS_URL}" target="_blank" rel="noopener">
                            <img alt="Download on the App Store" src="${IOS_BADGE}" class="store-badge-sm"${la}>
                        </a>
                        <a href="${ANDROID_URL}" target="_blank" rel="noopener">
                            <img alt="Get it on Google Play" src="${GP_BADGE}" class="store-badge-sm google"${la}>
                        </a>
                    </div>`;
}

// ─── Carousel HTML ───────────────────────────────────────────────────────────

function buildCarousel(def) {
    const files = getCarouselImages(def.key);

    if (files.length === 0) {
        console.warn(`  WARNING: no images in assets/images/carousel/${def.key}/`);
        return `<div class="carousel-wrapper">
                    ${storeBadges(def.isHero)}
                    <div class="section-carousel" style="display:flex;align-items:center;justify-content:center;">
                        <p style="color:var(--text-color);opacity:0.4;font-size:0.9rem;padding:2rem;text-align:center;">
                            Drop .webp images into<br>assets/images/carousel/${def.key}/
                        </p>
                    </div>
                </div>`;
    }

    const slides = files.map((file, i) => {
        const name = path.basename(file, '.webp');
        const isFirst = i === 0;
        const loading = (def.isHero && isFirst) ? ' fetchpriority="high"' : ' loading="lazy"';
        return `                        <img src="../assets/images/carousel/${def.key}/${file}" alt="Leela Card — ${name}" class="section-slide${isFirst ? ' active' : ''}"${loading}>`;
    }).join('\n');

    const dots = files.map((_, i) =>
        `                            <button class="carousel-dot${i === 0 ? ' active' : ''}" aria-label="Show slide ${i + 1}"></button>`
    ).join('\n');

    return `<div class="carousel-wrapper">
                    ${storeBadges(def.isHero)}
                    <div class="section-carousel">
${slides}
                        <div class="carousel-dots">
${dots}
                        </div>
                    </div>
                </div>`;
}

// ─── Landing section HTML ────────────────────────────────────────────────────

function buildSection(def, markdownHtml) {
    return `
        <section class="landing-section${def.extraClass}" id="${def.id}">
            <div class="section-container">
                <div class="animate-on-scroll">
                    ${buildCarousel(def)}
                </div>
                <div class="section-text markdown-body animate-on-scroll delay-1">
                    ${markdownHtml}
                </div>
            </div>
        </section>`;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

function getTitle(lang) {
    if (lang === 'de') return 'LeelaClue — Offizielle Achtsamkeits- &amp; Selbsterkenntnis-App | iOS &amp; Android';
    if (lang === 'ru') return 'LeelaClue — Официальное приложение для осознанности и самопознания | iOS и Android';
    return 'LeelaClue — Official Mindfulness &amp; Self-Discovery App | iOS &amp; Android';
}

function getDescription(lang) {
    if (lang === 'de') return 'LeelaClue ist eine kostenlose Achtsamkeits-App, inspiriert vom antiken Leela-Spiel. Täglicher S·O·R-Spread, Reflexionstagebuch und 72 einzigartige Karten. Kostenlos für iOS &amp; Android.';
    if (lang === 'ru') return 'LeelaClue — бесплатное приложение для осознанности, вдохновлённое древней игрой Лила. Ежедневный расклад С·П·Р, Дневник размышлений и 72 уникальных карты. Бесплатно для iOS и Android.';
    return 'LeelaClue is a free mindfulness and self-discovery app inspired by the ancient Indian game of Leela. Daily S·O·R Guidance Spread, Reflection Diary, and 72 unique Leela cards. Free for iOS &amp; Android.';
}

function getHreflang(pageName) {
    return langs.map(l =>
        `    <link rel="alternate" hreflang="${l}" href="https://leelaclue.com/${l}/${pageName}.html">`
    ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="https://leelaclue.com/en/${pageName}.html">`;
}

function getSchemaOrg(lang) {
    return `    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "LeelaClue",
      "alternateName": "Leela Clue, LeelaClue Mindfulness",
      "url": "https://leelaclue.com/${lang}/",
      "operatingSystem": "iOS, Android",
      "applicationCategory": "LifestyleApplication",
      "applicationSubCategory": "Mindfulness & Self-Discovery",
      "softwareVersion": "1.7.3",
      "inLanguage": ["en", "de", "ru"],
      "downloadUrl": [
        "${IOS_URL}",
        "${ANDROID_URL}"
      ],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "author": { "@type": "Organization", "name": "LeelaClue", "url": "https://leelaclue.com" },
      "image": "https://leelaclue.com/assets/app_icon.png",
      "screenshot": "https://leelaclue.com/assets/images/ADharma.webp",
      "description": "LeelaClue is a free mindfulness and self-discovery mobile app inspired by the ancient Indian game of Leela. Features Daily Wisdom rituals, a meditative 3-Card S·O·R Guidance Spread, a Personal Reflection Diary, and 72 unique cards representing states of consciousness."
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "LeelaClue",
      "url": "https://leelaclue.com",
      "inLanguage": ["en", "de", "ru"],
      "publisher": { "@type": "Organization", "name": "LeelaClue", "url": "https://leelaclue.com" }
    }
    </script>`;
}

// ─── Nav labels per language ─────────────────────────────────────────────────

function navLabels(lang) {
    const labels = {
        en: { offlineGame: 'Offline Game', community: 'Community', blog: 'Blog', releaseNews: 'Release News', featureVotes: 'Feature Votes', guide: 'Guide', userGuide: 'User Guide', faq: 'FAQ' },
        de: { offlineGame: 'Offline-Spiel', community: 'Community', blog: 'Blog', releaseNews: 'Release-News', featureVotes: 'Feature-Abstimmung', guide: 'Anleitung', userGuide: 'Benutzerhandbuch', faq: 'FAQ' },
        ru: { offlineGame: 'Офлайн-игра', community: 'Сообщество', blog: 'Блог', releaseNews: 'Новости обновлений', featureVotes: 'Голосование', guide: 'Руководство', userGuide: 'Руководство пользователя', faq: 'FAQ' },
    };
    return labels[lang] || labels.en;
}

function leftPanel(lang) {
    const labels = {
        en: ['About',      'S·O·R',  'Practice', 'Case Study', 'App'],
        de: ['Über',       'S·O·R',  'Praxis',   'Fallstudie', 'App'],
        ru: ['О нас',      'С·П·Р',  'Практика', 'Кейс',       'Приложение'],
    }[lang] || ['About', 'S·O·R', 'Practice', 'Case Study', 'App'];

    const versionLabel = { en: 'New in v1.7.3', de: 'Neu in v1.7.3', ru: 'Новое в v1.7.3' };
    const postTag      = { en: 'New Blog Post', de: 'Neuer Blogbeitrag', ru: 'Новая статья' };

    const dots = sectionDefs.map((def, i) => `
        <a href="#${def.id}" class="section-nav-item${i === 0 ? ' active' : ''}" data-section="${def.id}">
            <span class="section-nav-dot"></span>
            <span class="section-nav-label">${labels[i]}</span>
        </a>`).join('');

    return `
    <aside class="left-panel">
        <div class="panel-badges">
            <a href="whats_new.html" class="ann-version">${versionLabel[lang] || versionLabel.en}</a>
            <a href="language-of-the-field.html" class="ann-tag">${postTag[lang] || postTag.en}</a>
        </div>
        <nav class="section-nav" aria-label="Page sections">
${dots}
        </nav>
    </aside>`
}

// ─── Full page template ──────────────────────────────────────────────────────

function getTemplate(lang, sectionsHtml) {
    const n = navLabels(lang);
    const activeLang = (l) => l === lang ? ' active' : '';
    const title = getTitle(lang);
    const desc  = getDescription(lang);
    const canon = `https://leelaclue.com/${lang}/`;

    return `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canon}">
${getHreflang('index')}
    <meta property="og:site_name" content="LeelaClue">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://leelaclue.com/assets/images/ADharma.webp">
    <meta property="og:url" content="${canon}">
    <meta property="og:type" content="website">
    <link rel="alternate" type="text/plain" title="LLM Context" href="../llms.txt">
    <link rel="icon" type="image/png" href="../assets/app_icon.png">
    <link rel="stylesheet" href="../assets/css/style.css?v=11">
    <link rel="preload" as="image" href="../assets/images/ADharma.webp">
${getSchemaOrg(lang)}
</head>

<body>
    <header>
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" class="logo-link">
                    <img src="../assets/app_icon.png" alt="LeelaClue Icon" class="logo-img">
                    <span class="brand-name">LeelaClue</span>
                </a>
            </div>

            <nav class="main-nav">
                <a href="offline-game.html" class="nav-item highlight-btn">${n.offlineGame}</a>
                <div class="nav-item has-dropdown">
                    <a href="blog.html">${n.community} <span class="dot-new"></span></a>
                    <div class="dropdown-menu">
                        <a href="blog.html">${n.blog}</a>
                        <a href="whats_new.html">${n.releaseNews}</a>
                        <a href="votes.html">${n.featureVotes}</a>
                    </div>
                </div>
                <div class="nav-item has-dropdown">
                    <a href="user_guide.html">${n.guide}</a>
                    <div class="dropdown-menu">
                        <a href="user_guide.html">${n.userGuide}</a>
                        <a href="faq.html">${n.faq}</a>
                    </div>
                </div>
            </nav>

            <div class="header-right">
                <div class="lang-switch">
                    <a href="../en/index.html" class="lang-btn${activeLang('en')}" data-lang="en">EN</a>
                    <a href="../de/index.html" class="lang-btn${activeLang('de')}" data-lang="de">DE</a>
                    <a href="../ru/index.html" class="lang-btn${activeLang('ru')}" data-lang="ru">RU</a>
                </div>
                <button class="hamburger" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>

    ${leftPanel(lang)}

    <main class="landing-main">
${sectionsHtml}
    </main>

    <footer>
        <div class="footer-links" style="margin-bottom: 1rem;">
            <a href="privacy.html">Disclaimer</a>
            <a href="privacy_policy.html">Privacy Policy</a>
            <a href="privacy_web.html">Website Privacy</a>
            <a href="impressum.html">Impressum</a>
            <a href="support.html">Support</a>
        </div>
        <p style="color: #666; font-size: 0.8rem;">&copy; 2026 LeelaClue</p>
    </footer>

    <script src="../assets/js/translations.js"></script>
    <script src="../assets/js/script.js"></script>
</body>

</html>`;
}

// ─── Build ───────────────────────────────────────────────────────────────────

function readMd(filename) {
    const filePath = path.join(root, 'assets', 'docs', filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`  WARNING: ${filename} not found`);
        return '<p><em>Content coming soon.</em></p>';
    }
    return marked.parse(fs.readFileSync(filePath, 'utf8'));
}

langs.forEach(lang => {
    const sectionsHtml = sectionDefs.map(def => {
        const html = readMd(`landing_${def.key}_${lang}.md`);
        return buildSection(def, html);
    }).join('\n');

    const output = getTemplate(lang, sectionsHtml);
    const outPath = path.join(root, lang, 'index.html');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`  Built ${lang}/index.html`);
});

// ─── llms-full.txt — aggregated English content for AI agents ────────────────

let llmsFull = `# LeelaClue — Full Content\n\nURL: https://leelaclue.com\nApp: iOS & Android | Free\n\n`;
['hero', 'sor', 'practice', 'anna', 'daily'].forEach(key => {
    const filePath = path.join(root, 'assets', 'docs', `landing_${key}_en.md`);
    if (fs.existsSync(filePath)) {
        llmsFull += fs.readFileSync(filePath, 'utf8') + '\n\n---\n\n';
    }
});

// Append user guide if available
const guideEn = path.join(root, 'new_features', 'USER_GUIDE_EN.md');
if (fs.existsSync(guideEn)) {
    llmsFull += '## User Guide\n\n' + fs.readFileSync(guideEn, 'utf8') + '\n\n---\n\n';
}

fs.writeFileSync(path.join(root, 'llms-full.txt'), llmsFull, 'utf8');
console.log('  Built llms-full.txt');
console.log('\nDone. Run: git add -A && git commit -m "build: regenerate landing pages"');
