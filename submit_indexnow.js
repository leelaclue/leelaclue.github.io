const fs = require('fs');
const https = require('https');
const path = require('path');

const HOST = 'leelaclue.com';
const KEY = 'fc38d9d20c354e60b094b8e051d9bb09';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

// Read sitemap.xml
if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`Sitemap not found at ${SITEMAP_PATH}`);
    process.exit(1);
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');

// Extract URLs using regex
const urlRegex = /<loc>(.*?)<\/loc>/g;
let match;
const urlList = [];

while ((match = urlRegex.exec(sitemapContent)) !== null) {
    urlList.push(match[1]);
}

if (urlList.length === 0) {
    console.warn("No URLs found in sitemap.");
    process.exit(0);
}

console.log(`Found ${urlList.length} URLs in sitemap.`);

const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    console.log(`IndexNow Submission Status: ${res.statusCode} ${res.statusMessage}`);
    
    res.setEncoding('utf8');
    let responseBody = '';
    
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    
    res.on('end', () => {
        if (responseBody) {
            console.log(`Response: ${responseBody}`);
        }
        if (res.statusCode === 200 || res.statusCode === 202) {
            console.log('Successfully submitted to IndexNow.');
        } else {
            console.error('Failed to submit to IndexNow. See status code above.');
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
