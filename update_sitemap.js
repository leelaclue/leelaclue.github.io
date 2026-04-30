const fs = require('fs');

const sitemapPath = 'sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

const newUrls = [
    'how-leelaclue-was-born.html',
    'the-soul-map.html',
    'why-i-facilitate-leela.html',
    'psychology-of-choice.html'
];

// Check if already in sitemap
if (!sitemap.includes('how-leelaclue-was-born.html')) {
    let urlBlocks = '';
    
    newUrls.forEach(urlName => {
        ['en', 'de', 'ru'].forEach(lang => {
            urlBlocks += `
  <!-- ${urlName} -->
  <url>
    <loc>https://leelaclue.com/${lang}/${urlName}</loc>
    <lastmod>2026-03-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    });

    sitemap = sitemap.replace('</urlset>', urlBlocks + '\n</urlset>');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('Sitemap updated.');
} else {
    console.log('Sitemap already up to date.');
}
