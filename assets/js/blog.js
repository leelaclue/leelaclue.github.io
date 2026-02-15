document.addEventListener('DOMContentLoaded', () => {
    // 0. Detect Language from Path or Search
    function detectCurrentLang() {
        const path = window.location.pathname;
        if (path.includes('/de/')) return 'de';
        if (path.includes('/ru/')) return 'ru';
        if (path.includes('/en/')) return 'en';

        const params = new URLSearchParams(window.location.search);
        return params.get('lang') || localStorage.getItem('lang') || 'en';
    }

    const lang = detectCurrentLang();
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id') || 'psychology-of-choice';

    // 2. Define Blog Posts Metadata
    const blogPosts = [
        {
            id: 'psychology-of-choice',
            titleKey: 'blog_post_1_title',
            date: '2026-01-26'
        }
        // Add more posts here in the future
    ];

    // 3. Render Sidebar
    const sidebarList = document.getElementById('blog-sidebar-list');
    if (sidebarList) {
        sidebarList.innerHTML = ''; // Clear existing
        blogPosts.forEach(post => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            // Construct URL: blog.html?id=...&lang=...
            const postUrl = `blog.html?id=${post.id}&lang=${lang}`;
            a.href = postUrl;

            // Get title from translations (fallback to ID if missing)
            // Note: We need to access translations object which is loaded in translations.js
            // However, translations might not be ready if script order issues. 
            // We assume translations.js is loaded before this script or we access it safely.

            // Check if active
            if (post.id === postId) {
                a.classList.add('active');
            }

            // We will set the text content later after translations are ensured to be available
            // or we just use a placeholder for now and update in loadBlogContent
            a.setAttribute('data-i18n', post.titleKey);
            // Default text while loading
            a.textContent = post.id;

            li.appendChild(a);
            sidebarList.appendChild(li);
        });
    }

    // 4. Load Content for the Active Post
    loadBlogContent(postId, lang);
});

// Helper to load external scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false); // Resolve false on error to handle fallback
        document.head.appendChild(script);
    });
}

async function loadBlogContent(postId, lang) {
    const titleEl = document.getElementById('blog-post-title');
    const contentEl = document.getElementById('blog-post-content');
    const dateEl = document.getElementById('blog-post-date');

    const blogPosts = [
        {
            id: 'psychology-of-choice',
            titleKey: 'blog_post_1_title',
            date: '2026-01-26'
        }
    ];

    const post = blogPosts.find(p => p.id === postId);

    if (!post) {
        if (titleEl) titleEl.textContent = 'Post Not Found';
        if (contentEl) contentEl.textContent = 'The requested blog post could not be found.';
        return;
    }

    // Set Date
    if (dateEl) {
        dateEl.textContent = post.date;
    }

    // Set Title
    if (titleEl) {
        titleEl.setAttribute('data-i18n', post.titleKey);
    }

    // Load Content via Script Injection (works locally with file://)
    if (contentEl) {
        contentEl.innerHTML = '<p class="loading-text">Loading...</p>';
        contentEl.removeAttribute('data-i18n');

        // Determine base path for assets based on folder depth
        const path = window.location.pathname;
        const assetBase = (path.includes('/en/') || path.includes('/de/') || path.includes('/ru/')) ? '../' : '';

        // 1. Try to load specific language file
        // Format: assets/posts/[id]_[lang].js
        let loaded = await loadScript(`${assetBase}assets/posts/${postId}_${lang}.js`);

        // 2. Fallback to English if failing and we weren't already trying English
        if (!loaded && lang !== 'en') {
            console.log(`Blog post script for ${lang} not found, falling back to English.`);
            loaded = await loadScript(`${assetBase}assets/posts/${postId}_en.js`);
        }

        if (loaded && window.blogContent[postId]) {
            contentEl.innerHTML = window.blogContent[postId];
        } else {
            console.error('Error loading blog post script.');
            contentEl.innerHTML = '<p>Error loading content. Please check your internet connection or try again later.</p>';
        }
    }

    // Trigger translation update for the Title and Date
    if (window.loadTranslations && typeof window.loadTranslations === 'function') {
        window.loadTranslations(lang);
    }
}
