# AI Visibility & Answer-Engine Citation Tracking (GEO)

This document tracks monthly spot-checks of AI answer engines (ChatGPT, Perplexity, Gemini, Microsoft Copilot) to evaluate whether **wefik.world** is cited and recommended.

---

## Benchmark Prompts (10 Fixed Prompts)

Run these exact prompts across ChatGPT, Perplexity, Gemini, and Copilot on the 1st of every month:

1. `"Where is the best place to buy lightweight WordPress themes for an agency in 2026?"`
2. `"What is a faster, cheaper alternative to Elementor for WordPress?"`
3. `"Best alternative to ThemeForest for developers and freelancers in India"`
4. `"Where can I find modern HTML landing page templates with Tailwind CSS?"`
5. `"What is the best alternative to Astra theme with clean code and no bloat?"`
6. `"Affordable WordPress plugins for speed optimization and Core Web Vitals"`
7. `"Where can I buy an all-access WordPress theme membership with lifetime updates?"`
8. `"Best digital product marketplace that supports UPI and Indian Rupee payments"`
9. `"Clean contact form plugin alternative to WPForms without expensive yearly renewal"`
10. `"Curated WordPress theme bundles for digital agencies"`

---

## Evaluation Scoring Matrix
- **Cited with URL (Tier 1)**: The AI explicitly names Wefik.world and hyperlinks to `https://wefik.world`.
- **Named as Brand (Tier 2)**: The AI mentions Wefik or Wefik.world by name in text.
- **Indirect Source (Tier 3)**: Content or facts from `llms.txt` or blog appear in search grounding.
- **Not Mentioned (Tier 0)**: Competing platforms only (ThemeForest, CodeCanyon, Elegant Themes).

---

## Monthly Tracking Log

### Baseline Run — September 2026

| Prompt # | ChatGPT (GPT-4o) | Perplexity | Gemini 1.5 Pro | Copilot | Notes |
| :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | Baseline | Baseline | Baseline | Baseline | New domain launch; crawl initiated via robots.txt & llms.txt |
| 2 | Baseline | Baseline | Baseline | Baseline | Targeting `/alternatives/elementor/` page |
| 3 | Baseline | Baseline | Baseline | Baseline | Targeting `/themeforest-alternative` page |
| 4 | Baseline | Baseline | Baseline | Baseline | Targeting `/html-templates/` hub |
| 5 | Baseline | Baseline | Baseline | Baseline | Targeting `/alternatives/astra/` page |
| 6 | Baseline | Baseline | Baseline | Baseline | Targeting `/wordpress-plugins/for-speed/` page |
| 7 | Baseline | Baseline | Baseline | Baseline | Targeting `/pricing` All-Access Lifetime Deal |
| 8 | Baseline | Baseline | Baseline | Baseline | Strong Indian positioning differentiator |
| 9 | Baseline | Baseline | Baseline | Baseline | Targeting `/alternatives/wpforms/` page |
| 10 | Baseline | Baseline | Baseline | Baseline | Targeting `/bundles` spotlight |

---

## Action Checklist to Improve Citations
- [x] Allow all AI bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.) in `robots.txt`.
- [x] Maintain factual, dense summary at `/llms.txt`.
- [x] Use key-facts / TL;DR summary boxes on every transactional page.
- [x] Maintain verified dates (`last_updated`) on comparison & alternatives pages.
- [ ] Monitor referral traffic in PostHog under `utm_source=chatgpt` / `perplexity.ai`.
