(function () {
  const newsList = document.getElementById("news-list");
  const newsEmpty = document.getElementById("news-empty");
  const discordLinks = document.querySelectorAll("[data-discord-link]");

  let chartJsPromise = null;
  let videoJsPromise = null;

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

  function ensureVideoJs() {
    if (window.videojs) return Promise.resolve(window.videojs);
    if (!videoJsPromise) {
      videoJsPromise = new Promise(function (resolve, reject) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href =
          "https://cdn.jsdelivr.net/npm/video.js@8.21.0/dist/video-js.min.css";
        document.head.appendChild(css);

        const vjs = document.createElement("script");
        vjs.src =
          "https://cdn.jsdelivr.net/npm/video.js@8.21.0/dist/video.min.js";
        vjs.async = true;

        const yt = document.createElement("script");
        yt.src =
          "https://cdn.jsdelivr.net/npm/videojs-youtube@3.0.1/dist/Youtube.min.js";
        yt.async = true;

        vjs.onload = function () {
          yt.onload = function () {
            resolve(window.videojs);
          };
          yt.onerror = function () {
            reject(new Error("videojs-youtube failed to load"));
          };
          document.head.appendChild(yt);
        };
        vjs.onerror = function () {
          reject(new Error("Video.js failed to load"));
        };
        document.head.appendChild(vjs);
      });
    }
    return videoJsPromise;
  }

  function youtubeWatchUrl(youtubeId) {
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(youtubeId);
  }

  function iconSvg(name) {
    const icons = {
      share:
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',
      youtube:
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z"/></svg>',
      link:
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3.9 12c0-1.7 1.4-3.1 3.1-3.1h4V7H7c-2.8 0-5 2.2-5 5s2.2 5 5 5h4v-1.9H7c-1.7 0-3.1-1.4-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1h-4V17h4c2.8 0 5-2.2 5-5s-2.2-5-5-5z"/></svg>',
    };
    return icons[name] || "";
  }

  function actionButton(label, iconName, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "learn-more-hero__action";
    btn.setAttribute("aria-label", label);
    btn.title = label;
    btn.innerHTML = iconSvg(iconName);
    btn.addEventListener("click", onClick);
    return btn;
  }

  function flashAction(btn, message) {
    const prev = btn.title;
    btn.title = message;
    btn.setAttribute("aria-label", message);
    window.setTimeout(function () {
      btn.title = prev;
      btn.setAttribute("aria-label", prev);
    }, 2000);
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      flashAction(btn, "Copied");
    } catch (err) {
      console.error(err);
    }
  }

  async function mountLearnMoreHero(learnMore, articleMeta, afterArticle) {
    if (!learnMore || !learnMore.youtubeId || !newsList) return;

    const videoUrl =
      learnMore.youtubeUrl || youtubeWatchUrl(learnMore.youtubeId);
    const playerId =
      "learn-more-" + (articleMeta.id || learnMore.youtubeId).replace(/[^\w-]/g, "-");

    const aside = document.createElement("aside");
    aside.className = "learn-more-hero";
    aside.id = playerId + "-hero";
    aside.setAttribute("aria-labelledby", playerId + "-headline");

    const bar = document.createElement("div");
    bar.className = "learn-more-hero__bar";

    const headline = document.createElement("h4");
    headline.className = "learn-more-hero__headline";
    headline.id = playerId + "-headline";
    headline.textContent =
      learnMore.headline || "Want to learn more?";

    const actions = document.createElement("div");
    actions.className = "learn-more-hero__actions";

    actions.append(
      actionButton("Share video", "share", async function (e) {
        const btn = e.currentTarget;
        const payload = {
          title: headline.textContent,
          url: videoUrl,
        };
        if (navigator.share) {
          try {
            await navigator.share(payload);
          } catch (err) {
            if (err && err.name !== "AbortError") console.error(err);
          }
        } else {
          copyText(videoUrl, btn);
        }
      }),
      actionButton("Open on YouTube", "youtube", function () {
        window.open(videoUrl, "_blank", "noopener,noreferrer");
      }),
      actionButton("Copy video link", "link", function (e) {
        copyText(videoUrl, e.currentTarget);
      })
    );

    bar.append(headline, actions);

    const playerWrap = document.createElement("div");
    playerWrap.className = "learn-more-hero__player";

    const video = document.createElement("video");
    video.id = playerId;
    video.className = "video-js learn-more-hero__video";

    playerWrap.appendChild(video);
    aside.append(bar, playerWrap);

    if (afterArticle) {
      afterArticle.appendChild(aside);
    } else if (newsList) {
      newsList.appendChild(aside);
    }

    try {
      const videojs = await ensureVideoJs();
      videojs(playerId, {
        techOrder: ["youtube"],
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        poster: false,
        fluid: false,
        fill: true,
        sources: [
          {
            type: "video/youtube",
            src: videoUrl,
          },
        ],
        youtube: {
          ytControls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
      });
    } catch (err) {
      console.error(err);
      const fallback = document.createElement("p");
      fallback.className = "learn-more-hero__fallback";
      fallback.innerHTML =
        'Video unavailable. <a href="' +
        videoUrl +
        '" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>.';
      playerWrap.replaceChildren(fallback);
    }
  }

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

  function newsArticleId(meta) {
    return (
      meta.id ||
      String(meta.file || "")
        .replace(/^news\//, "")
        .replace(/\.html$/, "")
    );
  }

  function isNewsPreviewMode() {
    return newsList && newsList.dataset.newsPreview === "true";
  }

  function buildNewsHeader(meta) {
    const time = document.createElement("time");
    time.dateTime = meta.date || "";
    time.className = "news-date";
    time.textContent = meta.date ? formatDate(meta.date) : "";

    const titleEl = document.createElement("h3");
    titleEl.className = "news-title";
    titleEl.textContent = meta.title || "Untitled";

    const parts = [time, titleEl];
    if (meta.summary) {
      const deck = document.createElement("p");
      deck.className = "news-summary news-summary--deck";
      deck.textContent = meta.summary;
      parts.push(deck);
    }
    return parts;
  }

  function buildNewsPreviewCard(meta) {
    const id = newsArticleId(meta);
    const host = document.createElement("article");
    host.className = "news-item news-item--preview";
    host.id = "news-" + id;
    host.dataset.newsId = id;

    const actions = document.createElement("p");
    actions.className = "news-actions";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "news-expand";
    btn.textContent = "Read full article";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", host.id + "-body");
    btn.addEventListener("click", function () {
      expandNewsItem(host, { ...meta, id }, btn);
    });

    actions.appendChild(btn);
    host.append(...buildNewsHeader(meta), actions);
    return host;
  }

  async function fetchNewsHtml(meta) {
    const url = siteUrl(meta.file);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(url + " " + res.status);
    return res.text();
  }

  async function populateNewsBody(host, meta, htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const fragmentRoot = doc.querySelector("[data-woa-news-article]");

    if (!fragmentRoot) {
      throw new Error("Missing [data-woa-news-article] root in " + meta.file);
    }

    const bodySlot = document.createElement("div");
    bodySlot.className = "news-embed-body";
    bodySlot.id = host.id + "-body";

    const content = fragmentRoot.querySelector(".woa-news-body");
    if (content) {
      bodySlot.appendChild(document.importNode(content, true));
    } else {
      bodySlot.appendChild(document.importNode(fragmentRoot, true));
    }

    adoptNewsStyles(fragmentRoot, host);
    host.appendChild(bodySlot);
    host.classList.remove("news-item--preview");
    host.classList.add("news-item--embed");

    if (fragmentRoot.hasAttribute("data-requires-chartjs")) {
      await ensureChartJs();
    }

    appendNewsScripts(fragmentRoot, host);

    if (meta.learnMore) {
      await mountLearnMoreHero(meta.learnMore, meta, host);
    }

    return host;
  }

  async function expandNewsItem(host, meta, btn) {
    if (host.dataset.expanded === "true") return;

    btn.disabled = true;
    const prevLabel = btn.textContent;
    btn.textContent = "Loading…";

    try {
      const html = await fetchNewsHtml(meta);
      await populateNewsBody(host, meta, html);
      host.dataset.expanded = "true";
      btn.setAttribute("aria-expanded", "true");
      const actions = btn.closest(".news-actions");
      if (actions) actions.remove();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = prevLabel;
      console.error(err);
    }
  }

  async function embedNewsArticle(meta, htmlText) {
    const id = newsArticleId(meta);
    const host = document.createElement("article");
    host.className = "news-item news-item--embed";
    host.id = "news-" + id;
    host.dataset.newsId = id;
    host.append(...buildNewsHeader(meta));
    newsList.appendChild(host);
    await populateNewsBody(host, { ...meta, id }, htmlText);
    return host;
  }

  function expandNewsFromHash(sorted) {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("news-")) return;

    const host = document.getElementById(hash);
    if (!host || host.dataset.expanded === "true") return;

    const id = hash.replace(/^news-/, "");
    const meta = sorted.find(function (item) {
      return newsArticleId(item) === id;
    });
    if (!meta) return;

    const btn = host.querySelector(".news-expand");
    if (btn) {
      expandNewsItem(host, { ...meta, id: newsArticleId(meta) }, btn).then(function () {
        host.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
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
    const preview = isNewsPreviewMode();

    for (const meta of sorted) {
      const id = newsArticleId(meta);
      const enriched = { ...meta, id };

      try {
        if (preview) {
          newsList.appendChild(buildNewsPreviewCard(enriched));
        } else {
          const html = await fetchNewsHtml(enriched);
          await embedNewsArticle(enriched, html);
        }
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

    if (preview) expandNewsFromHash(sorted);
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
