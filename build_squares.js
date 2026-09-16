// build_squares.js — Generates the 72 Squares of Leela directory pages
// for English (en/), German (de/), and Russian (ru/).
//
// Extracts card IDs, Sanskrit titles, and core descriptions from C:/GitHub/leelaclue/assets/cards_*.json
// and organizes them by the 8 chakra planes from LeelaFieldScreen.

const fs = require('fs');
const path = require('path');

const root = 'c:/GitHub/leelaclue.github.io';
const appRepoRoot = 'c:/GitHub/leelaclue';
const langs = ['en', 'de', 'ru'];
const SITE = 'https://leelaclue.com';
const CSS_VERSION = '17';

const IOS_URL = 'https://apps.apple.com/us/app/leelaclue-mindfulness/id6757707003';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.ikaengel.leelaclue';
const IOS_BADGE = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
const GP_BADGE = 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

const KEYWORDS = {
    en: '72 squares of Leela, Leela game 72 squares, Leela cards meaning, Leela cell meanings, Leela chakras, Jnana Chaupar, Snakes and Arrows, Leela board squares, Leela states of consciousness, Harish Johari Leela, Janma square 1, Maya square 2, Vaikuntha square 68, Tamas square 72, LeelaClue',
    de: '72 Felder der Leela, Leela Spiel 72 Felder, Leela Karten Bedeutung, Leela Chakras, Jnana Chaupar, Schlange und Pfeil, Leela Spielbrett Felder, Bewusstseinsebenen Leela, Harish Johari Leela, Janma Feld 1, Maya Feld 2, Vaikuntha Feld 68, Tamas Feld 72, LeelaClue',
    ru: '72 клетки Лилы, Игра Лила 72 клетки, Значение клеток Лилы, Карты Лилы, Чакры Лилы, Джняна Чаупар, Змеи и Стрелы, Поле Лилы 72 клетки, Уровни сознания Лила, Хариш Джохари Лила, Джанма клетка 1, Майя клетка 2, Вайкунтха клетка 68, Тамас клетка 72, LeelaClue',
};

const pageTitle = {
    en: 'The 72 Squares of Leela — Complete Map of Consciousness &amp; Meanings | LeelaClue',
    de: 'Die 72 Felder der Leela — Vollständige Bedeutungen &amp; Bewusstseinsebenen | LeelaClue',
    ru: '72 клетки Лилы — Полная карта сознания и значения клеток | LeelaClue',
};

const pageDesc = {
    en: 'Explore all 72 squares of the ancient Game of Leela (Jnana Chaupar). Discover Sanskrit names, card meanings, and 8 chakra planes from Muladhara to the Cosmic Plane.',
    de: 'Entdecke alle 72 Felder des antiken Leela-Spiels (Jnana Chaupar). Sanskrit-Namen, Kartenbedeutungen und die 8 Chakra-Ebenen von Muladhara bis zur kosmischen Ebene.',
    ru: 'Полный список 72 клеток древней игры Лила (Джняна Чаупар). Значения клеток, названия на санскрите и 8 уровней чакр от Муладхары до Космического плана.',
};

const ui = {
    en: {
        h1: 'The 72 Squares of Leela',
        subtitle: 'The ancient Vedic map of human consciousness. In the Game of Self-Knowledge (Jnana Chaupar / Snakes &amp; Arrows), each of the 72 squares embodies an internal state of being, obstacle, or spiritual law across the eight chakra planes.',
        breadcrumbHome: 'Home',
        breadcrumbGuide: 'Guide',
        breadcrumbCurrent: '72 Squares',
        statSquares: '72 Squares',
        statSquaresSub: 'States of Being',
        statPlanes: '8 Planes',
        statPlanesSub: 'Chakra Levels',
        statTradition: 'Vedic Roots',
        statTraditionSub: 'Jnana Chaupar',
        searchPlaceholder: 'Search by number (e.g. 1, 68), Sanskrit name, or meaning...',
        clearBtn: 'Clear',
        showingCount: (c) => `Showing ${c} of 72 squares`,
        squarePrefix: 'Square',
        planePrefix: 'Plane',
        planeDescTitle: 'Significance',
        toneTitle: 'Tone',
        breathTitle: 'Breath',
        squaresRange: (f, t) => `Squares ${f}–${t}`,
        ctaTitle: 'Experience the 72 Squares in LeelaClue',
        ctaDesc: 'Draw daily cards, uncover karmic patterns with 3-card S·O·R spreads, and converse with the Leela Guru AI companion. Free for iOS &amp; Android.',
    },
    de: {
        h1: 'Die 72 Felder der Leela',
        subtitle: 'Die uralte vedische Landkarte des menschlichen Bewusstseins. Im Spiel der Selbsterkenntnis (Jnana Chaupar / Schlange und Pfeil) symbolisiert jedes der 72 Felder einen inneren Zustand, ein Hindernis oder ein geistiges Gesetz auf den acht Chakra-Ebenen.',
        breadcrumbHome: 'Startseite',
        breadcrumbGuide: 'Anleitung',
        breadcrumbCurrent: '72 Felder',
        statSquares: '72 Felder',
        statSquaresSub: 'Bewusstseinszustände',
        statPlanes: '8 Ebenen',
        statPlanesSub: 'Chakra-Stufen',
        statTradition: 'Vedische Wurzeln',
        statTraditionSub: 'Jnana Chaupar',
        searchPlaceholder: 'Suche nach Nummer (z. B. 1, 68), Sanskrit-Name oder Bedeutung...',
        clearBtn: 'Zurücksetzen',
        showingCount: (c) => `${c} von 72 Feldern angezeigt`,
        squarePrefix: 'Feld',
        planePrefix: 'Ebene',
        planeDescTitle: 'Bedeutung',
        toneTitle: 'Klang',
        breathTitle: 'Atem',
        squaresRange: (f, t) => `Felder ${f}–${t}`,
        ctaTitle: 'Erlebe die 72 Felder in LeelaClue',
        ctaDesc: 'Ziehe Tageskarten, erkenne karmische Muster im 3-Karten-S·O·R-Spread und reflektiere mit dem Leela-Guru. Kostenlos für iOS &amp; Android.',
    },
    ru: {
        h1: '72 клетки Лилы',
        subtitle: 'Древняя ведическая карта человеческого сознания. В Игре самопознания (Джняна Чаупар / Змеи и Стрелы) каждая из 72 клеток отражает внутреннее состояние, препятствие или духовный закон на восьми уровнях чакр.',
        breadcrumbHome: 'Главная',
        breadcrumbGuide: 'Руководство',
        breadcrumbCurrent: '72 клетки',
        statSquares: '72 клетки',
        statSquaresSub: 'Состояний сознания',
        statPlanes: '8 уровней',
        statPlanesSub: 'Чакровых планов',
        statTradition: 'Ведические истоки',
        statTraditionSub: 'Джняна Чаупар',
        searchPlaceholder: 'Поиск по номеру (напр. 1, 68), названию на санскрите или смыслу...',
        clearBtn: 'Сбросить',
        showingCount: (c) => `Показано ${c} из 72 клеток`,
        squarePrefix: 'Клетка',
        planePrefix: 'Уровень',
        planeDescTitle: 'Значение',
        toneTitle: 'Тон',
        breathTitle: 'Дыхание',
        squaresRange: (f, t) => `Клетки ${f}–${t}`,
        ctaTitle: 'Попробуй 72 клетки в приложении LeelaClue',
        ctaDesc: 'Тяни карту дня, исследуй кармические паттерны в раскладе С·П·Р из трёх карт и общайся с Гуру Лилы. Бесплатно для iOS и Android.',
    }
};

const chakraPlanes = {
    en: [
        {
            row: 0, from: 1, to: 9,
            chakra: 'Muladhara', plane: 'The Physical Plane', symbol: 'लं',
            color: '#FF453A', rgb: '255, 69, 58',
            description: 'Survival & Origins. You are at the root. This plane deals with your basic needs, stability, and the material world. Are your foundations solid?',
            tone: 'Healing and regeneration — the tone of the body itself.',
            breath: 'The breath of ground: out longer than in, then a rest at the bottom.'
        },
        {
            row: 1, from: 10, to: 18,
            chakra: 'Svadhisthana', plane: 'The Astral Plane', symbol: 'वं',
            color: '#FF9F0A', rgb: '255, 159, 10',
            description: 'Desire & Emotion. The realm of feelings, imagination, and sensory experience. You are navigating the tides of what you want versus what you feel.',
            tone: 'Releasing guilt and fear, so desire can move freely again.',
            breath: 'The breath of release: a long holding, then a longer letting go.'
        },
        {
            row: 2, from: 19, to: 27,
            chakra: 'Manipura', plane: 'The Celestial Plane', symbol: 'रं',
            color: '#FFD60A', rgb: '255, 214, 10',
            description: "Power & Action. This is the sun within you. It's about your identity in the world, your willpower, and the energy you use to manifest change.",
            tone: 'Undoing what has stalled — the tone of change.',
            breath: 'The breath of kindling: in longer than out — fills more than it empties.'
        },
        {
            row: 3, from: 28, to: 36,
            chakra: 'Anahata', plane: 'The Plane of Balance', symbol: 'यं',
            color: '#32D74B', rgb: '50, 215, 75',
            description: 'The Heart. The bridge between lower and higher realms. Here, the focus shifts from "me" to "we." It is the space of compassion and emotional equilibrium.',
            tone: 'Transformation and love — the tone the heart is tuned to.',
            breath: 'The breath of the heart: in and out in equal measure, nothing held.'
        },
        {
            row: 4, from: 37, to: 45,
            chakra: 'Vishuddha', plane: 'The Human Plane', symbol: 'हं',
            color: '#64D2FF', rgb: '100, 210, 255',
            description: "Expression & Truth. This is the filter of communication. Are you speaking your truth? It's the plane where you refine your ego into something more resonant.",
            tone: 'Connection — the tone of speaking and being understood.',
            breath: 'The breath of the voice: a short intake and a long, unbroken release.'
        },
        {
            row: 5, from: 46, to: 54,
            chakra: 'Ajna', plane: 'The Penance Plane', symbol: 'ॐ',
            color: '#0A84FF', rgb: '10, 132, 255',
            description: 'Intuition & Vision. The third eye. You are looking beyond the surface. This plane is about mental clarity, wisdom, and seeing the Clues the universe provides.',
            tone: 'Awakening intuition, and the courage to express it.',
            breath: 'The breath of the square: four equal sides. It steadies attention.'
        },
        {
            row: 6, from: 55, to: 63,
            chakra: 'Sahasrara', plane: 'The Plane of Reality', symbol: 'अः',
            color: '#BF5AF2', rgb: '191, 90, 242',
            description: 'Total Awareness. The thousand-petaled lotus. Here, the seeker moves beyond the ego entirely. It is a state of pure being and integration with the Whole.',
            tone: 'Returning to spiritual order.',
            breath: 'The breath of stillness: even, slow, resting at both ends.'
        },
        {
            row: 7, from: 64, to: 72,
            chakra: 'Vaikuntha', plane: 'The Cosmic Plane', symbol: '∞',
            color: '#E4E4EB', rgb: '228, 228, 235',
            description: 'The Absolute. The final row. This is the home of the Divine Play. It represents the ultimate goal: liberation and the return to the source of all energy.',
            tone: 'Divine consciousness and oneness.',
            breath: 'The breath of dissolving: a long emptying into a longer quiet.'
        },
    ],
    de: [
        {
            row: 0, from: 1, to: 9,
            chakra: 'Muladhara', plane: 'Die physische Ebene', symbol: 'लं',
            color: '#FF453A', rgb: '255, 69, 58',
            description: 'Erdung & Ursprung. Du stehst an der Wurzel. Diese Ebene befasst sich mit deinen Grundbedürfnissen, deiner Stabilität und der materiellen Welt. Stehst du auf festem Boden?',
            tone: 'Heilung und Regeneration — der Ton des Körpers selbst.',
            breath: 'Der Atem des Bodens: länger aus als ein, dann eine Ruhe am Grund.'
        },
        {
            row: 1, from: 10, to: 18,
            chakra: 'Svadhisthana', plane: 'Die astrale Ebene', symbol: 'वं',
            color: '#FF9F0A', rgb: '255, 159, 10',
            description: 'Verlangen & Emotion. Das Reich der Gefühle, der Vorstellungskraft und der sinnlichen Erfahrung. Du navigierst durch die Gezeiten dessen, was du begehrst und was du fühlst.',
            tone: 'Schuld und Angst loslassen, damit das Verlangen wieder fließen kann.',
            breath: 'Der Atem des Loslassens: ein langes Halten, dann ein längeres Gehenlassen.'
        },
        {
            row: 2, from: 19, to: 27,
            chakra: 'Manipura', plane: 'Die himmlische Ebene', symbol: 'रं',
            color: '#FFD60A', rgb: '255, 214, 10',
            description: 'Kraft & Handeln. Dies ist die Sonne in dir. Es geht um deine Identität in der Welt, deinen Willen und die Energie, mit der du Veränderungen bewirkst.',
            tone: 'Auflösen, was feststeckt — der Ton der Veränderung.',
            breath: 'Der Atem des Entfachens: länger ein als aus — füllt mehr als er leert.'
        },
        {
            row: 3, from: 28, to: 36,
            chakra: 'Anahata', plane: 'Die Ebene des Gleichgewichts', symbol: 'यं',
            color: '#32D74B', rgb: '50, 215, 75',
            description: 'Das Herz. Die Brücke zwischen den unteren und oberen Welten. Hier verschiebt sich der Fokus vom Ich zum Wir. Es ist der Raum des Mitgefühls und der emotionalen Balance.',
            tone: 'Wandlung und Liebe — der Ton, auf den das Herz gestimmt ist.',
            breath: 'Der Atem des Herzens: ein und aus zu gleichen Teilen, nichts gehalten.'
        },
        {
            row: 4, from: 37, to: 45,
            chakra: 'Vishuddha', plane: 'Die menschliche Ebene', symbol: 'हं',
            color: '#64D2FF', rgb: '100, 210, 255',
            description: 'Ausdruck & Wahrheit. Der Filter der Kommunikation. Sprichst du deine Wahrheit? Auf dieser Ebene verfeinerst du dein Ego zu Resonanz und Klarheit.',
            tone: 'Verbindung — der Ton des Sprechens und des Verstandenwerdens.',
            breath: 'Der Atem der Stimme: ein kurzes Einatmen und ein langes, ununterbrochenes Lösen.'
        },
        {
            row: 5, from: 46, to: 54,
            chakra: 'Ajna', plane: 'Die Ebene der Einsicht', symbol: 'ॐ',
            color: '#0A84FF', rgb: '10, 132, 255',
            description: 'Intuition & Vision. Das dritte Auge. Du blickst unter die Oberfläche. Diese Ebene handelt von mentaler Klarheit, Weisheit und dem Erkennen der Clues, die das Universum dir schenkt.',
            tone: 'Die Intuition erwecken und den Mut, sie auszudrücken.',
            breath: 'Der Atem des Quadrats: vier gleiche Seiten. Er sammelt die Aufmerksamkeit.'
        },
        {
            row: 6, from: 55, to: 63,
            chakra: 'Sahasrara', plane: 'Die Ebene der Realität', symbol: 'अः',
            color: '#BF5AF2', rgb: '191, 90, 242',
            description: 'Umfassendes Bewusstsein. Der tausendblättrige Lotus. Hier lässt der Suchende das Ego hinter sich. Es ist ein Zustand des reinen Seins und der Einheit mit dem Ganzen.',
            tone: 'Rückkehr zur spirituellen Ordnung.',
            breath: 'Der Atem der Stille: gleichmäßig, langsam, an beiden Enden ruhend.'
        },
        {
            row: 7, from: 64, to: 72,
            chakra: 'Vaikuntha', plane: 'Die kosmische Ebene', symbol: '∞',
            color: '#E4E4EB', rgb: '228, 228, 235',
            description: 'Das Absolute. Die oberste Reihe. Dies ist die Heimat des göttlichen Spiels (Leela). Es repräsentiert das Ziel: Befreiung und die Rückkehr zur Quelle aller Energie.',
            tone: 'Göttliches Bewusstsein und Einheit.',
            breath: 'Der Atem des Auflösens: ein langes Leeren in eine längere Stille.'
        },
    ],
    ru: [
        {
            row: 0, from: 1, to: 9,
            chakra: 'Муладхара', plane: 'Физический уровень', symbol: 'लं',
            color: '#FF453A', rgb: '255, 69, 58',
            description: 'Выживание и истоки. Ты у корней. Этот уровень связан с базовыми потребностями, стабильностью и материальным миром. Прочен ли твой фундамент?',
            tone: 'Исцеление и восстановление — тон самого тела.',
            breath: 'Дыхание опоры: выдох длиннее вдоха, затем покой внизу.'
        },
        {
            row: 1, from: 10, to: 18,
            chakra: 'Свадхистхана', plane: 'Астральный уровень', symbol: 'वं',
            color: '#FF9F0A', rgb: '255, 159, 10',
            description: 'Желание и эмоция. Сфера чувств, воображения и чувственного опыта. Ты движешься между приливами желаний и ощущений.',
            tone: 'Освобождение от вины и страха, чтобы желание снова двигалось свободно.',
            breath: 'Дыхание освобождения: долгая задержка, затем ещё более долгий выдох.'
        },
        {
            row: 2, from: 19, to: 27,
            chakra: 'Манипура', plane: 'Небесный уровень', symbol: 'रं',
            color: '#FFD60A', rgb: '255, 214, 10',
            description: 'Сила и действие. Это солнце внутри тебя. Речь о твоей личности в мире, о воле и энергии, с которой ты создаёшь перемены.',
            tone: 'Растворение того, что застыло, — тон перемен.',
            breath: 'Дыхание разжигания: вдох длиннее выдоха — наполняет больше, чем опустошает.'
        },
        {
            row: 3, from: 28, to: 36,
            chakra: 'Анахата', plane: 'Уровень равновесия', symbol: 'यं',
            color: '#32D74B', rgb: '50, 215, 75',
            description: 'Сердце. Мост между низшими и высшими сферами. Здесь фокус смещается от «Я» к «Мы». Это пространство сострадания и эмоционального равновесия.',
            tone: 'Преображение и любовь — тон, на который настроено сердце.',
            breath: 'Дыхание сердца: вдох и выдох поровну, без задержек.'
        },
        {
            row: 4, from: 37, to: 45,
            chakra: 'Вишуддха', plane: 'Человеческий уровень', symbol: 'हं',
            color: '#64D2FF', rgb: '100, 210, 255',
            description: 'Выражение и истина. Фильтр общения. Говоришь ли ты свою правду? Здесь ты утончаешь своё эго, превращая его в нечто более резонансное.',
            tone: 'Связь — тон речи и понимания.',
            breath: 'Дыхание голоса: короткий вдох и долгий, непрерывный выдох.'
        },
        {
            row: 5, from: 46, to: 54,
            chakra: 'Аджна', plane: 'Уровень покаяния', symbol: 'ॐ',
            color: '#0A84FF', rgb: '10, 132, 255',
            description: 'Интуиция и видение. Третий глаз. Ты смотришь сквозь поверхность. Этот уровень о ясности ума, мудрости и распознавании подсказок, которые посылает вселенная.',
            tone: 'Пробуждение интуиции и смелости выразить её.',
            breath: 'Дыхание квадрата: четыре равные стороны. Сначала собирает внимание.'
        },
        {
            row: 6, from: 55, to: 63,
            chakra: 'Сахасрара', plane: 'Уровень реальности', symbol: 'अः',
            color: '#BF5AF2', rgb: '191, 90, 242',
            description: 'Полная осознанность. Тысячелепестковый лотос. Здесь искатель выходит за пределы эго. Это состояние чистого бытия и единства с Целым.',
            tone: 'Возвращение к духовному порядку.',
            breath: 'Дыхание тишины: ровное, медленное, с покоем на обоих концах.'
        },
        {
            row: 7, from: 64, to: 72,
            chakra: 'Вайкунтха', plane: 'Космический уровень', symbol: '∞',
            color: '#E4E4EB', rgb: '228, 228, 235',
            description: 'Абсолют. Последний ряд. Это обитель Божественной Игры (Лила). Он представляет высшую цель: освобождение и возвращение к источнику всей энергии.',
            tone: 'Божественное сознание и единство.',
            breath: 'Дыхание растворения: долгое опустошение в ещё более долгую тишину.'
        },
    ]
};

function navLabels(lang) {
    const labels = {
        en: {
            offlineGame: 'Offline Game',
            community: 'Community',
            blog: 'Blog',
            releaseNews: 'Release News',
            featureVotes: 'Feature Votes',
            guide: 'Guide',
            userGuide: 'User Guide',
            squares: '72 Squares of Leela',
            faq: 'FAQ'
        },
        de: {
            offlineGame: 'Offline-Spiel',
            community: 'Community',
            blog: 'Blog',
            releaseNews: 'Release-News',
            featureVotes: 'Feature-Abstimmung',
            guide: 'Anleitung',
            userGuide: 'Benutzerhandbuch',
            squares: '72 Felder der Leela',
            faq: 'FAQ'
        },
        ru: {
            offlineGame: 'Офлайн-игра',
            community: 'Сообщество',
            blog: 'Блог',
            releaseNews: 'Новости обновлений',
            featureVotes: 'Голосование',
            guide: 'Руководство',
            userGuide: 'Руководство пользователя',
            squares: '72 клетки Лилы',
            faq: 'FAQ'
        },
    };
    return labels[lang] || labels.en;
}

function attrEscape(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function hreflangTags() {
    return langs.map(l =>
        `    <link rel="alternate" hreflang="${l}" href="${SITE}/${l}/leela-72-squares.html" />`
    ).join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/en/leela-72-squares.html" />`;
}

function buildJsonLd(lang, cards) {
    const url = `${SITE}/${lang}/leela-72-squares.html`;
    const u = ui[lang];

    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': u.breadcrumbHome,
                'item': `${SITE}/${lang}/`
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': u.breadcrumbGuide,
                'item': `${SITE}/${lang}/user_guide.html`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': u.h1,
                'item': url
            }
        ]
    };

    const collectionPage = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${u.h1} — LeelaClue`,
        'description': pageDesc[lang],
        'url': url,
        'inLanguage': lang,
        'publisher': {
            '@type': 'Organization',
            'name': 'LeelaClue',
            'url': SITE,
            'logo': { '@type': 'ImageObject', 'url': `${SITE}/assets/app_icon.png` }
        },
        'mainEntity': {
            '@type': 'ItemList',
            'numberOfItems': cards.length,
            'itemListElement': cards.map(c => ({
                '@type': 'ListItem',
                'position': c.id,
                'name': `${u.squarePrefix} ${c.id}: ${c.title}`,
                'description': c.description,
                'url': `${url}#square-${c.id}`
            }))
        }
    };

    return `    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbs, null, 2).split('\n').join('\n    ')}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(collectionPage, null, 2).split('\n').join('\n    ')}
    </script>`;
}

function buildPageHtml(lang, cards) {
    const n = navLabels(lang);
    const u = ui[lang];
    const planes = chakraPlanes[lang];
    const activeLang = (l) => l === lang ? ' active' : '';
    const canon = `${SITE}/${lang}/leela-72-squares.html`;

    // Render Chakra navigation chips
    const chipsHtml = planes.map((p, idx) => `
        <a href="#plane-${idx + 1}" class="chakra-chip">
            <span class="chakra-chip-dot" style="background-color: ${p.color};"></span>
            <span>${idx + 1} · ${p.chakra}</span>
        </a>
    `).join('');

    // Render Sections by Chakra plane
    const sectionsHtml = planes.map((p, pIdx) => {
        const planeCards = cards.filter(c => c.id >= p.from && c.id <= p.to);

        const cardsGrid = planeCards.map(c => `
            <article class="square-card" id="square-${c.id}" data-id="${c.id}" data-title="${attrEscape(c.title)}" data-desc="${attrEscape(c.description)}">
                <span id="cell-${c.id}" class="anchor-target"></span>
                <div class="square-card-top">
                    <span class="square-num-badge">#${c.id}</span>
                    <div class="square-card-top-right">
                        <span class="square-chakra-badge" style="--chakra-color: ${p.color};">
                            <span class="chakra-dot"></span>${p.chakra}
                        </span>
                        <a href="#square-${c.id}" class="square-anchor-link" title="${u.squarePrefix} ${c.id}: ${attrEscape(c.title)}">#</a>
                    </div>
                </div>
                <h3 class="square-title">${c.title}</h3>
                <p class="square-desc">${c.description}</p>
            </article>
        `).join('\n');

        return `
        <section class="chakra-section" id="plane-${pIdx + 1}" style="--plane-color: ${p.color}; --plane-rgb: ${p.rgb};">
            <div class="chakra-section-header">
                <div class="chakra-symbol-box" aria-hidden="true">${p.symbol}</div>
                <div class="chakra-header-text">
                    <div class="chakra-header-top">
                        <h2 class="chakra-header-title">${u.planePrefix} ${pIdx + 1}: ${p.chakra}</h2>
                        <span class="chakra-plane-name">${p.plane}</span>
                        <span class="chakra-meta-pill">${u.squaresRange(p.from, p.to)}</span>
                    </div>
                    <p class="chakra-plane-desc">${p.description}</p>
                    <div class="chakra-meta-pills">
                        <span class="chakra-meta-pill"><strong>${u.toneTitle}:</strong> ${p.tone}</span>
                        <span class="chakra-meta-pill"><strong>${u.breathTitle}:</strong> ${p.breath}</span>
                    </div>
                </div>
            </div>
            <div class="squares-grid">
                ${cardsGrid}
            </div>
        </section>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="${canon}" />
    <title>${pageTitle[lang]}</title>
    <meta name="description" content="${attrEscape(pageDesc[lang])}">
    <meta name="keywords" content="${KEYWORDS[lang]}">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="stylesheet" href="../assets/css/style.css?v=${CSS_VERSION}">

    <!-- Open Graph / Social -->
    <meta property="og:site_name" content="LeelaClue">
    <meta property="og:title" content="${pageTitle[lang]}">
    <meta property="og:description" content="${attrEscape(pageDesc[lang])}">
    <meta property="og:image" content="${SITE}/assets/app_icon.png">
    <meta property="og:url" content="${canon}">
    <meta property="og:type" content="article">

    <!-- Hreflang Tags -->
${hreflangTags()}

    <!-- Structured Data -->
${buildJsonLd(lang, cards)}
</head>

<body>
    <header>
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" class="logo-link">
                    <img src="../assets/app_icon_small.png" alt="LeelaClue Icon" class="logo-img">
                    <span class="brand-name">LeelaClue</span>
                </a>
            </div>
            <nav class="main-nav">
                <a href="offline-game.html" class="nav-item highlight-btn">${n.offlineGame}</a>
                <div class="nav-item has-dropdown">
                    <a href="blog.html">${n.community} <span class="dot-new"></span></a>
                    <div class="dropdown-menu">
                        <a href="blog.html">${n.blog}</a>
                        <a href="whats_new.html">${n.releaseNews}</a>
                        <a href="votes.html">${n.featureVotes}</a>
                    </div>
                </div>
                <div class="nav-item has-dropdown">
                    <a href="user_guide.html">${n.guide}</a>
                    <div class="dropdown-menu">
                        <a href="user_guide.html">${n.userGuide}</a>
                        <a href="leela-72-squares.html" class="active">${n.squares}</a>
                        <a href="faq.html">${n.faq}</a>
                    </div>
                </div>
            </nav>
            <div class="header-right">
                <div class="lang-switch">
                    <a href="../en/leela-72-squares.html" class="lang-btn${activeLang('en')}">EN</a>
                    <a href="../de/leela-72-squares.html" class="lang-btn${activeLang('de')}">DE</a>
                    <a href="../ru/leela-72-squares.html" class="lang-btn${activeLang('ru')}">RU</a>
                </div>
                <button class="hamburger" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>

    <main class="squares-container">
        <!-- Hero & Breadcrumb -->
        <div class="squares-hero">
            <nav class="squares-breadcrumb" aria-label="Breadcrumb">
                <a href="index.html">${u.breadcrumbHome}</a>
                <span>›</span>
                <a href="user_guide.html">${u.breadcrumbGuide}</a>
                <span>›</span>
                <span style="color: var(--primary-color);">${u.breadcrumbCurrent}</span>
            </nav>
            <h1>${u.h1}</h1>
            <p class="squares-subtitle">${u.subtitle}</p>
            <div class="squares-stats-row">
                <div class="squares-stat-item">
                    <span class="squares-stat-val">72</span>
                    <span class="squares-stat-lbl">${u.statSquaresSub}</span>
                </div>
                <div class="squares-stat-item">
                    <span class="squares-stat-val">8</span>
                    <span class="squares-stat-lbl">${u.statPlanesSub}</span>
                </div>
                <div class="squares-stat-item">
                    <span class="squares-stat-val">∞</span>
                    <span class="squares-stat-lbl">${u.statTraditionSub}</span>
                </div>
            </div>
        </div>

        <!-- Sticky Search & Filter Toolbar -->
        <div class="squares-toolbar">
            <div class="squares-search-bar">
                <span class="squares-search-icon" aria-hidden="true">🔍</span>
                <input type="text" id="square-search" class="squares-search-input" placeholder="${attrEscape(u.searchPlaceholder)}" aria-label="${attrEscape(u.searchPlaceholder)}">
                <button type="button" id="clear-search" class="squares-clear-btn" style="display: none;">${u.clearBtn}</button>
            </div>
            <div id="search-count" class="squares-counter">${u.showingCount(72)}</div>
            <nav class="chakra-chips" aria-label="Chakra planes filter">
                ${chipsHtml}
            </nav>
        </div>

        <!-- 8 Chakra Sections -->
        <div class="squares-content">
            ${sectionsHtml}
        </div>

        <!-- App Conversion CTA -->
        <section class="squares-app-cta">
            <h2>${u.ctaTitle}</h2>
            <p>${u.ctaDesc}</p>
            <div class="squares-cta-badges">
                <a href="${IOS_URL}" target="_blank" rel="noopener">
                    <img alt="Download on the App Store" src="${IOS_BADGE}" class="store-badge-sm" loading="lazy">
                </a>
                <a href="${ANDROID_URL}" target="_blank" rel="noopener">
                    <img alt="Get it on Google Play" src="${GP_BADGE}" class="store-badge-sm google" loading="lazy">
                </a>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-links" style="margin-bottom: 1rem;">
            <a href="privacy.html" data-i18n="disclaimerTitle">Disclaimer</a>
            <a href="privacy_policy.html" data-i18n="privacyPolicyTitle">Privacy Policy</a>
            <a href="terms_of_use.html" data-i18n="termsOfUseTitle">Terms of Use</a>
            <a href="privacy_web.html" data-i18n="webPrivacyTitle">Website Privacy</a>
            <a href="impressum.html" data-i18n="impressumTitle">Impressum</a>
            <a href="support.html" data-i18n="contactTitle">Support</a>
        </div>
        <p style="color: #666; font-size: 0.8rem;">&copy; 2026 LeelaClue</p>
    </footer>

    <script src="../assets/js/translations.js"></script>
    <script src="../assets/js/script.js"></script>
    <script>
    (function() {
        var input = document.getElementById('square-search');
        var clearBtn = document.getElementById('clear-search');
        var countEl = document.getElementById('search-count');
        var cards = Array.from(document.querySelectorAll('.square-card'));
        var sections = Array.from(document.querySelectorAll('.chakra-section'));
        var countTemplates = {
            en: function(c) { return 'Showing ' + c + ' of 72 squares'; },
            de: function(c) { return c + ' von 72 Feldern angezeigt'; },
            ru: function(c) { return 'Показано ' + c + ' из 72 клеток'; }
        };
        var currentLang = '${lang}';

        function filter() {
            var raw = (input.value || '').trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function(card) {
                var id = card.getAttribute('data-id') || '';
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var desc = (card.getAttribute('data-desc') || '').toLowerCase();

                var match = false;
                if (!raw) {
                    match = true;
                } else if (id === raw) {
                    match = true;
                } else if (title.indexOf(raw) !== -1 || desc.indexOf(raw) !== -1) {
                    match = true;
                }

                if (match) {
                    card.classList.remove('is-hidden');
                    visibleCount++;
                } else {
                    card.classList.add('is-hidden');
                }
            });

            sections.forEach(function(sec) {
                var visibleInSec = sec.querySelectorAll('.square-card:not(.is-hidden)').length;
                if (visibleInSec === 0) {
                    sec.classList.add('is-hidden');
                } else {
                    sec.classList.remove('is-hidden');
                }
            });

            if (countEl) {
                var fn = countTemplates[currentLang] || countTemplates.en;
                countEl.textContent = fn(visibleCount);
            }
            if (clearBtn) {
                clearBtn.style.display = raw ? 'inline-block' : 'none';
            }
        }

        if (input) {
            input.addEventListener('input', filter);
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                input.value = '';
                filter();
                input.focus();
            });
        }
    })();
    </script>
</body>

</html>`;
}

function main() {
    for (const lang of langs) {
        const cardsPath = path.join(appRepoRoot, 'assets', `cards_${lang}.json`);
        if (!fs.existsSync(cardsPath)) {
            console.error(`ERROR: Cannot find ${cardsPath}`);
            process.exit(1);
        }

        const rawCards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
        // Extract only id, title, description
        const cards = rawCards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description
        }));

        const outPath = path.join(root, lang, 'leela-72-squares.html');
        const html = buildPageHtml(lang, cards);
        fs.writeFileSync(outPath, html, 'utf8');
        console.log(`  Built ${lang}/leela-72-squares.html (${cards.length} squares)`);
    }
    console.log('\n72 Squares directory pages generated successfully.');
}

main();
