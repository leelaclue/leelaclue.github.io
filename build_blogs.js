// build_blogs.js — generates static blog post pages AND the blog index page
// for each language (en/de/ru).
//
// To add a new blog post:
//   1. Add its content file:  assets/posts/<id>_<lang>.js  (window.blogContent['<id>'] = `...html...`;)
//   2. Add its title:         assets/js/translations.js    (key: blog_post_N_title, per language)
//   3. Add its metadata:      assets/js/blog.js            (blogPosts array, newest first)
//   4. Run: node build_blogs.js
//   5. Add the new post URLs to sitemap.xml
//
// Outputs: {lang}/<id>.html for every post, and {lang}/blog.html (the blog index).

const fs = require('fs');
const path = require('path');

// 1. Read translations
const translationsContent = fs.readFileSync('assets/js/translations.js', 'utf8');
const translationsMatch = translationsContent.match(/const translations = (\{[\s\S]*?\});/);
const translations = eval('(' + translationsMatch[1] + ')');

// 2. Read blog posts metadata (newest first)
const blogJsContent = fs.readFileSync('assets/js/blog.js', 'utf8');
const blogPostsMatch = blogJsContent.match(/const blogPosts = (\[[\s\S]*?\]);/);
const blogPosts = eval('(' + blogPostsMatch[1] + ')');

const langs = ['en', 'de', 'ru'];

const SITE = 'https://leelaclue.com';
const OG_IMAGE = `${SITE}/assets/images/ADharma.webp`;
const LOGO_FULL = `${SITE}/assets/app_icon.png`;

const KEYWORDS = {
    en: 'LeelaClue, LeelaClue app, Leela, Leela Game, Snake and Arrow, Mindfulness App, Self-Discovery App, Maya, Yoga, Vedic Game, Spirituality, Meditation App, Spiritual Diary, Daily Wisdom, Daily Guidance, Leela Chakra, Game of Self-Knowledge, Leela Clue, Game of Life, Game of Knowledge, Transformation Game, Shadow Work, Shadow Work App, Inner Work',
    de: 'LeelaClue, LeelaClue App, Leela, Leela Spiel, Schlange und Pfeil, Achtsamkeits-App, Selbsterkenntnis-App, Maya, Yoga, Vedisches Spiel, Spiritualität, Meditations-App, Spirituelles Tagebuch, Tägliche Weisheit, Tägliche Führung, Leela Chakra, Leela Clue, Spiel des Lebens, Spiel des Wissens, Transformationsspiel, Schattenarbeit, Schattenarbeit-App, Innere Arbeit',
    ru: 'LeelaClue, приложение LeelaClue, Лила, Игра Лила, Змеи и Стрелы, Приложение для осознанности, Приложение для самопознания, Майя, Йога, Ведическая игра, Духовность, Приложение для медитации, Духовный дневник, Ежедневная мудрость, Ежедневное наставление, Чакра Лила, Leela Clue, Игра Жизни, Игра Знания, Трансформационная Игра, Работа с тенью, Глубокая проработка, Теневая работа',
};

const AUTHOR_NAME = 'Irene Engelko';
const bylineText = {
    en: 'By Irene Engelko — Leela Facilitator &amp; Founder',
    de: 'Von Irene Engelko — Leela-Facilitatorin &amp; Gründerin',
    ru: 'Автор: Irene Engelko — фасилитатор игры Лила и основатель LeelaClue',
};
const authorJobTitle = {
    en: 'Leela Facilitator & Founder',
    de: 'Leela-Facilitatorin & Gründerin',
    ru: 'Фасилитатор игры Лила, основатель LeelaClue',
};

const indexTitle = {
    en: 'Blog — LeelaClue | Leela, Shadow Work &amp; Self-Discovery',
    de: 'Blog — LeelaClue | Leela, Schattenarbeit &amp; Selbsterkenntnis',
    ru: 'Блог — LeelaClue | Лила, работа с тенью и самопознание',
};
const indexDesc = {
    en: 'Articles on the Game of Leela, shadow work, and self-discovery from the LeelaClue team: case studies, methodology, and real readings.',
    de: 'Artikel über das Leela-Spiel, Schattenarbeit und Selbsterkenntnis vom LeelaClue-Team: Fallstudien, Methodik und echte Legungen.',
    ru: 'Статьи об игре Лила, работе с тенью и самопознании от команды LeelaClue: примеры, методология и реальные расклады.',
};
const indexHeading = { en: 'Blog', de: 'Blog', ru: 'Блог' };
const readMoreLabel = { en: 'Read more →', de: 'Weiterlesen →', ru: 'Читать далее →' };

// ─── Nav labels per language (matches build_html.js) ────────────────────────
function navLabels(lang) {
    const labels = {
        en: { offlineGame: 'Offline Game', community: 'Community', blog: 'Blog', releaseNews: 'Release News', featureVotes: 'Feature Votes', guide: 'Guide', userGuide: 'User Guide', faq: 'FAQ' },
        de: { offlineGame: 'Offline-Spiel', community: 'Community', blog: 'Blog', releaseNews: 'Release-News', featureVotes: 'Feature-Abstimmung', guide: 'Anleitung', userGuide: 'Benutzerhandbuch', faq: 'FAQ' },
        ru: { offlineGame: 'Офлайн-игра', community: 'Сообщество', blog: 'Блог', releaseNews: 'Новости обновлений', featureVotes: 'Голосование', guide: 'Руководство', userGuide: 'Руководство пользователя', faq: 'FAQ' },
    };
    return labels[lang] || labels.en;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Plain text from HTML (for meta descriptions / excerpts)
function htmlToText(html) {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// First paragraph of a post as plain text, truncated at a word boundary
function makeExcerpt(contentHtml, maxLen) {
    const m = contentHtml.match(/<p>([\s\S]*?)<\/p>/);
    let text = htmlToText(m ? m[1] : contentHtml);
    if (text.length > maxLen) {
        text = text.slice(0, maxLen);
        const cut = text.lastIndexOf(' ');
        if (cut > 60) text = text.slice(0, cut);
        text += '…';
    }
    return text;
}

function attrEscape(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hreflangTags(pageFile) {
    return langs.map(l =>
        `    <link rel="alternate" hreflang="${l}" href="${SITE}/${l}/${pageFile}" />`
    ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/en/${pageFile}" />`;
}

// ─── Page shell (header/footer shared by posts and index) ───────────────────

function pageShell({ lang, pageFile, title, description, headExtra, mainHtml }) {
    const n = navLabels(lang);
    const activeLang = (l) => l === lang ? ' active' : '';
    const canon = `${SITE}/${lang}/${pageFile}`;

    return `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="canonical" href="${canon}" />
    <meta name="description" content="${attrEscape(description)}">
    <meta name="keywords" content="${KEYWORDS[lang]}">
    <link rel="icon" type="image/png" href="../assets/app_icon_small.png">
    <link rel="stylesheet" href="../assets/css/style.css?v=13">

    <!-- Hreflang Tags -->
${hreflangTags(pageFile)}
${headExtra}
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
                    <a href="../en/${pageFile}" class="lang-btn${activeLang('en')}">EN</a>
                    <a href="../de/${pageFile}" class="lang-btn${activeLang('de')}">DE</a>
                    <a href="../ru/${pageFile}" class="lang-btn${activeLang('ru')}">RU</a>
                </div>
            </div>
        </div>
    </header>
    <main class="blog-container">
${mainHtml}
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

function sidebarHtml(lang, activePostId) {
    const links = blogPosts.map(post => {
        const title = translations[lang][post.titleKey];
        const isActive = post.id === activePostId ? ' class="active"' : '';
        return `<li><a href="${post.id}.html"${isActive}>${title}</a></li>`;
    }).join('\n');
    return `        <aside class="blog-sidebar">
            <h2 data-i18n="blogTitle">${indexHeading[lang]}</h2>
            <ul id="blog-sidebar-list">
${links}
</ul>
        </aside>`;
}

// ─── Structured data ─────────────────────────────────────────────────────────

function blogPostingSchema(lang, post, title, description) {
    const url = `${SITE}/${lang}/${post.id}.html`;
    const data = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description,
        url: url,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: lang,
        author: {
            '@type': 'Person',
            name: AUTHOR_NAME,
            jobTitle: authorJobTitle[lang],
            url: `${SITE}/${lang}/how-leelaclue-was-born.html`,
        },
        publisher: {
            '@type': 'Organization',
            name: 'LeelaClue',
            url: SITE,
            logo: { '@type': 'ImageObject', url: LOGO_FULL },
        },
        image: OG_IMAGE,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
    return `    <script type="application/ld+json">
    ${JSON.stringify(data, null, 2).split('\n').join('\n    ')}
    </script>`;
}

function ogTags(lang, pageFile, title, description, type) {
    return `    <meta property="og:site_name" content="LeelaClue">
    <meta property="og:title" content="${attrEscape(title)}">
    <meta property="og:description" content="${attrEscape(description)}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:url" content="${SITE}/${lang}/${pageFile}">
    <meta property="og:type" content="${type}">`;
}

// ─── Read post content ───────────────────────────────────────────────────────

function readPostContent(postId, lang) {
    const tryRead = (l) => {
        const p = path.join('assets', 'posts', `${postId}_${l}.js`);
        if (!fs.existsSync(p)) return null;
        const m = fs.readFileSync(p, 'utf8').match(/window\.blogContent\['[^']+'\] = `([\s\S]*?)`;/);
        return m ? m[1] : null;
    };
    return tryRead(lang) || (lang !== 'en' ? tryRead('en') : null) || '';
}

// ─── Generate post pages ─────────────────────────────────────────────────────

for (const lang of langs) {
    for (const post of blogPosts) {
        const contentHtml = readPostContent(post.id, lang);
        if (!contentHtml) {
            console.warn(`  WARNING: no content for ${post.id} (${lang})`);
            continue;
        }
        const postTitle = translations[lang][post.titleKey];
        const plainTitle = htmlToText(postTitle);
        const description = makeExcerpt(contentHtml, 155);
        const pageFile = `${post.id}.html`;

        const headExtra = ogTags(lang, pageFile, plainTitle, description, 'article') + '\n'
            + blogPostingSchema(lang, post, plainTitle, description);

        const mainHtml = `${sidebarHtml(lang, post.id)}
        <article class="blog-post content-card">
            <h1 id="blog-post-title">${postTitle}</h1>
            <div class="blog-byline">${bylineText[lang]}</div>
            <div id="blog-post-date" class="blog-date"><time datetime="${post.date}">${post.date}</time></div>
            <div id="blog-post-content" class="markdown-body">
${contentHtml}
            </div>
        </article>`;

        const html = pageShell({
            lang,
            pageFile,
            title: `${postTitle} - LeelaClue Blog`,
            description,
            headExtra,
            mainHtml,
        });

        fs.writeFileSync(path.join(lang, pageFile), html, 'utf8');
        console.log(`Generated ${lang}/${pageFile}`);
    }
}

// ─── Generate blog index (blog.html) ─────────────────────────────────────────

for (const lang of langs) {
    const items = blogPosts.map(post => {
        const contentHtml = readPostContent(post.id, lang);
        const title = translations[lang][post.titleKey];
        const excerpt = makeExcerpt(contentHtml, 220);
        return `            <article class="blog-index-item content-card" style="margin-bottom: 1.5rem;">
                <h2 style="margin-top: 0;"><a href="${post.id}.html">${title}</a></h2>
                <div class="blog-date"><time datetime="${post.date}">${post.date}</time></div>
                <p>${attrEscape(excerpt)}</p>
                <a href="${post.id}.html">${readMoreLabel[lang]}</a>
            </article>`;
    }).join('\n');

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: htmlToText(indexTitle[lang]),
        description: indexDesc[lang],
        url: `${SITE}/${lang}/blog.html`,
        inLanguage: lang,
        author: { '@type': 'Person', name: AUTHOR_NAME, jobTitle: authorJobTitle[lang] },
        publisher: {
            '@type': 'Organization',
            name: 'LeelaClue',
            url: SITE,
            logo: { '@type': 'ImageObject', url: LOGO_FULL },
        },
        blogPost: blogPosts.map(post => ({
            '@type': 'BlogPosting',
            headline: htmlToText(translations[lang][post.titleKey]),
            url: `${SITE}/${lang}/${post.id}.html`,
            datePublished: post.date,
        })),
    };
    const headExtra = ogTags(lang, 'blog.html', htmlToText(indexTitle[lang]), indexDesc[lang], 'website') + `
    <script type="application/ld+json">
    ${JSON.stringify(blogSchema, null, 2).split('\n').join('\n    ')}
    </script>`;

    const mainHtml = `${sidebarHtml(lang, null)}
        <div class="blog-post">
            <h1>${indexHeading[lang]}</h1>
            <div class="blog-byline" style="margin-bottom: 1.5rem;">${bylineText[lang]}</div>
${items}
        </div>`;

    const html = pageShell({
        lang,
        pageFile: 'blog.html',
        title: indexTitle[lang],
        description: indexDesc[lang],
        headExtra,
        mainHtml,
    });

    fs.writeFileSync(path.join(lang, 'blog.html'), html, 'utf8');
    console.log(`Generated ${lang}/blog.html (index)`);
}

console.log('\nDone. Remember: new posts must also be added to sitemap.xml');
