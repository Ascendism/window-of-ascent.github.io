(function () {
  const navList = document.getElementById("nav-list");
  const content = document.getElementById("book-content");
  const partCount = document.getElementById("part-count");
  const titleEl = document.getElementById("book-title");
  const subtitleEl = document.getElementById("book-subtitle");

  function stripFrontMatter(md) {
    if (!md.startsWith("---")) return md;
    const end = md.indexOf("\n---", 3);
    if (end === -1) return md;
    return md.slice(end + 4).replace(/^\s+/, "");
  }

  function partFromHash() {
    const h = location.hash.replace(/^#/, "");
    return h || null;
  }

  async function loadManifest() {
    const res = await fetch("read/manifest.json");
    if (!res.ok) throw new Error("manifest.json not found — run scripts/build-book-site.ps1");
    return res.json();
  }

  async function loadPart(file) {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Failed to load " + file);
    return stripFrontMatter(await res.text());
  }

  function renderNav(parts, activeId) {
    navList.innerHTML = "";
    parts.forEach(function (p) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + p.id;
      a.textContent = p.title.replace(/^Chapter \d+ — /, "Ch. ").replace(/^Introduction — /, "Intro · ");
      if (p.id === activeId) a.setAttribute("aria-current", "true");
      li.appendChild(a);
      navList.appendChild(li);
    });
  }

  async function showPart(manifest, id) {
    const part = manifest.parts.find(function (p) { return p.id === id; }) || manifest.parts[0];
    if (!part) {
      content.innerHTML = '<p class="book-error">No chapters in manifest.</p>';
      return;
    }

    renderNav(manifest.parts, part.id);
    history.replaceState(null, "", "#" + part.id);

    content.innerHTML = '<p class="loading">Loading…</p>';
    try {
      const md = await loadPart(part.file);
      content.innerHTML = marked.parse(md);
      document.title = part.title + " — Window of Ascent";
    } catch (e) {
      content.innerHTML = '<p class="book-error">' + e.message + "</p>";
    }
  }

  async function init() {
    try {
      const manifest = await loadManifest();
      if (manifest.title) titleEl.textContent = manifest.title;
      if (manifest.subtitle) subtitleEl.textContent = manifest.subtitle + " · draft";
      const n = manifest.parts.length;
      const words = manifest.parts.reduce(function (s, p) { return s + (p.words || 0); }, 0);
      partCount.textContent = n + " section" + (n === 1 ? "" : "s") + " · ~" + words.toLocaleString() + " words";

      const id = partFromHash();
      await showPart(manifest, id);

      window.addEventListener("hashchange", function () {
        showPart(manifest, partFromHash());
      });
    } catch (e) {
      content.innerHTML = '<p class="book-error">' + e.message + "</p>";
    }
  }

  init();
})();
