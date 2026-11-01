/* Redesign (2026) site script. Vanilla JS, no dependencies.
   Theme toggle, navigation, search, filters, copy buttons, counters, map, co-author graph,
   GitHub stats, the contact and subscribe forms and anonymous event counts. Every feature checks that its markup exists first. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  // Interface strings come from a JSON block (not executed, so no inline script is needed under the CSP)
  var T = window.RD_I18N || {};
  try { var i18nEl = doc.getElementById("rd-i18n"); if (i18nEl) T = JSON.parse(i18nEl.textContent) || T; } catch (e) { /* keep defaults */ }
  var BASE = root.getAttribute("data-base") || "";
  var LANG = root.getAttribute("data-lang") || "en";
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fold(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    });
  });

  /* ---------- Navigation ---------- */
  var header = $("[data-header]");
  var navBtn = $("[data-nav-open]");
  function closeSubs(except) {
    $$(".nav__item.has-sub.is-open").forEach(function (li) {
      if (li === except) return;
      li.classList.remove("is-open");
      var b = $(".nav__toggle", li); if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  $$(".nav__toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.parentNode, open = !li.classList.contains("is-open");
      closeSubs(li);
      li.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  doc.addEventListener("click", function (e) { if (!e.target.closest(".nav__item.has-sub")) closeSubs(); });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = $(".nav__item.is-open .nav__toggle"); closeSubs(); if (open) open.focus();
      if (header && header.classList.contains("is-open")) toggleNav(false);
    }
  });
  function toggleNav(open) {
    if (!header || !navBtn) return;
    header.classList.toggle("is-open", open);
    navBtn.setAttribute("aria-expanded", String(open));
    doc.body.classList.toggle("nav-locked", open);
  }
  if (navBtn) navBtn.addEventListener("click", function () { toggleNav(!header.classList.contains("is-open")); });

  /* ---------- Search (Ctrl/Cmd + K or /) ---------- */
  var search = $("[data-search]");
  var sInput = $("#site-search"), sList = $("#site-search-results"), sHint = $("[data-search-hint]");
  var index = null, loading = null, sel = -1, lastFocus = null;
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(BASE + "/search.json").then(function (r) { return r.json(); }).then(function (d) {
        index = d.map(function (x) { x.f = fold(x.t + " " + (x.d || "") + " " + (x.k || "")); return x; });
        return index;
      }).catch(function () { index = []; return index; });
    }
    return loading;
  }
  function openSearch() {
    if (!search) return;
    var fromNav = header && header.classList.contains("is-open");
    if (fromNav) toggleNav(false); // opened from the mobile menu: close the menu first
    lastFocus = fromNav ? navBtn : doc.activeElement;
    search.hidden = false; doc.body.classList.add("nav-locked");
    sInput.value = ""; render([]); sHint.textContent = sHint.getAttribute("data-hint");
    setTimeout(function () { sInput.focus(); }, 10);
    loadIndex();
  }
  function closeSearch() {
    if (!search || search.hidden) return;
    search.hidden = true; doc.body.classList.remove("nav-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function render(items) {
    sel = items.length ? 0 : -1;
    sList.innerHTML = items.map(function (x, i) {
      return '<li><a role="option" href="' + esc(x.u.indexOf("http") === 0 ? x.u : BASE + x.u) + '" aria-selected="' + (i === 0) + '">' +
        '<span class="kind">' + esc(x.g || "") + "</span><b>" + esc(x.t) + "</b>" + (x.d ? "<small>" + esc(x.d) + "</small>" : "") + "</a></li>";
    }).join("");
  }
  function runSearch() {
    var q = fold(sInput.value.trim());
    if (q.length < 2) { render([]); sHint.hidden = false; sHint.textContent = sHint.getAttribute("data-hint"); return; }
    loadIndex().then(function (idx) {
      var words = q.split(/\s+/);
      var hits = idx.filter(function (x) { return words.every(function (w) { return x.f.indexOf(w) !== -1; }); });
      hits.sort(function (a, b) {
        var la = a.l === LANG ? 0 : 1, lb = b.l === LANG ? 0 : 1;
        if (la !== lb) return la - lb;
        var ta = fold(a.t).indexOf(q) !== -1 ? 0 : 1, tb = fold(b.t).indexOf(q) !== -1 ? 0 : 1;
        return ta - tb;
      });
      render(hits.slice(0, 12));
      sHint.hidden = hits.length > 0;
      if (!hits.length) sHint.textContent = sHint.getAttribute("data-empty");
    });
  }
  if (search) {
    $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", openSearch); });
    $$("[data-search-close]", search).forEach(function (b) { b.addEventListener("click", closeSearch); });
    sInput.addEventListener("input", runSearch);
    sInput.addEventListener("keydown", function (e) {
      var links = $$("a", sList);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!links.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.setAttribute("aria-selected", String(i === sel)); });
        links[sel].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && links[sel]) { e.preventDefault(); window.location.href = links[sel].href; }
    });
    doc.addEventListener("keydown", function (e) {
      var typing = /input|textarea|select/i.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); search.hidden ? openSearch() : closeSearch(); }
      else if (e.key === "/" && !typing && search.hidden) { e.preventDefault(); openSearch(); }
      else if (e.key === "Escape") closeSearch();
    });
  }

  /* ---------- Filters (chips + text) ---------- */
  $$("[data-filter-for]").forEach(function (bar) {
    var scope = doc.getElementById(bar.getAttribute("data-filter-for"));
    if (!scope) return;
    var chips = $$("[data-key]", bar), input = $("[data-filter-search]", bar), empty = $("[data-filter-empty]", scope);
    var key = "all";
    function apply() {
      var q = input ? fold(input.value.trim()) : "", shown = 0;
      $$("[data-filter-item]", scope).forEach(function (it) {
        var tags = (it.getAttribute("data-tags") || "").split(/\s+/);
        var ok = (key === "all" || tags.indexOf(key) !== -1) && (!q || fold(it.getAttribute("data-text") || it.textContent).indexOf(q) !== -1);
        it.hidden = !ok; if (ok) shown++;
      });
      $$("[data-filter-section]", scope).forEach(function (sec) {
        sec.hidden = !$$("[data-filter-item]", sec).some(function (it) { return !it.hidden; });
      });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        key = c.getAttribute("data-key");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
  });

  /* ---------- "On this page" side column (shown on wide screens by CSS) ---------- */
  var aside = $("[data-page-aside]"), layout = $("[data-page-layout]");
  if (aside && layout) (function () {
    var body = $(".page-body", layout) || layout;
    var used = {};
    function slug(s) {
      var b = "sec-" + (fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"), id = b, n = 2;
      while (used[id] || doc.getElementById(id)) id = b + "-" + n++;
      used[id] = true; return id;
    }
    var heads = $$("h2", body).filter(function (h) { return !h.classList.contains("tl__title") && !h.closest("[data-no-toc]") && h.textContent.trim(); });
    var html = "", links = [];
    if (heads.length >= 2) {
      html += '<nav class="aside__block toc" aria-label="' + esc(T.on_this_page || "On this page") + '"><p class="aside__title">' + esc(T.on_this_page || "On this page") + '</p><ol class="toc__list">';
      heads.forEach(function (h) {
        if (!h.id) h.id = slug(h.textContent);
        html += '<li><a href="#' + esc(h.id) + '">' + esc(h.textContent.trim().replace(/\s+/g, " ")) + "</a></li>";
      });
      html += "</ol></nav>";
    }
    // "At a glance": item counts per filter chip, for filter bars whose chips do not already show a count
    var bars = $$("[data-filter-for]", body), rows = [];
    bars.forEach(function (bar) {
      var scope = doc.getElementById(bar.getAttribute("data-filter-for"));
      if (!scope || $("[data-key] span", bar)) return;
      var items = $$("[data-filter-item]", scope);
      $$("[data-key]", bar).forEach(function (chip) {
        var key = chip.getAttribute("data-key");
        var n = items.filter(function (it) {
          return key === "all" || (it.getAttribute("data-tags") || "").split(/\s+/).indexOf(key) !== -1;
        }).length;
        if (!n) return;
        rows.push({ chip: chip, n: n, label: key === "all" ? (T.total || "Total") : chip.textContent.trim() });
      });
    });
    if (rows.length > 1) {
      html += '<div class="aside__block glance"><p class="aside__title">' + esc(T.at_a_glance || "At a glance") + '</p><ul class="glance__list">';
      rows.forEach(function (r, i) { html += '<li><button type="button" data-glance="' + i + '"><span>' + esc(r.label) + "</span><b>" + r.n + "</b></button></li>"; });
      html += "</ul></div>";
    }
    if (!html) return;
    html += '<a class="aside__top" href="#main">' + esc(T.back_to_top || "Back to top") + "</a>";
    aside.innerHTML = html; aside.hidden = false; layout.classList.add("has-aside");
    $$("[data-glance]", aside).forEach(function (b) {
      b.addEventListener("click", function () {
        var r = rows[+b.getAttribute("data-glance")];
        r.chip.click();
        var bar = r.chip.closest("[data-filter-for]");
        if (bar) bar.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    });
    links = $$(".toc__list a", aside);
    function sync() { // hide entries whose section a filter has hidden
      links.forEach(function (a) { var h = doc.getElementById(a.getAttribute("href").slice(1)); a.parentNode.hidden = !h || !!h.closest("[hidden]"); });
    }
    bars.forEach(function (bar) { bar.addEventListener("click", function () { setTimeout(sync, 0); }); bar.addEventListener("input", function () { setTimeout(sync, 0); }); });
    if (links.length && "IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        });
      }, { rootMargin: "-80px 0px -65% 0px" });
      heads.forEach(function (h) { spy.observe(h); });
    }
  })();

  /* ---------- Toggles and copy buttons ---------- */
  doc.addEventListener("click", function (e) {
    var tg = e.target.closest("[data-toggle]");
    if (tg) {
      var panel = doc.getElementById(tg.getAttribute("data-toggle"));
      if (panel) { panel.hidden = !panel.hidden; tg.setAttribute("aria-expanded", String(!panel.hidden)); }
      return;
    }
    var cp = e.target.closest("[data-copy], [data-copy-text]");
    if (!cp) return;
    var src = cp.hasAttribute("data-copy") ? $(cp.getAttribute("data-copy")) : null;
    var text = src ? src.textContent : cp.getAttribute("data-copy-text");
    var label = cp.innerHTML;
    function done(ok) {
      cp.classList.toggle("is-done", ok);
      cp.textContent = ok ? (T.copied || "Copied") + " ✓" : (T.copy_failed || "Selected, press Ctrl+C");
      setTimeout(function () { cp.innerHTML = label; cp.classList.remove("is-done"); }, 1600);
    }
    function fallback() {
      var target = src;
      if (!target) {
        target = doc.createElement("div"); target.className = "pub__panel"; target.textContent = text;
        cp.parentNode.insertAdjacentElement("afterend", target);
      }
      if (target.closest("[hidden]")) target.closest("[hidden]").hidden = false;
      try { var r = doc.createRange(); r.selectNodeContents(target); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (err) { /* ignore */ }
      done(false);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  });

  /* ---------- Reveal and counters ---------- */
  var io = ("IntersectionObserver" in window) && !reduceMotion ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el);
      if (el.classList.contains("reveal")) el.classList.remove("is-pending");
      if (el.hasAttribute("data-count")) countUp(el);
    });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0, t0 = null, dur = 900;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (io) {
    $$(".reveal").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add("is-pending"); io.observe(el); }
    });
    $$("[data-count]").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Map (Leaflet, conferences page) ---------- */
  var mapEl = $("#talk-map"), mapData = $("#map-data");
  if (mapEl && mapData) {
    var tries = 0;
    (function initMap() {
      if (!window.L) { if (tries++ < 50) setTimeout(initMap, 100); return; }
      var data = JSON.parse(mapData.textContent);
      // On touch screens one finger scrolls the page, not the map (pinch and the +/- buttons still zoom)
      var touch = !!(window.L.Browser && window.L.Browser.mobile) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
      var map = window.L.map(mapEl, { scrollWheelZoom: false, worldCopyJump: true, dragging: !touch });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      var css = getComputedStyle(root);
      var colors = { talk: css.getPropertyValue("--accent").trim(), service: css.getPropertyValue("--deco").trim(), visit: css.getPropertyValue("--ok").trim(), teaching: css.getPropertyValue("--muted").trim() };
      var bounds = [];
      data.forEach(function (p) {
        var kind = p.kinds.indexOf("talk") !== -1 ? "talk" : p.kinds[0];
        var m = window.L.circleMarker([p.lat, p.lng], { radius: 7 + Math.min(p.items.length, 5), color: "#fff", weight: 2, fillColor: colors[kind] || colors.talk, fillOpacity: .95 }).addTo(map);
        m.bindPopup("<b>" + esc(p.name) + "</b><ul>" + p.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>");
        bounds.push([p.lat, p.lng]);
      });
      map.fitBounds(bounds, { padding: [30, 30] });
    })();
  }

  /* ---------- Co-author graph ---------- */
  var gEl = $("#coauthor-graph"), gData = $("#coauthor-data");
  if (gEl && gData) {
    var G = JSON.parse(gData.textContent);
    var W = 600, H = 600, cx = W / 2, cy = H / 2, R = 185, NS = "http://www.w3.org/2000/svg";
    var svg = doc.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("class", "graph"); svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", gEl.getAttribute("data-label") || "Co-authors");
    var panel = $("#coauthor-panel");
    var nodes = G.coauthors.map(function (c, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / G.coauthors.length;
      return { c: c, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    });
    var edges = [];
    nodes.forEach(function (n) {
      var w = G.papers.filter(function (p) { return p.coauthors.indexOf(n.c.id) !== -1; }).length;
      var l = doc.createElementNS(NS, "line");
      l.setAttribute("x1", cx); l.setAttribute("y1", cy); l.setAttribute("x2", n.x); l.setAttribute("y2", n.y);
      l.setAttribute("class", "edge"); l.setAttribute("stroke-width", 1.5 + w * 1.5);
      svg.appendChild(l); edges.push(l); n.edge = l; n.w = w;
    });
    function addNode(x, y, r, label, sub, cls) {
      var g = doc.createElementNS(NS, "g"); g.setAttribute("class", "node " + cls);
      var c = doc.createElementNS(NS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", r); g.appendChild(c);
      var t = doc.createElementNS(NS, "text"); t.setAttribute("x", x); t.setAttribute("y", cls.indexOf("is-me") !== -1 ? y + 10 : y + r + 28); t.setAttribute("text-anchor", "middle"); t.textContent = label; g.appendChild(t);
      if (sub) { var s = doc.createElementNS(NS, "text"); s.setAttribute("x", x); s.setAttribute("y", y + r + 52); s.setAttribute("text-anchor", "middle"); s.setAttribute("class", "sub"); s.textContent = sub; g.appendChild(s); }
      svg.appendChild(g); return g;
    }
    addNode(cx, cy, 42, "TN", null, "is-me");
    nodes.forEach(function (n) {
      var g = addNode(n.x, n.y, 22, n.c.name, n.w + " " + (n.w > 1 ? G.labels.works : G.labels.work), "");
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", n.c.name);
      n.g = g;
      function pick() {
        nodes.forEach(function (m) { m.g.classList.toggle("is-on", m === n); m.edge.classList.toggle("is-on", m === n); });
        var papers = G.papers.filter(function (p) { return p.coauthors.indexOf(n.c.id) !== -1; });
        panel.innerHTML = "<h3>" + esc(n.c.name) + "</h3>" + (n.c.aff ? '<p class="aff">' + esc(n.c.aff) + "</p>" : "") +
          '<p class="eyebrow">' + esc(G.labels.joint) + "</p>" +
          papers.map(function (p) { return '<p><a href="' + esc(BASE + G.pubsUrl + "#" + p.id) + '">' + esc(p.title) + "</a> <span class=\"muted\">(" + p.year + ")</span></p>"; }).join("");
      }
      g.addEventListener("click", pick);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
    gEl.appendChild(svg);
  }

  /* ---------- GitHub repository stats ---------- */
  $$("[data-gh-repo]").forEach(function (box) {
    var repo = box.getAttribute("data-gh-repo");
    fetch("https://api.github.com/repos/" + repo).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;
      var s = $("[data-gh-stars]", box); if (s) { s.textContent = d.stargazers_count; s.parentNode.hidden = false; }
      var sl = $("[data-gh-stars-label]", box); if (sl && d.stargazers_count === 1 && sl.getAttribute("data-one")) sl.textContent = sl.getAttribute("data-one");
      var u = $("[data-gh-updated]", box); if (u && d.pushed_at) { u.textContent = d.pushed_at.slice(0, 10); u.parentNode.hidden = false; }
    }).catch(function () { /* offline or rate limited: keep static info */ });
    fetch("https://api.github.com/repos/" + repo + "/releases/latest").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      var el = $("[data-gh-release]", box); if (d && d.tag_name && el) { el.textContent = d.tag_name; el.parentNode.hidden = false; }
    }).catch(function () { /* ignore */ });
  });

  /* ---------- Anonymous event counts (GoatCounter) ----------
     Clicks on email addresses, PDF downloads, profile links and booking buttons, and sent forms,
     are counted as GoatCounter events: no cookies, no personal data, only "what was clicked and where". */
  function track(name) {
    var gc = window.goatcounter;
    if (!name || !gc || typeof gc.count !== "function") return;
    try { gc.count({ path: String(name).slice(0, 180), title: location.pathname, event: true }); } catch (e) { /* ignore */ }
  }
  doc.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a[href], [data-copy-text]") : null;
    if (!el || el.hasAttribute("data-goatcounter-click")) return; // those are counted by count.js itself
    var name = el.getAttribute("data-track"), href = el.getAttribute("href") || "";
    if (!name) {
      if (el.hasAttribute("data-copy-text")) { var v = el.getAttribute("data-copy-text"); if (v.indexOf("@") > 0) name = "email copied: " + v; }
      else if (/^mailto:/i.test(href)) name = "email: " + href.slice(7).split("?")[0];
      else if (/\.pdf(?:$|[?#])/i.test(href)) name = "download: " + href.split(/[?#]/)[0].split("/").pop();
      else if (el.closest(".profiles")) name = "profile: " + el.textContent.trim();
    }
    track(name);
  });

  /* ---------- Where a visitor came from (sent with the forms only) ----------
     Kept for the browser tab session in sessionStorage: the first page seen and the referring site
     (browsers usually pass only its domain). Nothing is stored or sent unless a form is submitted. */
  var src = null;
  try { src = JSON.parse(sessionStorage.getItem("rd-src") || "null"); } catch (e) { src = null; }
  if (!src) {
    var ref = "", q = null, utm = "";
    try { if (doc.referrer && new URL(doc.referrer).hostname !== location.hostname) ref = doc.referrer; } catch (e) { /* ignore */ }
    try {
      q = new URLSearchParams(location.search);
      utm = ["utm_source", "utm_medium", "utm_campaign"].map(function (k) { return q.get(k); }).filter(Boolean).join(" / ");
    } catch (e) { /* ignore */ }
    src = { first: location.pathname, ref: ref + (utm ? (ref ? " · " : "") + utm : "") };
    try { sessionStorage.setItem("rd-src", JSON.stringify(src)); } catch (e) { /* private mode: keep it for this page only */ }
  }
  function fillSource(form) {
    $$("input[data-src]", form).forEach(function (i) {
      var k = i.getAttribute("data-src");
      i.value = k === "page" ? location.pathname : k === "first" ? (src.first || "") : (src.ref || "(direct or unknown)");
    });
  }

  /* ---------- Contact and subscribe forms (Formspree) ---------- */
  $$("form[data-formspree]").forEach(function (form) {
    var kind = form.getAttribute("data-formspree") || "message";
    var status = $(".form__status", form), btn = $("button[type=submit]", form);
    var okMsg = kind === "subscribe" ? T.sub_ok : T.form_ok, errMsg = kind === "subscribe" ? T.sub_error : T.form_error;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      fillSource(form);
      var wantsUpdates = !!$("input[name=updates]:checked", form);
      var label = btn.innerHTML; btn.disabled = true; btn.textContent = T.form_sending || "Sending…";
      status.hidden = true; status.className = "form__status";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          status.hidden = false;
          if (r.ok) {
            status.textContent = okMsg; status.classList.add("is-ok"); form.reset();
            track(kind === "subscribe" ? "subscribe: footer" : "contact form: sent");
            if (wantsUpdates) track("subscribe: contact form");
          } else { status.textContent = errMsg; status.classList.add("is-error"); }
        })
        .catch(function () { status.hidden = false; status.textContent = errMsg; status.classList.add("is-error"); })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  });
  // "How did you find me?" chips are optional: a second click on the chosen one clears it
  $$(".pick").forEach(function (box) {
    var last = null, form = box.closest("form");
    box.addEventListener("click", function (e) {
      var r = e.target && e.target.closest ? e.target.closest("input[type=radio]") : null;
      if (!r) return;
      if (last === r) { r.checked = false; last = null; } else last = r;
    });
    if (form) form.addEventListener("reset", function () { last = null; });
  });

  /* ---------- Visitor statistics (GoatCounter) ---------- */
  var numFmt = window.Intl && Intl.NumberFormat ? new Intl.NumberFormat(LANG === "vi" ? "vi-VN" : "en-GB") : null;
  function fmtNum(n) { return numFmt ? numFmt.format(n) : String(n); }
  $$("[data-num]").forEach(function (el) {
    var n = Number(el.getAttribute("data-num"));
    if (!isNaN(n)) el.textContent = fmtNum(n);
  });
  if (window.Intl && Intl.DisplayNames) {
    try {
      var regionNames = new Intl.DisplayNames([LANG], { type: "region" });
      $$("[data-cc]").forEach(function (el) {
        var cc = el.getAttribute("data-cc"), name = /^[A-Z]{2}$/.test(cc) ? regionNames.of(cc) : "";
        if (name && name !== cc) el.textContent = name;
      });
    } catch (e) { /* keep the English names */ }
  }
  // "Last update": shown in the visitor's own time zone (the page carries it in UTC)
  $$("time[data-local-time]").forEach(function (el) {
    var d = new Date(el.getAttribute("datetime"));
    if (isNaN(d.getTime()) || !/T\d/.test(el.getAttribute("datetime"))) return;
    try {
      var loc = LANG === "vi" ? "vi-VN" : "en-GB";
      var tm = d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
      var dy = LANG === "vi" ? d.toLocaleDateString(loc) : d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
      el.textContent = LANG === "vi" ? tm + ", " + dy : dy + ", " + tm;
    } catch (e) { /* keep the UTC text */ }
  });
  // World map of visitors: tooltip with country name and visits
  var wmap = $("[data-wmap]");
  if (wmap) {
    var wdata = {}, wtip = $(".wmap__tip", wmap), wnames = null;
    try { JSON.parse($("[data-wmap-data]", wmap).textContent).forEach(function (c) { if (c.code) wdata[c.code] = c; }); } catch (e) { /* no data */ }
    try { wnames = new Intl.DisplayNames([LANG], { type: "region" }); } catch (e) { /* fall back to English names */ }
    var cname = function (cc, fallback) { try { return (wnames && wnames.of(cc)) || fallback || cc; } catch (e) { return fallback || cc; } };
    $$(".wmap__land path", wmap).forEach(function (p) {
      var d = wdata[p.getAttribute("data-cc")];
      if (d) { p.setAttribute("tabindex", "0"); p.setAttribute("aria-label", cname(d.code, d.name) + ": " + fmtNum(d.count)); }
    });
    var wshow = function (e) {
      var p = e.target && e.target.closest ? e.target.closest("path[data-cc]") : null;
      if (!p) { wtip.hidden = true; return; }
      var cc = p.getAttribute("data-cc"), d = wdata[cc], box = wmap.getBoundingClientRect(), pb = p.getBoundingClientRect();
      wtip.innerHTML = "<b>" + esc(cname(cc, d && d.name)) + "</b>" + (d ? esc(fmtNum(d.count) + " " + (T.vs_visits || "")) : esc(T.vs_none || ""));
      var x = e.clientX ? e.clientX : pb.left + pb.width / 2, y = e.clientY ? e.clientY : pb.top;
      wtip.style.left = (x - box.left) + "px"; wtip.style.top = (y - box.top) + "px"; wtip.hidden = false;
    };
    wmap.addEventListener("mousemove", wshow);
    wmap.addEventListener("focusin", wshow);
    wmap.addEventListener("mouseleave", function () { wtip.hidden = true; });
    wmap.addEventListener("focusout", function () { wtip.hidden = true; });
  }
  // "N visits to this page" in the footer, from the public GoatCounter counter (cached up to 4 hours)
  var visits = $("[data-visits]"), gcTag = $("script[data-goatcounter]");
  if (visits && gcTag && window.fetch) {
    var gcBase = gcTag.getAttribute("data-goatcounter").replace(/\/count$/, "");
    var gcPath = location.pathname, canon = $('link[rel="canonical"][href]');
    if (canon) { try { var cu = new URL(canon.href); if (cu.hostname === location.hostname) gcPath = cu.pathname; } catch (e) { /* ignore */ } }
    fetch(gcBase + "/counter/" + encodeURI(gcPath) + ".json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var n = d && Number(String(d.count || "").replace(/[^0-9]/g, ""));
        if (!n) return;
        $("[data-visits-n]", visits).textContent = fmtNum(n);
        visits.hidden = false;
      })
      .catch(function () { /* blocked or offline: keep it hidden */ });
  }
})();
