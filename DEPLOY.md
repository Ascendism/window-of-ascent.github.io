# Publishing the public site

The **project workspace stays private**. Only `docs/` is the public face (landing page, thesis, status). Manuscripts, plans, and local profiles never ship here.

## Live URLs (configured)

| What | URL |
|------|-----|
| Private workspace | https://github.com/Ascendism/WindowOfAscent |
| Public site repo | https://github.com/Ascendism/window-of-ascent.github.io |
| Public site (Pages) | https://ascendism.github.io/window-of-ascent.github.io/ |

## Recommended layout (works on GitHub Free)

| Repository | Visibility | Contents |
|------------|------------|----------|
| `WindowOfAscent` (this repo) | **Private** | Full project |
| `window-of-ascent.github.io` (or `window-of-ascent-site`) | **Public** | Copy of `docs/` only → site root |

**Why two repos:** On the free plan, GitHub Pages for a private repo is only visible to people with repo access. A small public repo gives you a world-readable URL without exposing the manuscript.

### 1. Create the private project repo

```powershell
cd c:\app\WindowOfAscent
git add .
git commit -m "Initial private workspace"
gh repo create WindowOfAscent --private --source=. --remote=origin --push
```

### 2. Create the public site repo

```powershell
$site = "c:\app\window-of-ascent.github.io"   # or your chosen path
New-Item -ItemType Directory -Force -Path $site | Out-Null
Copy-Item -Path "c:\app\WindowOfAscent\docs\*" -Destination $site -Recurse -Force
cd $site
git init
git add .
git commit -m "Public landing page"
gh repo create window-of-ascent.github.io --public --source=. --remote=origin --push
```

### 3. Enable GitHub Pages on the **public** site repo

1. GitHub → **public site repo** → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: `main` (or `master`), folder: **`/ (root)`**
4. Save. Site URL (examples):
   - `https://<user>.github.io/window-of-ascent.github.io/` (project-style name)
   - Or rename repo to `<user>.github.io` for `https://<user>.github.io/`

### 4. After edits to `docs/` in the private repo

From the private repo:

```powershell
.\scripts\sync-public-site.ps1 -Target "c:\app\window-of-ascent.github.io"
cd c:\app\window-of-ascent.github.io
git add -A
git commit -m "Update public site"
git push
```

Set `repo` in `docs/index.html` (footer script) to the public site repo URL so visitors can open issues there.

---

## Alternative: Pages from this private repo (GitHub Pro+)

If you have **GitHub Pro** (or Team/Enterprise):

1. Push this private repo to GitHub.
2. **Settings** → **Pages** → Source: **GitHub Actions** or **Deploy from branch** → folder **`/docs`**
3. Set **Pages visibility** to **Public**.

You can still keep a separate public repo later for issue tracking without exposing the monorepo.

---

## What belongs in `docs/`

- `index.html`, `css/`, `assets/` (only images cleared for public use)
- `.nojekyll` (static HTML, no Jekyll)

Do **not** copy manuscript drafts, `PLAN.md`, `land_search_profile.local.txt`, or `.cortex/` into the public repo.

## Custom domain (optional)

Add `docs/CNAME` containing your domain (e.g. `windowofascent.org`), configure DNS at your registrar, then enable the domain in the **public** repo’s Pages settings.
