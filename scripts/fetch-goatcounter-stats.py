#!/usr/bin/env python3
"""Fetch visitor statistics from the GoatCounter API into _data/stats.json.

Runs in the Pages build (.github/workflows/jekyll.yml, every 3 hours and on each
push) before Jekyll. The API
token comes from the GOATCOUNTER_TOKEN environment variable (a GoatCounter API
token with only the "Read statistics" permission, stored as a repository
secret). Without a token, or if the API fails, nothing is written and the
Stats page shows a short notice instead of the figures.

Usage:
    GOATCOUNTER_TOKEN=... python3 scripts/fetch-goatcounter-stats.py
"""
import datetime as dt
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SITE = "trongtin142"                      # GoatCounter code: https://SITE.goatcounter.com
SINCE = "2026-01-01T00:00:00Z"            # before tracking started, so "total" covers everything
API = "https://%s.goatcounter.com/api/v0" % SITE
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_data", "stats.json")
TOKEN = os.environ.get("GOATCOUNTER_TOKEN", "").strip()


def get(path, **params):
    query = urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(
        API + path + ("?" + query if query else ""),
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json",
                 "User-Agent": "trongtin142.github.io stats (+https://github.com/trongtin142/trongtin142.github.io)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", "replace")[:300]
        raise RuntimeError("%s %s -> HTTP %s: %s" % (path, query, err.code, body))
    time.sleep(0.3)                         # stay well under the 4 requests/second limit
    return data


def iso(t):
    return t.strftime("%Y-%m-%dT%H:00:00Z")


def page_key(path):
    """Group the English and Vietnamese versions of a page: /vi/teaching/ -> /teaching/."""
    if path == "/vi" or path == "/vi/":
        return "/"
    if path.startswith("/vi/"):
        return path[3:]
    return path


def clean_title(title):
    return (title or "").split(" · ")[0].strip()


def main():
    if not TOKEN:
        print("GOATCOUNTER_TOKEN not set; skipping visitor statistics")
        return 0
    fetched = dt.datetime.now(dt.timezone.utc).replace(second=0, microsecond=0)
    now = fetched.replace(minute=0)
    end = iso(now + dt.timedelta(hours=1))

    total = get("/stats/total", start=SINCE, end=end)
    last30 = get("/stats/total", start=iso(now - dt.timedelta(days=30)), end=end)
    last7 = get("/stats/total", start=iso(now - dt.timedelta(days=7)), end=end)

    # Monthly visits for the last 12 calendar months, from the per-day overview
    first = (now.replace(day=1) - dt.timedelta(days=330)).replace(day=1, hour=0)
    months = []
    m = first
    while m <= now:
        months.append(m.strftime("%Y-%m"))
        m = (m + dt.timedelta(days=32)).replace(day=1)
    months = months[-12:]
    per_month = dict((k, 0) for k in months)
    yearly = get("/stats/total", start=iso(first), end=end)
    for day in yearly.get("stats") or []:
        key = str(day.get("day", ""))[:7]
        if key in per_month:
            per_month[key] += int(day.get("daily") or 0)

    # Most visited pages, English and Vietnamese versions combined
    hits = get("/stats/hits", start=SINCE, end=end, limit=50)
    pages = {}
    for h in hits.get("hits") or []:
        if h.get("event"):
            continue
        path = h.get("path") or "/"
        key = page_key(path)
        p = pages.setdefault(key, {"path": key, "count": 0, "title": "", "title_vi": ""})
        p["count"] += int(h.get("count") or 0)
        field = "title_vi" if path.startswith("/vi") else "title"
        if not p[field]:
            p[field] = clean_title(h.get("title"))
    top_pages = sorted(pages.values(), key=lambda p: -p["count"])[:8]

    # Visitors by country; "bin" (1-5, log scale) colours the world map
    loc = get("/stats/locations", start=SINCE, end=end, limit=100)
    countries = [
        {"code": s.get("id") or "", "name": s.get("name") or "", "count": int(s.get("count") or 0)}
        for s in (loc.get("stats") or [])
        if int(s.get("count") or 0) > 0
    ]
    top = max([c["count"] for c in countries] or [1])
    for c in countries:
        c["bin"] = 5 if top <= 1 else 1 + min(4, int(4 * math.log(c["count"]) / math.log(top)))

    stats = {
        "generated": fetched.strftime("%Y-%m-%dT%H:%M:00Z"),   # UTC; shown in the visitor's local time
        "total": int(total.get("total") or 0),
        "last30": int(last30.get("total") or 0),
        "last7": int(last7.get("total") or 0),
        "monthly": [{"month": k, "count": per_month[k]} for k in months],
        "pages": top_pages,
        "countries": countries,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=1)
    print("Wrote %s: %d visits in total, %d pages, %d countries"
          % (os.path.relpath(OUT), stats["total"], len(top_pages), len(countries)))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:                # never break the site build over statistics
        print("GoatCounter statistics not updated: %s" % exc)
        sys.exit(0)
