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
    <loc>https://leelaclue.github.io/${lang}/${urlName}</loc>
    <lastmod>2026-03-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://leelaclue.github.io/en/${urlName}"/>
    <xhtml:link rel="alternate" hreflang="de" href="https://leelaclue.github.io/de/${urlName}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://leelaclue.github.io/ru/${urlName}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://leelaclue.github.io/en/${urlName}"/>
  </url>`;
        });
    });

    sitemap = sitemap.replace('</urlset>', urlBlocks + '\n</urlset>');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('Sitemap updated.');
} else {
    console.log('Sitemap already up to date.');
}
