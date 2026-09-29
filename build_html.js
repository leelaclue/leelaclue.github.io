const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { gfmHeadingId } = require('marked-gfm-heading-id');

marked.use(gfmHeadingId());
marked.setOptions({ breaks: true, gfm: true });

const root = 'c:/GitHub/leelaclue.github.io';
const langs = ['en', 'de', 'ru'];

// ─── Section medallions ──────────────────────────────────────────────────────
//
// Sections 2–5 each show one round icon from the app, tinted with the colour
// the app's home carousel uses for it (lib/screens/home_screen.dart), applied
// the same way (Flutter BlendMode.color ≈ CSS mix-blend-mode: color).
// Image: assets/images/sections/<key>.webp.
// tint: 'cycle' animates through all seven chakra colours (see style.css).

const sectionDefs = [
    { key: 'hero',     id: 'section-hero',     extraClass: ' hero-section', isHero: true },
    { key: 'sor',      id: 'section-sor',       extraClass: ' alt-bg', tint: '#FFAB40' }, // Colors.orangeAccent
    { key: 'practice', id: 'section-practice',  extraClass: '',        tint: '#448AFF' }, // Colors.blueAccent (its colour when it was on the app carousel)
    { key: 'anna',     id: 'section-anna',      extraClass: ' alt-bg', tint: '#FFD700' }, // gold
    { key: 'daily',    id: 'section-daily',     extraClass: '',        tint: '#E040FB' }, // Colors.purpleAccent — Leela Field icon
];

const MEDALLION_ALT = {
    en: {
        sor:      'Three LeelaClue question cards — State, Obstacle, Resource',
        practice: 'Lotus mandala — active practices in LeelaClue',
        anna:     'Meditating Buddha — the Dakshina gratitude ritual in LeelaClue',
        daily:    'The Leela Field — arrow and snake in the LeelaClue app',
    },
    de: {
        sor:      'Drei LeelaClue-Fragekarten — State, Obstacle, Resource',
        practice: 'Lotus-Mandala — aktive Praktiken in LeelaClue',
        anna:     'Meditierender Buddha — das Dakshina-Dankbarkeitsritual in LeelaClue',
        daily:    'Das Leela-Feld — Pfeil und Schlange in der LeelaClue-App',
    },
    ru: {
        sor:      'Три карты-вопроса LeelaClue — Состояние, Препятствие, Ресурс',
        practice: 'Мандала лотоса — активные практики в LeelaClue',
        anna:     'Медитирующий Будда — ритуал благодарности Дакшина в LeelaClue',
        daily:    'Поле Лилы — стрела и змея в приложении LeelaClue',
    },
};

// ─── Store badges ────────────────────────────────────────────────────────────

// App store ratings — cached by build_ratings.js (run it first to refresh)
let ratings = null;
const ratingsPath = path.join(root, 'assets', 'data', 'ratings.json');
if (fs.existsSync(ratingsPath)) {
    ratings = JSON.parse(fs.readFileSync(ratingsPath, 'utf8'));
} else {
    console.warn('  WARNING: assets/data/ratings.json missing — run `node build_ratings.js`. Building without aggregateRating.');
}

// "21 ratings" with correct plural per language
function ratingCountLabel(lang, n) {
    if (lang === 'de') return n === 1 ? `${n} Bewertung` : `${n} Bewertungen`;
    if (lang === 'ru') {
        const m10 = n % 10, m100 = n % 100;
        const word = (m10 === 1 && m100 !== 11) ? 'оценка'
            : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? 'оценки'
            : 'оценок';
        return `${n} ${word}`;
    }
    return n === 1 ? `${n} rating` : `${n} ratings`;
}

function ratingBadge(lang) {
    if (!ratings) return '';
    const value = (lang === 'de' || lang === 'ru')
        ? ratings.value.toFixed(1).replace('.', ',')
        : ratings.value.toFixed(1);
    const src = { en: 'on the App Store &amp; Google Play', de: 'im App Store &amp; bei Google Play', ru: 'в App Store и Google Play' }[lang];
    return `
                        <div class="store-rating">★ ${value} · ${ratingCountLabel(lang, ratings.count)} ${src}</div>`;
}

const IOS_URL    = 'https://apps.apple.com/us/app/leelaclue-mindfulness/id6757707003';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.ikaengel.leelaclue';
const IOS_BADGE  = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
const GP_BADGE   = 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

function storeBadges(eager, extra) {
    const la = eager ? '' : ' loading="lazy"';
    return `<div class="carousel-cta">
                        <a href="${IOS_URL}" target="_blank" rel="noopener">
                            <img alt="Download on the App Store" src="${IOS_BADGE}" class="store-badge-sm"${la}>
                        </a>
                        <a href="${ANDROID_URL}" target="_blank" rel="noopener">
                            <img alt="Get it on Google Play" src="${GP_BADGE}" class="store-badge-sm google"${la}>
                        </a>${extra || ''}
                    </div>`;
}

// ─── Medallion HTML ──────────────────────────────────────────────────────────

function buildMedallion(def, lang) {
    const cycle = def.tint === 'cycle';
    const cls   = cycle ? 'medallion medallion--cycle' : 'medallion';
    const style = cycle ? '' : ` style="--tint: ${def.tint}"`;
    return `<div class="medallion-wrapper">
                    ${storeBadges(false)}
                    <figure class="${cls}"${style}>
                        <div class="medallion__disc">
                            <img src="../assets/images/sections/${def.key}.webp" alt="${MEDALLION_ALT[lang][def.key]}" width="960" height="960" loading="lazy">
                        </div>
                    </figure>
                </div>`;
}

// ─── Landing section HTML ────────────────────────────────────────────────────

function buildSection(def, markdownHtml, lang) {
    return `
        <section class="landing-section${def.extraClass}" id="${def.id}">
            <div class="section-container">
                <div class="animate-on-scroll">
                    ${buildMedallion(def, lang)}
                </div>
                <div class="section-text markdown-body animate-on-scroll delay-1">
                    ${markdownHtml}
                </div>
            </div>
        </section>`;
}

// ─── Hero (section 1) ────────────────────────────────────────────────────────
// Full-bleed hero: two-line H1 + store badges on the left, face image on the
// right. The rest of the hero MD (from the first <h2>) becomes the About block.

const HERO_IMG      = '../assets/images/hero/hero_face.webp';
const HERO_IMG_SM   = '../assets/images/hero/hero_face_1000.webp';
const HERO_SRCSET   = `${HERO_IMG_SM} 1000w, ${HERO_IMG} 2752w`;
const HERO_SIZES    = '(max-width: 950px) 100vw, 65vw';

function heroAlt(lang) {
    return {
        en: 'Clay face cracking open to reveal a golden inner light',
        de: 'Ein Gesicht aus Ton bricht auf und gibt ein goldenes inneres Licht frei',
        ru: 'Глиняное лицо раскалывается, открывая золотой внутренний свет',
    }[lang];
}

// News rows shown between the hero headline and the store badges (latest release + latest blog post).
// Update these when announcing a new version or post.
function heroNews(lang) {
    const items = {
        en: [
            { tag: 'v2.1.0',       cls: 'hero-news__tag--version', href: 'whats_new.html',         text: 'The Leela Field now breathes' },
            { tag: 'New post',     cls: 'hero-news__tag--post',    href: 'the-stor-framework.html', text: 'Your intuition has the answer' },
        ],
        de: [
            { tag: 'v2.1.0',       cls: 'hero-news__tag--version', href: 'whats_new.html',         text: 'Das Leela-Feld atmet jetzt' },
            { tag: 'Neuer Beitrag', cls: 'hero-news__tag--post',   href: 'the-stor-framework.html', text: 'Deine Intuition kennt die Antwort' },
        ],
        ru: [
            { tag: 'v2.1.0',       cls: 'hero-news__tag--version', href: 'whats_new.html',         text: 'Поле Лилы теперь дышит' },
            { tag: 'Новая статья', cls: 'hero-news__tag--post',    href: 'the-stor-framework.html', text: 'Твоя интуиция знает ответ' },
        ],
    }[lang];

    const rows = items.map(it => `
                    <a href="${it.href}" class="hero-news__item">
                        <span class="hero-news__tag ${it.cls}">${it.tag}</span>
                        <span class="hero-news__text">${it.text}</span>
                        <span class="hero-news__arrow" aria-hidden="true">&rarr;</span>
                    </a>`).join('');

    return `<div class="hero-news">${rows}
                </div>`;
}

// Wrap every visual line of the H1 (split at <br>) in <span class="hl"> so CSS
// can reveal them one after another. The space between spans keeps the words
// separated in the text that crawlers extract.
function splitHeroLines(h1Html) {
    const m = h1Html.match(/<h1([^>]*)>([\s\S]*?)<span class="hero-line2">([\s\S]*?)<\/span>\s*<\/h1>/);
    if (!m) return h1Html;
    let i = 0;
    const lines = part => part.trim().split(/<br\s*\/?>/)
        .map(l => `<span class="hl" style="--d:${i++}">${l.trim()}</span>`).join(' ');
    const line1 = lines(m[2]);
    const line2 = lines(m[3]);
    return `<h1><span class="hero-line1">${line1}</span> <span class="hero-line2">${line2}</span></h1>\n`;
}

function buildHero(def, markdownHtml, lang) {
    const splitAt = markdownHtml.indexOf('<h2');
    const headline = splitHeroLines(splitAt === -1 ? markdownHtml : markdownHtml.slice(0, splitAt));
    const about    = splitAt === -1 ? '' : markdownHtml.slice(splitAt);

    return `
        <section class="landing-section hero-v2" id="${def.id}">
            <div class="hero-v2__media">
                <img src="${HERO_IMG}" srcset="${HERO_SRCSET}" sizes="${HERO_SIZES}" alt="${heroAlt(lang)}" fetchpriority="high" width="2752" height="1536">
            </div>
            <div class="hero-v2__text">
                ${headline}
                ${heroNews(lang)}
                ${storeBadges(true, ratingBadge(lang))}
                <a href="#section-hero-about" class="hero-v2__scroll" aria-label="Scroll down">&#8595;</a>
            </div>
        </section>
        <section class="landing-section hero-about" id="section-hero-about">
            <div class="section-text markdown-body animate-on-scroll">
                ${about}
            </div>
        </section>`;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

function getTitle(lang) {
    if (lang === 'de') return 'LeelaClue — Achtsamkeit, Schattenarbeit &amp; Selbsterkenntnis-App | iOS &amp; Android';
    if (lang === 'ru') return 'LeelaClue — осознанность, работа с тенью и самопознание | iOS и Android';
    return 'LeelaClue — Mindfulness, Shadow Work &amp; Self-Discovery App | iOS &amp; Android';
}

function getDescription(lang) {
    if (lang === 'de') return 'LeelaClue ist eine kostenlose App für Achtsamkeit, Schattenarbeit und Selbsterkenntnis, inspiriert vom antiken Leela-Spiel. Täglicher S·O·R-Spread, Reflexionstagebuch und 72 einzigartige Karten. Kostenlos für iOS &amp; Android.';
    if (lang === 'ru') return 'LeelaClue — бесплатное приложение для осознанности, работы с тенью и глубокой проработки, вдохновлённое древней игрой Лила. Ежедневный расклад С·П·Р, Дневник размышлений и 72 карты. Бесплатно для iOS и Android.';
    return 'LeelaClue is a free mindfulness, shadow work and self-discovery app inspired by the ancient Indian game of Leela. Daily S·O·R Guidance Spread, Reflection Diary, and 72 unique Leela cards. Free for iOS &amp; Android.';
}

function getHreflang(pageName) {
    // Homepages must use the trailing-slash form to match their canonical
    // (https://leelaclue.com/en/), not /en/index.html.
    const href = (l) => pageName === 'index'
        ? `https://leelaclue.com/${l}/`
        : `https://leelaclue.com/${l}/${pageName}.html`;
    return langs.map(l =>
        `    <link rel="alternate" hreflang="${l}" href="${href(l)}">`
    ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${href('en')}">`;
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
      "softwareVersion": "2.1.0",
      "inLanguage": ["en", "de", "ru"],
      "downloadUrl": [
        "${IOS_URL}",
        "${ANDROID_URL}"
      ],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },${ratings ? `
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "${ratings.value.toFixed(1)}", "ratingCount": "${ratings.count}", "bestRating": "${ratings.bestRating}" },` : ''}
      "author": { "@type": "Organization", "name": "LeelaClue", "url": "https://leelaclue.com" },
      "image": "https://leelaclue.com/assets/app_icon.png",
      "screenshot": "https://leelaclue.com/assets/images/ADharma.webp",
      "description": "LeelaClue is a free mindfulness, shadow work and self-discovery mobile app inspired by the ancient Indian game of Leela. Features Daily Wisdom rituals, a meditative 3-Card S·O·R Guidance Spread, a Personal Reflection Diary, and 72 unique cards representing states of consciousness."
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
        en: { offlineGame: 'Offline Game', community: 'Community', blog: 'Blog', releaseNews: 'Release News', featureVotes: 'Feature Votes', guide: 'Guide', userGuide: 'User Guide', squares: '72 Squares of Leela', faq: 'FAQ' },
        de: { offlineGame: 'Offline-Spiel', community: 'Community', blog: 'Blog', releaseNews: 'Release-News', featureVotes: 'Feature-Abstimmung', guide: 'Anleitung', userGuide: 'Benutzerhandbuch', squares: '72 Felder der Leela', faq: 'FAQ' },
        ru: { offlineGame: 'Офлайн-игра', community: 'Сообщество', blog: 'Блог', releaseNews: 'Новости обновлений', featureVotes: 'Голосование', guide: 'Руководство', userGuide: 'Руководство пользователя', squares: '72 клетки Лилы', faq: 'FAQ' },
    };
    return labels[lang] || labels.en;
}

function leftPanel(lang) {
    const labels = {
        en: ['About',      'S·O·R',  'Practice', 'Case Study', 'App'],
        de: ['Über',       'S·O·R',  'Praxis',   'Fallstudie', 'App'],
        ru: ['О нас',      'С·П·Р',  'Практика', 'Пример',     'Приложение'],
    }[lang] || ['About', 'S·O·R', 'Practice', 'Case Study', 'App'];

    const dots = sectionDefs.map((def, i) => `
        <a href="#${def.id}" class="section-nav-item${i === 0 ? ' active' : ''}" data-section="${def.id}">
            <span class="section-nav-dot"></span>
            <span class="section-nav-label">${labels[i]}</span>
        </a>`).join('');

    return `
    <aside class="left-panel">
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
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="stylesheet" href="../assets/css/style.css?v=19">
    <link rel="preload" as="image" href="${HERO_IMG}" imagesrcset="${HERO_SRCSET}" imagesizes="${HERO_SIZES}" fetchpriority="high">
${getSchemaOrg(lang)}
</head>

<body class="hero-in-view">
    <header>
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" class="logo-link">
                    <img src="../assets/app_icon_small.png" alt="LeelaClue Icon" class="logo-img">
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
                        <a href="leela-72-squares.html">${n.squares}</a>
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
            <a href="terms_of_use.html">Terms of Use</a>
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
        return def.isHero ? buildHero(def, html, lang) : buildSection(def, html, lang);
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
        llmsFull += fs.readFileSync(filePath, 'utf8').replace(/<span class="hero-line2">(.*?)<\/span>/g, '— $1').replace(/<br>/g, ' ') + '\n\n---\n\n';
    }
});

// Append user guide if available
const guideEn = path.join(root, 'new_features', 'USER_GUIDE_EN.md');
if (fs.existsSync(guideEn)) {
    llmsFull += '## User Guide\n\n' + fs.readFileSync(guideEn, 'utf8') + '\n\n---\n\n';
}

// Append 72 Squares of Leela overview if available
const cardsEnPath = path.join('c:/GitHub/leelaclue', 'assets', 'cards_en.json');
if (fs.existsSync(cardsEnPath)) {
    const cardsEn = JSON.parse(fs.readFileSync(cardsEnPath, 'utf8'));
    llmsFull += '## The 72 Squares of Leela (Map of Consciousness)\n\n';
    llmsFull += 'URL: https://leelaclue.com/en/leela-72-squares.html\n\n';
    cardsEn.forEach(c => {
        llmsFull += `### Square ${c.id}: ${c.title}\n${c.description}\n\n`;
    });
    llmsFull += '---\n\n';
}

fs.writeFileSync(path.join(root, 'llms-full.txt'), llmsFull, 'utf8');
console.log('  Built llms-full.txt');
console.log('\nDone. Run: git add -A && git commit -m "build: regenerate landing pages"');
