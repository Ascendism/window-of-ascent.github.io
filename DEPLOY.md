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

## After editing `docs/` in the private repo

```powershell
cd c:\app\WindowOfAscent
.\scripts\sync-public-site.ps1 -Target "c:\app\ascendism.github.io"
cd c:\app\ascendism.github.io
git add -A
git commit -m "Update public site"
git push
```

Local clone path: `c:\app\ascendism.github.io` (rename from `window-of-ascent.github.io` if you still have the old folder).

Footer link in `docs/index.html` points at the public site repo for issues.

## Custom domain (optional)

Add `CNAME` at the root of the public site repo (e.g. `windowofascent.org`), configure DNS, then enable the domain in that repo’s Pages settings.

## What belongs in `docs/`

- `index.html`, `css/`, `assets/`
- `.nojekyll`

Do **not** copy manuscript drafts, `PLAN.md`, `land_search_profile.local.txt`, or `.cortex/` into the public repo.
