// build_guide.js — bakes the User Guide into static HTML for each language.
//
// Source of truth: the leelaclue/helps repo (branch main), directory v201/.
// When the guide changes there, re-run:  node build_guide.js  and commit.
//
// Outputs: {en,de,ru}/user_guide.html with the full guide content server-rendered
// (previously the page fetched the markdown at runtime, which left crawlers
// with an empty "Loading instructions..." page).

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { gfmHeadingId } = require('marked-gfm-heading-id');

marked.use(gfmHeadingId());
marked.setOptions({ breaks: true, gfm: true });

const root = 'c:/GitHub/leelaclue.github.io';
const langs = ['en', 'de', 'ru'];

const GUIDE_BASE = 'https://raw.githubusercontent.com/leelaclue/helps/main/v201';
const guideFile = { en: 'USER_GUIDE_EN.md', de: 'USER_GUIDE_DE.md', ru: 'USER_GUIDE_RU.md' };

const SITE = 'https://leelaclue.com';

const KEYWORDS = {
    en: 'LeelaClue, LeelaClue app, Leela, Leela Game, Snake and Arrow, Mindfulness App, Self-Discovery App, Maya, Yoga, Vedic Game, Spirituality, Meditation App, Spiritual Diary, Daily Wisdom, Daily Guidance, Leela Chakra, Game of Self-Knowledge, Leela Clue, Game of Life, Game of Knowledge, Transformation Game, Shadow Work, Shadow Work App, Inner Work',
    de: 'LeelaClue, LeelaClue App, Leela, Leela Spiel, Schlange und Pfeil, Achtsamkeits-App, Selbsterkenntnis-App, Maya, Yoga, Vedisches Spiel, Spiritualität, Meditations-App, Spirituelles Tagebuch, Tägliche Weisheit, Tägliche Führung, Leela Chakra, Leela Clue, Spiel des Lebens, Spiel des Wissens, Transformationsspiel, Schattenarbeit, Schattenarbeit-App, Innere Arbeit',
    ru: 'LeelaClue, приложение LeelaClue, Лила, Игра Лила, Змеи и Стрелы, Приложение для осознанности, Приложение для самопознания, Майя, Йога, Ведическая игра, Духовность, Приложение для медитации, Духовный дневник, Ежедневная мудрость, Ежедневное наставление, Чакра Лила, Leela Clue, Игра Жизни, Игра Знания, Трансформационная Игра, Работа с тенью, Глубокая проработка, Теневая работа',
};

const pageTitle = {
    en: 'User Guide - LeelaClue',
    de: 'Benutzerhandbuch - LeelaClue',
    ru: 'Руководство пользователя - LeelaClue',
};
const pageHeading = {
    en: 'User Guide',
    de: 'Benutzerhandbuch',
    ru: 'Руководство пользователя',
};
const pageDesc = {
    en: 'Complete LeelaClue user guide: Daily Wisdom, the Daily Guidance ritual with the StOR spread, the Leela Guru AI companion, your Reflection Diary, and the 72-field Leela Board.',
    de: 'Vollständiges LeelaClue-Handbuch: Tägliche Weisheit, das Daily-Guidance-Ritual mit dem StOR-Spread, der Leela-Guru als KI-Begleiter, dein Reflexionstagebuch und das Leela-Feld.',
    ru: 'Полное руководство LeelaClue: Мудрость дня, ритуал ежедневного расклада, ИИ-помощник Гуру Лилы, дневник размышлений и поле Лилы из 72 клеток.',
};

function navLabels(lang) {
    const labels = {
        en: { offlineGame: 'Offline Game', community: 'Community', blog: 'Blog', releaseNews: 'Release News', featureVotes: 'Feature Votes', guide: 'Guide', userGuide: 'User Guide', faq: 'FAQ' },
        de: { offlineGame: 'Offline-Spiel', community: 'Community', blog: 'Blog', releaseNews: 'Release-News', featureVotes: 'Feature-Abstimmung', guide: 'Anleitung', userGuide: 'Benutzerhandbuch', faq: 'FAQ' },
        ru: { offlineGame: 'Офлайн-игра', community: 'Сообщество', blog: 'Блог', releaseNews: 'Новости обновлений', featureVotes: 'Голосование', guide: 'Руководство', userGuide: 'Руководство пользователя', faq: 'FAQ' },
    };
    return labels[lang] || labels.en;
}

function attrEscape(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function techArticleSchema(lang) {
    const url = `${SITE}/${lang}/user_guide.html`;
    const data = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: pageHeading[lang] + ' — LeelaClue',
        description: pageDesc[lang],
        url: url,
        inLanguage: lang,
        author: { '@type': 'Person', name: 'Irene Engelko' },
        publisher: {
            '@type': 'Organization',
            name: 'LeelaClue',
            url: SITE,
            logo: { '@type': 'ImageObject', url: `${SITE}/assets/app_icon.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
    return `    <script type="application/ld+json">
    ${JSON.stringify(data, null, 2).split('\n').join('\n    ')}
    </script>`;
}

function hreflangTags() {
    return langs.map(l =>
        `    <link rel="alternate" hreflang="${l}" href="${SITE}/${l}/user_guide.html" />`
    ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/en/user_guide.html" />`;
}

function getTemplate(lang, contentHtml) {
    const n = navLabels(lang);
    const activeLang = (l) => l === lang ? ' active' : '';

    return `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="${SITE}/${lang}/user_guide.html" />
    <title>${pageTitle[lang]}</title>
    <meta name="description" content="${attrEscape(pageDesc[lang])}">
    <meta name="keywords" content="${KEYWORDS[lang]}">
    <link rel="icon" type="image/png" href="../assets/app_icon_small.png">
    <link rel="stylesheet" href="../assets/css/style.css?v=13">

    <!-- Hreflang Tags -->
${hreflangTags()}
${techArticleSchema(lang)}
</head>

<body>
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
                        <a href="faq.html">${n.faq}</a>
                    </div>
                </div>
            </nav>
            <div class="header-right">
                <div class="lang-switch">
                    <a href="../en/user_guide.html" class="lang-btn${activeLang('en')}">EN</a>
                    <a href="../de/user_guide.html" class="lang-btn${activeLang('de')}">DE</a>
                    <a href="../ru/user_guide.html" class="lang-btn${activeLang('ru')}">RU</a>
                </div>
            </div>
        </div>
    </header>
    <main>
        <h1>${pageHeading[lang]}</h1>
        <div id="guide-content" class="markdown-body">
${contentHtml}
        </div>
    </main>
    <footer>
        <div class="footer-links" style="margin-bottom: 1rem;">
            <a href="privacy.html" data-i18n="disclaimerTitle">Disclaimer</a>
            <a href="privacy_policy.html" data-i18n="privacyPolicyTitle">Privacy Policy</a>
            <a href="terms_of_use.html" data-i18n="termsOfUseTitle">Terms of Use</a>
            <a href="privacy_web.html" data-i18n="webPrivacyTitle">Website Privacy</a>
            <a href="impressum.html" data-i18n="impressumTitle">Impressum</a>
            <a href="support.html" data-i18n="contactTitle">Support</a>
        </div>
        <p style="color: #666; font-size: 0.8rem;">&copy; 2026 LeelaClue</p>
    </footer>
    <script src="../assets/js/translations.js"></script>
    <script src="../assets/js/script.js"></script>
</body>

</html>`;
}

async function main() {
    for (const lang of langs) {
        const url = `${GUIDE_BASE}/${guideFile[lang]}`;
        console.log(`Fetching ${url} ...`);
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`ERROR: ${url} returned HTTP ${res.status}. Aborting — existing pages left untouched.`);
            process.exit(1);
        }
        const md = await res.text();
        if (md.trim().length < 500) {
            console.error(`ERROR: ${url} content suspiciously short (${md.length} chars). Aborting.`);
            process.exit(1);
        }
        const contentHtml = marked.parse(md);
        const outPath = path.join(root, lang, 'user_guide.html');
        fs.writeFileSync(outPath, getTemplate(lang, contentHtml), 'utf8');
        // Refresh the local markdown copy — build_html.js reads it for llms-full.txt
        fs.writeFileSync(path.join(root, 'new_features', guideFile[lang]), md, 'utf8');
        console.log(`  Built ${lang}/user_guide.html (${Math.round(md.length / 1024)} KB markdown)`);
    }
    console.log('\nDone.');
}

main();
