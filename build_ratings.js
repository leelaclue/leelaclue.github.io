// build_ratings.js — fetches live app store ratings and caches them to
// assets/data/ratings.json, which build_html.js reads to inject
// aggregateRating JSON-LD and the visible hero rating badge.
//
// Sources:
//   - Apple: iTunes Lookup API per storefront (ratings are per-country)
//   - Google Play: JSON-LD embedded in the store page (only some regional
//     views expose aggregateRating; we take the max count found)
//
// Run:  node build_ratings.js   (then node build_html.js to bake into pages)
// On fetch failure the existing cache is kept, so builds never lose ratings.

const fs = require('fs');
const path = require('path');

const APPLE_ID = '6757707003';
const PLAY_ID = 'com.ikaengel.leelaclue';
const APPLE_STOREFRONTS = ['us', 'de', 'ru', 'gb', 'at', 'ch', 'fr', 'nl'];
const PLAY_VIEWS = ['hl=de&gl=DE', 'hl=en_US', 'hl=ru&gl=RU', 'hl=en&gl=AT'];

const CACHE_PATH = path.join(__dirname, 'assets', 'data', 'ratings.json');

async function fetchApple() {
    let count = 0, weighted = 0;
    const perStore = {};
    for (const sf of APPLE_STOREFRONTS) {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${APPLE_ID}&country=${sf}`);
        if (!res.ok) continue;
        const data = await res.json();
        const r = data.results && data.results[0];
        if (r && r.userRatingCount > 0) {
            perStore[sf] = { value: r.averageUserRating, count: r.userRatingCount };
            count += r.userRatingCount;
            weighted += r.averageUserRating * r.userRatingCount;
        }
    }
    return count > 0 ? { value: weighted / count, count, perStore } : null;
}

async function fetchPlay() {
    let best = null;
    for (const view of PLAY_VIEWS) {
        try {
            const res = await fetch(`https://play.google.com/store/apps/details?id=${PLAY_ID}&${view}`);
            if (!res.ok) continue;
            const html = await res.text();
            const m = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
            if (!m) continue;
            const ld = JSON.parse(m[1]);
            const ar = ld.aggregateRating;
            if (ar && ar.ratingCount && Number(ar.ratingCount) > 0) {
                const found = { value: Number(ar.ratingValue), count: Number(ar.ratingCount) };
                if (!best || found.count > best.count) best = found;
            }
        } catch (e) { /* try next view */ }
    }
    return best;
}

async function main() {
    const apple = await fetchApple();
    const play = await fetchPlay();
    console.log('Apple:', apple ? `${apple.value.toFixed(1)} x ${apple.count}` : 'no public ratings');
    console.log('Play: ', play ? `${play.value.toFixed(1)} x ${play.count}` : 'no public ratings');

    if (!apple && !play) {
        if (fs.existsSync(CACHE_PATH)) {
            console.log('No live data fetched — keeping existing cache.');
            return;
        }
        console.error('No ratings found and no cache exists. Nothing written.');
        process.exit(1);
    }

    const count = (apple ? apple.count : 0) + (play ? play.count : 0);
    const weighted = (apple ? apple.value * apple.count : 0) + (play ? play.value * play.count : 0);
    const value = Math.round((weighted / count) * 10) / 10;

    const out = {
        value,
        count,
        bestRating: 5,
        apple: apple ? { value: Math.round(apple.value * 10) / 10, count: apple.count, perStore: apple.perStore } : null,
        play: play ? { value: play.value, count: play.count } : null,
        fetchedAt: new Date().toISOString().slice(0, 10),
    };

    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
    console.log(`Combined: ${value} x ${count} -> ${CACHE_PATH}`);
    console.log('Now run: node build_html.js');
}

main();
