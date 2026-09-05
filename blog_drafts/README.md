# Blog Post Drafts — Option A (3-Part Arc)

These drafts are stored here in `blog_drafts/` for review and editing before being published to the website. **None of these files are integrated into the live site yet.**

---

## Post 1: The St-O-R Framework

* **English:** [`01_the_stor_framework_en.md`](01_the_stor_framework_en.md) — *The St-O-R Framework: Your Intuition Has the Answer. Your Brain Won't Quit.* (~920 words)
* **German:** [`01_the_stor_framework_de.md`](01_the_stor_framework_de.md) — *Das St-O-R-Modell: Deine Intuition kennt die Antwort. Dein Verstand gibt einfach keine Ruhe.* (~920 words)
* **Russian:** [`01_the_stor_framework_ru.md`](01_the_stor_framework_ru.md) — *Модель St-O-R: Твоя интуиция знает ответ. Твой ум просто не умолкает.* (~950 words)

> **Theme / Role:** The psychology of choice, the coin flip, roots of Leela, weekend sessions vs. Tuesday morning reality, birth of the 3-card St-O-R draw, inward queries, and Jungian synchronicity.  
> **Landing page pairing:** Section 2 (**The S·O·R Framework** / `landing_sor_[lang].md`).

---

## Remaining Posts (English Drafts)

* **Post 2:** [`02_the_six_step_discipline.md`](02_the_six_step_discipline.md) — *The 6-Step Discipline: From a Fleeting Flash of Insight to Daily Practice* (~870 words)
  * *Landing page pairing:* Section 3 (**The Six Steps Practice** / `landing_practice_[lang].md`).
* **Post 3:** [`03_annas_breakthrough.md`](03_annas_breakthrough.md) — *Anna's Breakthrough: How Three Leela Cards Untangled Corporate Paralysis* (~960 words)
  * *Landing page pairing:* Section 4 (**Case Study: Anna** / `landing_anna_[lang].md`).

---

## When You Are Ready to Publish

Once you review and approve these drafts:
1. We will format them into `assets/posts/<id>_<lang>.js`.
2. Register the titles and metadata in `assets/js/translations.js` and `assets/js/blog.js`.
3. Run `node build_blogs.js` to compile the static pages.
4. Update `sitemap.xml` (ensuring LF-only line endings).
