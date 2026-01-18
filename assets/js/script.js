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
    loadAppDescriptions(currentLang); // Load main descriptions
    // User guide is loaded only when requested or if we want to preload it but keep hidden
    loadUserGuide(currentLang);
    startCarousel();

    // User Guide Toggle
    const toggleBtn = document.getElementById('guide-toggle-btn');
    const guideSection = document.getElementById('user-guide');

    if (toggleBtn && guideSection) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = guideSection.classList.contains('hidden');

            if (isHidden) {
                guideSection.classList.remove('hidden');
                // Scroll to guide
                setTimeout(() => {
                    guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                guideSection.classList.add('hidden');
            }
        });
    }

    // Event Listeners for Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            currentLang = lang;
            localStorage.setItem('lang', lang);
            updateLangButtons(lang);
            loadTranslations(lang);
            loadAppDescriptions(lang); // Reload descriptions
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

// Fetch and display App Descriptions (Short and Long)
async function loadAppDescriptions(lang) {
    // 1. Load Short Description (Subtitle)
    try {
        const response = await fetch('assets/js/short_descr.json');
        if (response.ok) {
            const data = await response.json();
            const subtitle = document.getElementById('app-subtitle');
            if (subtitle && data[lang]) {
                subtitle.textContent = data[lang];
            }
        }
    } catch (error) {
        console.error('Error loading short description:', error);
    }

    // 2. Load Long Description
    const descContainer = document.getElementById('app-description');
    if (descContainer) {
        // descContainer.innerHTML = '<p class="loading-text">Loading...</p>'; 
        // Don't show loading text to avoid flickering if it's fast or if we want to keep old content momentarily

        try {
            const response = await fetch(`assets/descr_${lang}.md`);
            if (response.ok) {
                const text = await response.text();
                // Use marked if available
                if (typeof marked !== 'undefined') {
                    descContainer.innerHTML = marked.parse(text);
                } else {
                    descContainer.innerHTML = parseMarkdown(text);
                }
            } else {
                console.error('Description file not found for lang:', lang);
            }
        } catch (error) {
            console.error('Error loading app description:', error);
        }
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
