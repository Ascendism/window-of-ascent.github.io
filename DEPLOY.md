# Publishing the public site

The **project workspace stays private**. Only `docs/` is the public face (landing page, thesis, status). Manuscripts, plans, and local profiles never ship here.

## Live URLs

| What | URL |
|------|-----|
| Private workspace | https://github.com/Ascendism/WindowOfAscent |
| Public site repo | https://github.com/Ascendism/ascendism.github.io |
| **Public site** | **https://ascendism.github.io/** |

### Why the repo must be named `ascendism.github.io`

GitHub has two Pages URL shapes:

| Repo name | Site URL |
|-----------|----------|
| `ascendism.github.io` | `https://ascendism.github.io/` ← **use this** |
| `window-of-ascent.github.io` (or anything else) | `https://ascendism.github.io/window-of-ascent.github.io/` ← redundant, awkward |

The `.github.io` suffix only belongs on a **user/org site repo** whose name is exactly `<account>.github.io`. Any other name is a *project* site and gets an extra path segment.

## Layout

| Repository | Visibility | Contents |
|------------|------------|----------|
| `WindowOfAscent` | **Private** | Full project |
| `ascendism.github.io` | **Public** | Copy of `docs/` at repo root |

On GitHub Free, Pages on a private repo are only visible to collaborators. The small public repo is the world-readable URL.

## After editing the book manuscript

Regenerate the public book files from `BOOK/manuscript/`:

```powershell
cd c:\app\WindowOfAscent
.\scripts\build-book-site.ps1
```

This writes `docs/book/read/` (`manifest.json`, `full.md`, per-chapter markdown with YAML front matter). Commit those outputs with your manuscript changes.

## After editing `docs/` in the private repo

From the repo root:

```bash
npm run deploy
```

**`npm run deploy`** = copy `docs/` to your local public clone **and** `git commit` + `git push` — that is what updates https://ascendism.github.io/

**`npm run sync`** = copy only (local folder). The live site will **not** change until you push.

If the manuscript changed first: `npm run build:book`, then `npm run deploy`.

Override clone path: `set SITE_TARGET=c:\app\ascendism.github.io` then `npm run deploy`.

Footer link in `docs/index.html` points at the public site repo for issues.

## Custom domain (optional)

Add `CNAME` at the root of the public site repo (e.g. `windowofascent.org`), configure DNS, then enable the domain in that repo’s Pages settings.

## What belongs in `docs/`

- `index.html`, `css/`, `assets/`, `js/`
- `data/news.json` — news manifest (lists `news/*.html` fragments; home page embeds them)
- `news/` — one HTML fragment per article (`_template.html` documents format v1)
- `assets/news_imgs/` — images referenced from article HTML
- `data/site.json` — `discordInviteUrl` for nav/footer Discord links
- `resources/` — resources hub page
- `book/` — reader UI + built `read/*.md` (not raw `BOOK/manuscript/` sources)
- `.nojekyll`

### Updating news

1. Copy `docs/news/_template.html` → `docs/news/YYYY-MM-DD-slug.html`.
2. Write the fragment (prose, `<style data-woa-news-style>`, images, optional Chart.js in `<script data-woa-news-script>`). Format rules are in the template header comment.
3. Register in `docs/data/news.json`:

| Field | Required | Notes |
|-------|----------|-------|
| `file` | yes | Path under site root, e.g. `news/2026-05-17-slug.html` |
| `date` | yes | ISO `YYYY-MM-DD` (sort key; should match `data-woa-news-date` on the fragment) |
| `title` | yes | Headline on the home page |
| `summary` | yes | Deck line above the embedded body |

Articles embed **inline** on the home page (not iframes, not separate pages). Images use root-relative paths such as `/assets/news_imgs/vis1.png`. Chart.js loads from CDN once when any article sets `data-requires-chartjs`.

Then run `sync-public-site.ps1` and push the public repo.

### Discord invite

Set `discordInviteUrl` in `docs/data/site.json` to your permanent invite URL, then sync.

Do **not** copy private planning (`PLAN.md`), local profiles, or `.cortex/` into the public repo. Manuscript **sources** stay in the private repo; only the **built** `docs/book/read/` tree ships publicly.

### Agent-friendly layout (`docs/book/read/`)

| File | Use |
|------|-----|
| `manifest.json` | Chapter index, titles, word counts, paths |
| `full.md` | Entire draft concatenated |
| `{id}.md` | One section each; YAML front matter (`id`, `title`, `status`) |

Human reader: **https://ascendism.github.io/book/**
