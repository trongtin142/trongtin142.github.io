/* Redesign (2026) site script. Vanilla JS, no dependencies.
   Theme toggle, navigation, search, filters, copy buttons, counters, map, co-author graph,
   GitHub stats and the contact form. Every feature checks that its markup exists first. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var T = window.RD_I18N || {};
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
    lastFocus = doc.activeElement;
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
      var map = window.L.map(mapEl, { scrollWheelZoom: false, worldCopyJump: true });
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
    var W = 600, H = 600, cx = W / 2, cy = H / 2, R = 200, NS = "http://www.w3.org/2000/svg";
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
      var t = doc.createElementNS(NS, "text"); t.setAttribute("x", x); t.setAttribute("y", cls.indexOf("is-me") !== -1 ? y + 5 : y + r + 18); t.setAttribute("text-anchor", "middle"); t.textContent = label; g.appendChild(t);
      if (sub) { var s = doc.createElementNS(NS, "text"); s.setAttribute("x", x); s.setAttribute("y", y + r + 34); s.setAttribute("text-anchor", "middle"); s.setAttribute("class", "sub"); s.textContent = sub; g.appendChild(s); }
      svg.appendChild(g); return g;
    }
    addNode(cx, cy, 34, "TN", null, "is-me");
    nodes.forEach(function (n) {
      var g = addNode(n.x, n.y, 18, n.c.name, n.w + " " + (n.w > 1 ? G.labels.works : G.labels.work), "");
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
      var u = $("[data-gh-updated]", box); if (u && d.pushed_at) { u.textContent = d.pushed_at.slice(0, 10); u.parentNode.hidden = false; }
    }).catch(function () { /* offline or rate limited: keep static info */ });
    fetch("https://api.github.com/repos/" + repo + "/releases/latest").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      var el = $("[data-gh-release]", box); if (d && d.tag_name && el) { el.textContent = d.tag_name; el.parentNode.hidden = false; }
    }).catch(function () { /* ignore */ });
  });

  /* ---------- Contact form (Formspree) ---------- */
  $$("form[data-formspree]").forEach(function (form) {
    var status = $(".form__status", form), btn = $("button[type=submit]", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var label = btn.innerHTML; btn.disabled = true; btn.textContent = T.form_sending || "Sending…";
      status.hidden = true; status.className = "form__status";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          status.hidden = false;
          if (r.ok) { status.textContent = T.form_ok; status.classList.add("is-ok"); form.reset(); }
          else { status.textContent = T.form_error; status.classList.add("is-error"); }
        })
        .catch(function () { status.hidden = false; status.textContent = T.form_error; status.classList.add("is-error"); })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  });
})();
