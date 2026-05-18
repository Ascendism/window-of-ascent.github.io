(function () {
  const newsList = document.getElementById("news-list");
  const newsEmpty = document.getElementById("news-empty");
  const discordLinks = document.querySelectorAll("[data-discord-link]");

  let chartJsPromise = null;

  function formatDate(iso) {
    const d = new Date(iso + "T12:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function compareManifest(a, b) {
    return String(b.date).localeCompare(String(a.date));
  }

  function dataUrl(filename) {
    return new URL("/data/" + filename, window.location.origin).href;
  }

  function siteUrl(path) {
    const clean = String(path || "").replace(/^\//, "");
    return new URL("/" + clean, window.location.origin).href;
  }

  async function loadJson(filename) {
    const path = dataUrl(filename);
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(path + " " + res.status);
    return res.json();
  }

  function ensureChartJs() {
    if (window.Chart) return Promise.resolve(window.Chart);
    if (!chartJsPromise) {
      chartJsPromise = new Promise(function (resolve, reject) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js";
        s.async = true;
        s.onload = function () {
          resolve(window.Chart);
        };
        s.onerror = function () {
          reject(new Error("Chart.js failed to load"));
        };
        document.head.appendChild(s);
      });
    }
    return chartJsPromise;
  }

  window.woaNewsChartReady = ensureChartJs();

  function appendNewsScripts(fragmentRoot, hostArticle) {
    fragmentRoot.querySelectorAll("script[data-woa-news-script]").forEach(function (oldScript) {
      const s = document.createElement("script");
      s.setAttribute("data-woa-news-script", "");
      if (oldScript.src) {
        s.src = oldScript.src;
        s.async = oldScript.async;
      } else {
        s.textContent = oldScript.textContent;
      }
      hostArticle.appendChild(s);
    });
  }

  function adoptNewsStyles(articleRoot, hostArticle) {
    articleRoot.querySelectorAll("style[data-woa-news-style]").forEach(function (styleEl) {
      hostArticle.appendChild(styleEl.cloneNode(true));
    });
  }

  async function embedNewsArticle(meta, htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const fragmentRoot = doc.querySelector("[data-woa-news-article]");

    if (!fragmentRoot) {
      throw new Error("Missing [data-woa-news-article] root in " + meta.file);
    }

    const host = document.createElement("article");
    host.className = "news-item news-item--embed";
    host.id = meta.id || fragmentRoot.getAttribute("data-woa-news-id") || "";
    host.dataset.newsId = host.id;

    const time = document.createElement("time");
    time.dateTime = meta.date || "";
    time.className = "news-date";
    time.textContent = meta.date ? formatDate(meta.date) : "";

    const titleEl = document.createElement("h3");
    titleEl.className = "news-title";
    titleEl.textContent = meta.title || "Untitled";

    if (meta.summary) {
      const deck = document.createElement("p");
      deck.className = "news-summary news-summary--deck";
      deck.textContent = meta.summary;
      host.append(time, titleEl, deck);
    } else {
      host.append(time, titleEl);
    }

    const bodySlot = document.createElement("div");
    bodySlot.className = "news-embed-body";

    const content = fragmentRoot.querySelector(".woa-news-body");
    if (content) {
      bodySlot.appendChild(document.importNode(content, true));
    } else {
      bodySlot.appendChild(
        document.importNode(fragmentRoot, true)
      );
    }

    adoptNewsStyles(fragmentRoot, host);
    host.appendChild(bodySlot);
    newsList.appendChild(host);

    if (fragmentRoot.hasAttribute("data-requires-chartjs")) {
      await ensureChartJs();
    }

    appendNewsScripts(fragmentRoot, host);
  }

  async function renderNews(manifest) {
    if (!newsList) return;
    newsList.replaceChildren();

    const articles = (manifest && manifest.articles) || [];
    if (!articles.length) {
      if (newsEmpty) newsEmpty.hidden = false;
      return;
    }

    if (newsEmpty) newsEmpty.hidden = true;

    const sorted = articles.slice().sort(compareManifest);

    for (const meta of sorted) {
      try {
        const url = siteUrl(meta.file);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(url + " " + res.status);
        const html = await res.text();
        const id =
          meta.id ||
          meta.file.replace(/^news\//, "").replace(/\.html$/, "");
        await embedNewsArticle({ ...meta, id }, html);
      } catch (err) {
        const errArticle = document.createElement("article");
        errArticle.className = "news-item news-item--error";
        errArticle.innerHTML =
          "<h3 class=\"news-title\">" +
          (meta.title || meta.file) +
          "</h3><p class=\"news-summary\">Could not load this article.</p>";
        newsList.appendChild(errArticle);
        console.error(err);
      }
    }
  }

  function applyDiscord(url) {
    if (!url || url.includes("REPLACE_WITH_YOUR_INVITE")) return;
    discordLinks.forEach(function (el) {
      el.href = url;
      el.removeAttribute("aria-disabled");
    });
  }

  async function init() {
    const tasks = [];

    if (newsList) {
      tasks.push(
        loadJson("news.json")
          .then(renderNews)
          .catch(function () {
            if (newsEmpty) {
              newsEmpty.hidden = false;
              newsEmpty.textContent = "News could not be loaded. Try again later.";
            }
          })
      );
    }

    if (discordLinks.length) {
      tasks.push(
        loadJson("site.json")
          .then(function (cfg) {
            applyDiscord(cfg && cfg.discordInviteUrl);
          })
          .catch(function () {})
      );
    }

    await Promise.all(tasks);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
