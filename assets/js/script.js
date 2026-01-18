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
    loadUserGuide(currentLang); // Initial load of user guide
    startCarousel(); // Start image slider

    // Event Listeners for Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            currentLang = lang;
            localStorage.setItem('lang', lang);
            updateLangButtons(lang);
            loadTranslations(lang);
            loadUserGuide(lang); // Reload guide when lang changes
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
                    // Use marked if available, else simple fallback (but we added marked lib)
                    if (typeof marked !== 'undefined') {
                        element.innerHTML = marked.parse(langData[key]);
                    } else {
                        element.innerHTML = parseMarkdown(langData[key]);
                    }
                }
            }
        });

        // Special handling for HTML lang attribute
        document.documentElement.lang = lang;

    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Fetch and display User Guide from GitHub
async function loadUserGuide(lang) {
    const guideContainer = document.getElementById('guide-content');
    if (!guideContainer) return;

    guideContainer.innerHTML = '<p class="loading-text">Loading guide...</p>';

    const langMap = {
        'en': 'USER_GUIDE_EN.md',
        'de': 'USER_GUIDE_DE.md',
        'ru': 'USER_GUIDE_RU.md'
    };

    const fileName = langMap[lang] || 'USER_GUIDE_EN.md';
    const url = `https://raw.githubusercontent.com/leelaclue/helps/main/${fileName}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();

        if (typeof marked !== 'undefined') {
            guideContainer.innerHTML = marked.parse(text);
        } else {
            guideContainer.innerHTML = parseMarkdown(text); // Fallback
        }

    } catch (error) {
        console.error('Error loading user guide:', error);
        guideContainer.innerHTML = '<p class="loading-text">Failed to load User Guide. Please try again later.</p>';
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

// Simple Carousel Logic
function startCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const intervalTime = 4000; // 4 seconds

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, intervalTime);
}

// Simple Markdown Parser (Fallback)
function parseMarkdown(text) {
    if (!text) return '';
    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Links ([text](url))
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // List items
    text = text.replace(/^\*\s+(.*)$/gm, '<li>$1</li>');
    // Newlines
    text = text.split('\n\n').map(para => {
        if (para.includes('<li>')) return `<ul>${para.replace(/\n/g, '')}</ul>`;
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    return text;
}
