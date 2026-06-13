const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const langs = ['en', 'de', 'ru'];

// Localized fallback text for the Terms of Use link (data-i18n overrides at runtime).
const termsText = {
    en: 'Terms of Use',
    de: 'Nutzungsbedingungen',
    ru: 'Условия использования'
};

langs.forEach(lang => {
    const dir = path.join(rootDir, lang);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

    files.forEach(file => {
        const fp = path.join(dir, file);
        let content = fs.readFileSync(fp, 'utf8');

        // Idempotent: skip if a Terms of Use footer link already exists.
        if (content.includes('data-i18n="termsOfUseTitle"')) {
            return;
        }

        // Anchor on the FOOTER Privacy Policy link specifically. The footer link
        // carries data-i18n="privacyPolicyTitle"; in-body links to privacy_policy.html
        // do NOT, so this never touches page content.
        const footerLink = /(<a href="privacy_policy\.html" data-i18n="privacyPolicyTitle">[^<]*<\/a>)/;
        if (!footerLink.test(content)) {
            console.log(`No footer Privacy Policy link found, skipping ${fp}`);
            return;
        }

        content = content.replace(
            footerLink,
            `$1\n            <a href="terms_of_use.html" data-i18n="termsOfUseTitle">${termsText[lang]}</a>`
        );

        fs.writeFileSync(fp, content, 'utf8');
        console.log(`Updated footer in ${fp}`);
    });
});

console.log('Finished updating footers.');
