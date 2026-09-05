const fs = require('fs');

const sitemapPath = 'sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Read blog posts metadata
const blogJsContent = fs.readFileSync('assets/js/blog.js', 'utf8');
const blogPostsMatch = blogJsContent.match(/const blogPosts = (\[[\s\S]*?\]);/);
const blogPosts = eval('(' + blogPostsMatch[1] + ')');

let added = 0;
let urlBlocks = '';

blogPosts.forEach(post => {
    const pageFile = `${post.id}.html`;
    if (!sitemap.includes(`/${pageFile}`)) {
        ['en', 'de', 'ru'].forEach(lang => {
            urlBlocks += `\n  <url>\n    <loc>https://leelaclue.com/${lang}/${pageFile}</loc>\n    <lastmod>${post.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
            added++;
        });
    }
});

if (added > 0) {
    sitemap = sitemap.replace('</urlset>', urlBlocks + '\n</urlset>');
    // CRITICAL: Ensure LF-only line endings per AGENTS.md §3.7
    sitemap = sitemap.replace(/\r\n/g, '\n');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`Sitemap updated: added ${added} URLs.`);
} else {
    console.log('Sitemap already up to date.');
}
