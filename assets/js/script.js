document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'en';
    let currentLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || defaultLang;

    // Supported languages
    if (!['en', 'de', 'ru'].includes(currentLang)) {
        currentLang = defaultLang;
    }

    // Initialize UI
    updateLangButtons(currentLang);
    loadTranslations(currentLang);

    // Event Listeners for Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            currentLang = lang;
            localStorage.setItem('lang', lang);
            updateLangButtons(lang);
            loadTranslations(lang);
        });
    });
});

function loadTranslations(lang) {
    try {
        const langData = translations[lang];

        if (!langData) return;

        // Update Elements with data-i18n Attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (langData[key]) {
                if (element.tagName === 'TITLE') {
                    element.innerText = `LeelaClue - ${langData[key]}`;
                } else {
                    element.innerHTML = parseMarkdown(langData[key]);
                }
            }
        });

        // Special handling for HTML lang attribute
        document.documentElement.lang = lang;

    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function updateLangButtons(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === activeLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Simple Markdown Parser (Bold, Links, Lists, Newlines)
function parseMarkdown(text) {
    if (!text) return '';

    // Escape HTML (basic)
    // text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Optional: depending on trust level of source content

    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Links ([text](url))
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // List items (* item) - requires multiline handling
    // We'll replace start of lines with * with <li>
    text = text.replace(/^\*\s+(.*)$/gm, '<li>$1</li>');

    // Wrap lists in <ul> if multiple <li> are adjacent? 
    // Simplified: Just make <li> block elements or wrap them blindly. 
    // Better: Basic newline handling first.

    // Newlines to <br> or <p>
    // Double newline -> paragraph
    text = text.split('\n\n').map(para => {
        if (para.includes('<li>')) {
            return `<ul>${para.replace(/\n/g, '')}</ul>`;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return text;
}
