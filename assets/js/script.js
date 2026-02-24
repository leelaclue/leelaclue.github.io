document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'en';

    // 1. Get Language from Path or URL (SEO friendly)
    function getLanguageFromUrl() {
        const path = window.location.pathname;
        if (path.includes('/de/')) return 'de';
        if (path.includes('/ru/')) return 'ru';
        if (path.includes('/en/')) return 'en';

        const params = new URLSearchParams(window.location.search);
        return params.get('lang');
    }

    const urlLang = getLanguageFromUrl();

    // 2. Fallback to localStorage or Browser, but URL takes precedence
    let currentLang = urlLang || localStorage.getItem('lang') || navigator.language.split('-')[0] || defaultLang;

    // Supported languages verification
    if (!['en', 'de', 'ru'].includes(currentLang)) {
        currentLang = defaultLang;
    }

    // Persist to localStorage if it came from URL
    if (urlLang && ['en', 'de', 'ru'].includes(urlLang)) {
        localStorage.setItem('lang', urlLang);
    }

    // Initialize UI
    updateLangButtons(currentLang);
    loadTranslations(currentLang);
    loadUserGuide(currentLang);
    handleVoting(currentLang);
    startCarousel();

    // Check if URL has #user-guide hash and show the section
    const guideSection = document.getElementById('user-guide');
    if (window.location.hash === '#user-guide' && guideSection) {
        guideSection.classList.remove('hidden');
        setTimeout(() => {
            guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300); // Wait for content to load
    }

    // User Guide Toggle (Nav Link)
    const guideLink = document.getElementById('nav-guide-link');

    if (guideLink && guideSection) {
        guideLink.addEventListener('click', (e) => {
            e.preventDefault();
            const isHidden = guideSection.classList.contains('hidden');

            if (isHidden) {
                guideSection.classList.remove('hidden');
            }
            // Scroll to guide
            setTimeout(() => {
                guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    }

    // Note: We removed the click event listeners for .lang-btn
    // because they are now direct <a> links that reload the page
    // with ?lang=..., which is better for consistent SEO.


    // Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking a link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }
});

// Configure Marked options globally
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

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
            guideContainer.innerHTML = parseMarkdown(text);
        }

        fixInternalLinks(guideContainer);

    } catch (error) {
        console.error('Error loading user guide:', error);
        guideContainer.innerHTML = '<p class="loading-text">Failed to load User Guide. Please try again later.</p>';
    }
}

// Fix internal anchor links to work with marked.js generated IDs
function fixInternalLinks(container) {
    const links = container.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Try to find by heading text if ID doesn't match
                const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
                for (const heading of headings) {
                    if (heading.id === targetId || heading.textContent.toLowerCase().replace(/\s+/g, '-') === targetId) {
                        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        break;
                    }
                }
            }
        });
    });
}


function updateLangButtons(activeLang) {
    const supportedLangs = ['en', 'de', 'ru'];
    const path = window.location.pathname;

    // 1. Detect if we are in a language subfolder (e.g., /de/index.html)
    let currentPathLang = null;
    for (const l of supportedLangs) {
        if (path.indexOf(`/${l}/`) !== -1) {
            currentPathLang = l;
            break;
        }
    }

    // 2. Get current page name (e.g., privacy.html)
    const pathParts = path.split(/[/\\]/);
    const currentPage = pathParts.pop() || 'index.html';

    // 3. Update all language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const targetLang = btn.getAttribute('data-lang');
        if (!targetLang) return;

        if (targetLang === activeLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        // 4. Build the correct relative URL
        let newHref = "";
        if (currentPathLang) {
            // In a subfolder: go up then into new lang folder
            newHref = `../${targetLang}/${currentPage}`;
        } else if (supportedLangs.includes(targetLang)) {
            // At root: go into the lang folder
            newHref = `${targetLang}/${currentPage}`;
        } else {
            return; // Fallback
        }

        btn.href = newHref + window.location.search + window.location.hash;
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

// Feature Voting Logic (Google Forms Integration)
function handleVoting(currentLang) {
    const voteButtons = document.querySelectorAll('.vote-btn');
    if (voteButtons.length === 0) return;

    const votedTexts = {
        'en': 'Voted!',
        'de': 'Abgestimmt!',
        'ru': 'Голос принят!'
    };

    voteButtons.forEach(btn => {
        const featureId = btn.getAttribute('data-vote-id');

        // Check if already voted
        if (localStorage.getItem(`voted_${featureId}`)) {
            btn.innerText = votedTexts[currentLang] || votedTexts['en'];
            btn.disabled = true;
            btn.classList.add('voted');
            btn.style.opacity = '0.6';
            btn.style.cursor = 'default';
        }

        btn.addEventListener('click', async function () {
            if (this.disabled) return;

            const featureId = this.getAttribute('data-vote-id');
            const originalText = this.innerText;

            // UI Feedback: Immediate change
            this.innerText = '...';
            this.disabled = true;

            // Google Form Config (Silent Submission)
            const formId = "1FAIpQLSer-_ZoIftgOUJOXVJ8fnfmu81pIGE0wCDIipRHdYYcDdCRsw";
            const entryId = "entry.342078219";
            const submissionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

            // Append data
            const formData = new URLSearchParams();
            formData.append(entryId, featureId);

            try {
                // Send in background (no-cors mode)
                // Note: Using URLSearchParams object directly as body sets the correct Content-Type automatically
                fetch(submissionUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                });

                // Positive UI state
                this.innerText = votedTexts[currentLang] || votedTexts['en'];
                this.classList.add('voted');
                this.style.opacity = '0.6';
                this.style.cursor = 'default';

                // Prevent double voting in session
                localStorage.setItem(`voted_${featureId}`, 'true');

            } catch (error) {
                console.error('Voting submission error:', error);
                this.innerText = originalText;
                this.disabled = false;
            }
        });
    });
}
