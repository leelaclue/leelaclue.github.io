# LeelaClue Website — Project Instructions

> **These instructions are for any AI agent working on the LeelaClue GitHub Pages website.**
> Read this file in full before making any changes.

---

## 1. Project Overview

LeelaClue is a **mindfulness and self-discovery mobile app** inspired by the ancient Indian game of Leela (Snakes & Arrows). This repository hosts the **marketing website** at `https://leelaclue.github.io`.

The website is a **static site** (no build step, no framework). It is served directly by GitHub Pages.

**Current App Version**: v1.6.8

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
- Version banner announcing v1.6.8.
- "Is LeelaClue for You?" targeting section.
- Internal links to Blog, User Guide, and Offline Game within body text.

### Pending (Task 2)
- Sitemap overhaul with hreflang alternates.
- FAQPage JSON-LD schema on FAQ pages.
- Hreflang tag verification across all pages.
- See: `.agent/tasks/seo_2_technical_schema.md`

### Pending (Task 3)
- robots.txt optimization.
- Image alt tag audit.
- Final SEO polish and validation.
- See: `.agent/tasks/seo_3_navigation_linking.md`

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

---

## 6. Important Notes
- The **root-level HTML files** (`/index.html`, `/blog.html`, etc.) are simple JavaScript redirectors that detect the user's browser language and redirect to the appropriate `/en/`, `/de/`, or `/ru/` subfolder. Do not add content to these files.
- The branch is `feature_redesign`.
- The `.agent/` and `new_features/` folders are gitignored.
