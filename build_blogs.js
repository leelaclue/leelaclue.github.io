const fs = require('fs');
const path = require('path');

// 1. Read translations
const translationsContent = fs.readFileSync('assets/js/translations.js', 'utf8');
const translationsMatch = translationsContent.match(/const translations = (\{[\s\S]*?\});/);
const translations = eval('(' + translationsMatch[1] + ')');

// 2. Read blog posts metadata
const blogJsContent = fs.readFileSync('assets/js/blog.js', 'utf8');
const blogPostsMatch = blogJsContent.match(/const blogPosts = (\[[\s\S]*?\]);/);
const blogPosts = eval('(' + blogPostsMatch[1] + ')');

const latestPostId = blogPosts[0].id;

// 3. Template HTML function (we use blog.html as the base)
function generateHtml(lang, postId, postTitleKey, postDate, contentHtml, isIndexPage = false) {
    const templatePath = path.join(lang, 'blog.html');
    // We need to read the ORIGINAL blog.html, wait! Since we are going to overwrite blog.html, 
    // we should read it from git OR we can just use the latest post generation, and overwrite blog.html at the very end.
    // Wait, let's keep a template string instead of reading it inside the loop, just in case blog.html format gets overwritten.
    return ''; // We will do this differently
}

// Since we already ran the script once, blog.html is currently still intact (we didn't overwrite it).
// Let's read it once per language before generating.
const templates = {};
for (const lang of ['en', 'de', 'ru']) {
    templates[lang] = fs.readFileSync(path.join(lang, 'blog.html'), 'utf8');
}

function processHtml(lang, postId, postTitleKey, postDate, contentHtml, htmlTemplate, isIndexPage) {
    let html = htmlTemplate;
    const postTitle = translations[lang][postTitleKey];
    
    // Replace title tag
    html = html.replace(/<title>.*?<\/title>/, `<title>${postTitle} - LeelaClue Blog</title>`);
    
    // Set canonical link for indexing (especially useful for blog.html)
    const canonicalHtml = `<link rel="canonical" href="https://leelaclue.github.io/${lang}/${postId}.html" />`;
    html = html.replace(/<\/title>/, `</title>\n    ${canonicalHtml}`);

    // Replace URL in hreflang links
    html = html.replace(/href="https:\/\/leelaclue\.github\.io\/(en|de|ru)\/blog\.html"/g, (match, p1) => {
        // If it's the index page (blog.html), the hreflangs should technically still point to blog.html.
        // Wait, if it has a canonical link pointing to postId.html, hreflang usually should also point to postId.html...
        // But let's just use postId.html since the content is identical. That's safer for SEO.
        return `href="https://leelaclue.github.io/${p1}/${postId}.html"`;
    });

    // We can pre-render the sidebar
    let sidebarLinks = '';
    for (const post of blogPosts) {
        const title = translations[lang][post.titleKey];
        const isActive = post.id === postId ? ' class="active"' : '';
        sidebarLinks += `<li><a href="${post.id}.html"${isActive}>${title}</a></li>\n`;
    }
    
    // Inject sidebar
    html = html.replace(/<ul id="blog-sidebar-list">[\s\S]*?<\/ul>/, `<ul id="blog-sidebar-list">\n${sidebarLinks}</ul>`);
    
    // Inject content
    const articleMatch = /<article class="blog-post content-card">[\s\S]*?<\/article>/;
    const newArticle = `<article class="blog-post content-card">
            <h1 id="blog-post-title">${postTitle}</h1>
            <div id="blog-post-date" class="blog-date">${postDate}</div>
            <div id="blog-post-content" class="markdown-body">
${contentHtml}
            </div>
        </article>`;
    html = html.replace(articleMatch, newArticle);

    // Remove the script tag for blog.js
    html = html.replace(/<script src="\.\.\/assets\/js\/blog\.js"><\/script>/, '');

    // Update Language switcher links to point to the specific post instead of blog.html
    html = html.replace(/href="\.\.\/en\/blog\.html"/g, `href="../en/${postId}.html"`);
    html = html.replace(/href="\.\.\/de\/blog\.html"/g, `href="../de/${postId}.html"`);
    html = html.replace(/href="\.\.\/ru\/blog\.html"/g, `href="../ru/${postId}.html"`);

    return html;
}

const langs = ['en', 'de', 'ru'];

// Overwrite blog.html and generate the other post files
for (const lang of langs) {
    for (let i = 0; i < blogPosts.length; i++) {
        const post = blogPosts[i];
        
        // Read raw content
        const postScriptPath = path.join('assets', 'posts', `${post.id}_${lang}.js`);
        let contentHtml = '';
        if (fs.existsSync(postScriptPath)) {
            const scriptContent = fs.readFileSync(postScriptPath, 'utf8');
            const match = scriptContent.match(/window\.blogContent\['[^']+'\] = `([\s\S]*?)`;/);
            if (match) {
                contentHtml = match[1];
            }
        }
        
        if (!contentHtml && lang !== 'en') {
            const fallBackPath = path.join('assets', 'posts', `${post.id}_en.js`);
            const fallbackScript = fs.readFileSync(fallBackPath, 'utf8');
            const match = fallbackScript.match(/window\.blogContent\['[^']+'\] = `([\s\S]*?)`;/);
            if (match) {
                contentHtml = match[1];
            }
        }

        const isLatest = i === 0;
        
        // Generate the specific post file
        const outHtml = processHtml(lang, post.id, post.titleKey, post.date, contentHtml, templates[lang], false);
        const outPath = path.join(lang, `${post.id}.html`);
        fs.writeFileSync(outPath, outHtml, 'utf8');
        console.log(`Generated ${outPath}`);

        // If it's the latest post, also overwrite blog.html
        if (isLatest) {
            const blogHtmlPath = path.join(lang, 'blog.html');
            // For blog.html, we modify it exactly the same, but the output file name is blog.html
            // The language switchers and hreflang links will point to how-leelaclue-was-born.html, which is perfect, 
            // since it transitions the user cleanly to the canonical URL structure.
            fs.writeFileSync(blogHtmlPath, outHtml, 'utf8');
            console.log(`Updated ${blogHtmlPath} (mirroring ${post.id})`);
        }
    }
}
