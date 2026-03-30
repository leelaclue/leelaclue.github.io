# LeelaClue Website — Project Instructions

> **These instructions are for any AI agent working on the LeelaClue GitHub Pages website.**
> Read this file in full before making any changes.

---

## 1. Project Overview

LeelaClue is a **mindfulness and self-discovery mobile app** inspired by the ancient Indian game of Leela (Snakes & Arrows). This repository hosts the **marketing website** at `https://leelaclue.github.io`.

The website is a **static site** (no build step, no framework). It is served directly by GitHub Pages.

**Current App Version**: v1.7.3

---

## 2. Directory Structure

```
leelaclue.github.io/
├── .agent/                  # Agent workspace (gitignored)
│   ├── tasks/               # SEO and feature task descriptions
│   └── workflows/           # Reusable workflow instructions
├── assets/
│   ├── css/style.css        # Single global stylesheet
│   ├── fonts/               # Philosopher font (Regular + Bold)
│   ├── images/              # Card images, photos (WebP / PNG)
│   ├── js/
│   │   ├── script.js        # Main site JS (carousel, hamburger, etc.)
│   │   ├── blog.js          # Blog post loading logic
│   │   ├── translations.js  # UI string translations (EN/DE/RU)
│   │   └── short_descr.json # Short descriptions data
│   └── posts/               # Blog posts (Markdown files per language)
│       ├── en/
│       ├── de/
│       └── ru/
├── en/                      # English pages (canonical)
│   ├── index.html           # Homepage
│   ├── blog.html
│   ├── faq.html
│   ├── whats_new.html       # Release changelog
│   ├── offline-game.html
│   ├── user_guide.html
│   ├── votes.html
│   ├── support.html
│   ├── privacy.html
│   ├── privacy_policy.html
│   └── impressum.html
├── de/                      # German pages (same structure as /en/)
├── ru/                      # Russian pages (same structure as /en/)
├── index.html               # Root redirect (detects browser language → /en/ or /de/ or /ru/)
├── sitemap.xml
├── robots.txt
└── new_features/            # Internal feature docs (gitignored)
```

---

## 3. Critical Rules

### 3.1 Trilingual Consistency
- **Every content change must be applied to all three languages**: `/en/`, `/de/`, `/ru/`.
- German uses informal **"du"** (lowercase) address consistently.
- Russian uses informal **"ты"** address consistently, with correct use of **"ё"**.
- Navigation labels per language:
  | EN              | DE               | RU               |
  |-----------------|------------------|------------------|
  | Offline Game    | Offline Spiel    | Оффлайн-игра     |
  | Community       | Community        | Сообщество       |
  | Blog            | Blog             | Блог             |
  | Release News    | Releases         | Новости          |
  | Feature Votes   | Features Voten   | Голосование      |
  | Guide           | Handbuch         | Инфо             |
  | User Guide      | Benutzerhandbuch | Руководство      |
  | FAQ             | FAQ              | FAQ              |

### 3.2 Navigation Order
The navigation bar order is: **Offline Game | Community | Guide** (left to right).  
When updating navigation in one file, update **all HTML files** across all 3 languages (33 files total). Use a script for bulk updates.

### 3.3 No Build Step
This is a **vanilla HTML/CSS/JS** static site. Do NOT introduce any build tools, bundlers, or frameworks. All changes are live immediately when pushed to GitHub.

### 3.4 Shared Assets
- **One CSS file**: `assets/css/style.css` — all styling is here.
- **One main JS**: `assets/js/script.js` — carousel, hamburger menu, mobile nav.
- **Font**: `Philosopher` (loaded from `assets/fonts/`). Used for headings and brand elements.
- **Body font**: System stack (`Segoe UI, Tahoma, Geneva, Verdana, sans-serif`).

### 3.5 Design System
- **Color palette**:
  - Primary (Gold): `#d4af37`
  - Background: `#0a0a12` (deep dark)
  - Secondary BG: `#151520`
  - Text: `#e0e0e0`
- **Aesthetic**: Dark, premium, spiritual. Subtle gold accents, glassmorphism, radial gradients.
- **No placeholder images** — use real assets or generate them.

### 3.6 Preserve User Guide Links
The User Guide pages currently link to external GitHub-hosted guides. **Do not change these links** until the user explicitly requests it.

---

## 4. SEO Requirements

### Implemented (Task 1 ✅)
- Expanded homepage content (600+ words) in EN/DE/RU.
- Updated meta titles, descriptions, keywords, Open Graph tags.
- `SoftwareApplication` JSON-LD structured data on homepages.
- Dedicated `whats_new.html` changelog pages in all languages.
- Version banner announcing v1.7.3.
- "Is LeelaClue for You?" targeting section.
- Internal links to Blog, User Guide, and Offline Game within body text.

### Implemented (Task 2 ✅)
- Sitemap overhauled: 33 canonical URLs across `/en/`, `/de/`, `/ru/` with full hreflang alternates. Root-level redirectors removed.
- FAQPage JSON-LD schema on all 3 FAQ pages (7 questions each: Platforms, Cost, Privacy, Languages, Rituals, What is Leela, Offline Game).
- SoftwareApplication JSON-LD verified on all 3 homepages.
- Hreflang tags added to all 33 HTML pages.
- Meta descriptions added to FAQ pages.
- See: `.agent/tasks/seo_2_technical_schema.md`

### Implemented (Task 3 ✅)
- robots.txt optimization (blocked .agent, tools, new_features).
- Image alt tag audit (100% coverage verified).
- Final SEO polish and validation.
- See: `.agent/tasks/seo_3_navigation_linking.md`

### Implemented (Task 4 ✅)
- Keyword optimization for: "Leela Clue" (two words), "Game of Life" / "Spiel des Lebens", "Game of Knowledge" / "Spiel des Wissens", and "Transformation Game".
- Integrated these terms into meta keywords, structured data (JSON-LD), and homepage body content across EN, DE, and RU.
- Bulk updated all 33 HTML files to include these terms in meta keywords for trilingual consistency.

### Implemented (Task 5 ✅)
- New Blog Post: "From Intuition to Algorithm: How LeelaClue Was Born".
- Automated selection of the latest blog post in `blog.js`.
- Red-Gold "New" indicators:
    - Pulsing dot (`.dot-new`) next to "Community" in the global navigation.
    - Premium teaser card (`.blog-teaser`) on all homepages with a Red-Gold gradient badge.

---

## 5. Common Patterns

### Batch-editing navigation across all files
Since there are 33 HTML files (11 per language), use a Node.js script for bulk edits:
```js
// Example: replace text in all HTML files
const fs = require('fs');
const path = require('path');
const root = 'c:/GitHub/leelaclue.github.io';
['en','de','ru'].forEach(lang => {
    const dir = path.join(root, lang);
    fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(file => {
        const fp = path.join(dir, file);
        let c = fs.readFileSync(fp, 'utf8');
        c = c.replace(/OLD_TEXT/g, 'NEW_TEXT');
        fs.writeFileSync(fp, c, 'utf8');
    });
});
```
**Important**: PowerShell on this machine has issues with `&&` chaining and `sed`. Use Node.js scripts or PowerShell `;` separator instead.

### Adding a new page
1. Create the page in `/en/`, `/de/`, `/ru/`.
2. Include the standard header (logo, nav, lang-switch, hamburger).
3. Include the standard footer (Disclaimer, Privacy, Impressum, Support links).
4. Add to navigation if needed (update all 33 files).
5. Add to `sitemap.xml` with hreflang alternates.

### Committing changes
- Use descriptive commit messages: `feat:`, `fix:`, `chore:`.
- Always `git add -A` before committing.
- Use `;` not `&&` to chain commands in PowerShell.

### Announcing new blog posts
When adding a new blog post:
1. Create the content files in `assets/posts/` (e.g., `new-post_en.js`, `new-post_de.js`, `new-post_ru.js`).
2. Update `assets/js/blog.js` and `assets/js/translations.js` with the new post metadata.
3. **Important**: Run `node build_blogs.js` to automatically generate the static HTML pages for the new blog post and update the `blog.html` index pages.
4. Run `node update_sitemap.js` to append the new blog post URLs to `sitemap.xml`.
5. Add the pulsing dot `<span class="dot-new"></span>` to the relevant navigation item in all 33 HTML files.
6. Add/Update a `.blog-teaser` card on the homepages (`/en/index.html`, etc.) for direct access.
7. Use the Red-Gold theme (`#e25822`) for "New" indicators to distinguish them from standard gold.

### Announcing other significant features
1. Add the pulsing dot `<span class="dot-new"></span>` to the relevant navigation item in all 33 HTML files.
2. Update the `whats_new.html` pages and any `.blog-teaser` cards if applicable.

---

## 6. Important Notes
- The **root-level HTML files** (`/index.html`, `/blog.html`, etc.) are simple JavaScript redirectors that detect the user's browser language and redirect to the appropriate `/en/`, `/de/`, or `/ru/` subfolder. Do not add content to these files.
- The `.agent/` and `new_features/` folders are gitignored.
