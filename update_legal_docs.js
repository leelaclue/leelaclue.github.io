const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { gfmHeadingId } = require('marked-gfm-heading-id');

marked.use(gfmHeadingId());
marked.setOptions({ breaks: true, gfm: true });

const rootDir = __dirname;
const srcDir = 'C:/GitHub/leelaclue/lib/l10n/messages';
const langs = ['en', 'de', 'ru'];

// Localized fallback text (data-i18n overrides at runtime).
const termsText = {
    en: 'Terms of Use',
    de: 'Nutzungsbedingungen',
    ru: 'Условия использования'
};

const fileMap = {
    'privacy_policy': 'privacy_policy', // HTML: privacy_policy.html, MD: privacy_policy_*.md
    'privacy': 'disclaimer', // HTML: privacy.html, MD: disclaimer_*.md
    'impressum': 'impressum', // HTML: impressum.html, MD: impressum_*.md
    'support': 'contact' // HTML: support.html, MD: contact_*.md
};

function processHtml(lang, htmlFileName, mdFileName) {
    const mdPath = path.join(srcDir, `${mdFileName}_${lang}.md`);
    if (!fs.existsSync(mdPath)) {
        console.log(`Skipping ${mdPath} - not found`);
        return;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    let htmlContent = marked.parse(mdContent);

    // Special logic for privacy_policy to deep link §7
    if (htmlFileName === 'privacy_policy') {
        // Find <h2> starting with 7. and give it id="deletion"
        htmlContent = htmlContent.replace(/<h2[^>]*>(7\.\s+.*?)<\/h2>/, '<h2 id="deletion">$1</h2>');
    }

    const targetHtmlPath = path.join(rootDir, lang, `${htmlFileName}.html`);
    if (!fs.existsSync(targetHtmlPath)) {
        console.log(`Target HTML not found: ${targetHtmlPath}`);
        return;
    }

    let targetHtmlContent = fs.readFileSync(targetHtmlPath, 'utf8');

    // Replace everything inside <div class="content-card markdown-body"> ... </div>
    const regex = /(<div class="content-card markdown-body">)[\s\S]*?(<\/div>\s*<\/main>)/;
    targetHtmlContent = targetHtmlContent.replace(regex, `$1\n            ${htmlContent}\n        $2`);

    fs.writeFileSync(targetHtmlPath, targetHtmlContent, 'utf8');
    console.log(`Updated ${targetHtmlPath}`);
}

function createTermsOfUse(lang) {
    const mdPath = path.join(srcDir, `terms_of_use_${lang}.md`);
    if (!fs.existsSync(mdPath)) return;

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    let htmlContent = marked.parse(mdContent);

    // Drop the leading <h1> from the Markdown so it doesn't duplicate the page <h1>.
    htmlContent = htmlContent.replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/, '');

    // Use privacy.html (Disclaimer) as template
    const templatePath = path.join(rootDir, lang, `privacy.html`);
    let templateHtml = fs.readFileSync(templatePath, 'utf8');

    // Repoint self-referential URLs only (canonical, hreflang, language switcher).
    // These always carry a leading slash, so the footer's href="privacy.html"
    // (the Disclaimer link) is intentionally left untouched.
    templateHtml = templateHtml.replace(/\/privacy\.html/g, '/terms_of_use.html');

    // Title + page heading
    templateHtml = templateHtml.replace(/<title data-i18n="[^"]*">.*?<\/title>/, `<title data-i18n="termsOfUseTitle">${termsText[lang]}</title>`);
    templateHtml = templateHtml.replace(/<h1 data-i18n="[^"]*">.*?<\/h1>/, `<h1 data-i18n="termsOfUseTitle">${termsText[lang]}</h1>`);

    // The template is the Disclaimer page, so its footer link is marked active — clear it.
    templateHtml = templateHtml.replace(/<a href="privacy\.html" class="active" (data-i18n="disclaimerTitle">)/, '<a href="privacy.html" $1');

    // Remove any existing Terms of Use footer link (idempotent), then add an active one
    // right after the Privacy Policy footer link.
    templateHtml = templateHtml.replace(/\s*<a href="terms_of_use\.html"[^>]*data-i18n="termsOfUseTitle">[^<]*<\/a>/g, '');
    templateHtml = templateHtml.replace(
        /(<a href="privacy_policy\.html" data-i18n="privacyPolicyTitle">[^<]*<\/a>)/,
        `$1\n            <a href="terms_of_use.html" class="active" data-i18n="termsOfUseTitle">${termsText[lang]}</a>`
    );

    // Inject Markdown content
    const regex = /(<div class="content-card markdown-body">)[\s\S]*?(<\/div>\s*<\/main>)/;
    templateHtml = templateHtml.replace(regex, `$1\n            ${htmlContent}\n        $2`);

    const targetHtmlPath = path.join(rootDir, lang, `terms_of_use.html`);
    fs.writeFileSync(targetHtmlPath, templateHtml, 'utf8');
    console.log(`Created ${targetHtmlPath}`);
}

langs.forEach(lang => {
    // 1. Update existing files
    for (const [htmlName, mdName] of Object.entries(fileMap)) {
        processHtml(lang, htmlName, mdName);
    }
    // 2. Create Terms of Use
    createTermsOfUse(lang);
});

console.log('Finished updating docs.');
