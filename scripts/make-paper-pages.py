#!/usr/bin/env python3
"""Create the page of each publication (EN and VI) from _data/publications.yml.

Every item needs two small stub files, so that it has its own URL and citation tags:
    _pages/papers/<id>.md     -> /papers/<id>/
    _pages/papers/<id>-vi.md  -> /vi/papers/<id>/
The content comes from the data file, through _includes/rd-paper.html. Run this after adding a
publication; existing stubs are rewritten and stubs of removed publications are deleted.

    python3 scripts/make-paper-pages.py    (needs PyYAML)
"""
import os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_pages", "papers")


def q(text):
    return '"' + str(text).replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    with open(os.path.join(ROOT, "_data", "publications.yml"), encoding="utf-8") as f:
        items = yaml.safe_load(f)["items"]
    os.makedirs(OUT, exist_ok=True)
    wanted = set()
    for p in items:
        where = p.get("venue") or p.get("booktitle") or p.get("publisher") or ""
        desc = f'{p["authors"]} ({p["year"]}). {p["title"]}.' + (f" {where}." if where else "")
        for suffix, url, lang, eyebrow in (
            ("", f'/papers/{p["id"]}/', "", "Publications"),
            ("-vi", f'/vi/papers/{p["id"]}/', 'lang: "vi"\n', "Ấn phẩm"),
        ):
            name = f'{p["id"]}{suffix}.md'
            wanted.add(name)
            text = (
                "---\n"
                f'title: {q(p["title"])}\n'
                f"eyebrow: {q(eyebrow)}\n"
                f"permalink: {q(url)}\n"
                f"{lang}"
                f'pub_id: {q(p["id"])}\n'
                f"description: {q(desc)}\n"
                "---\n"
                "{% include rd-ctx.html %}\n"
                "{% include rd-paper.html %}\n"
            )
            with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
                f.write(text)
    for name in os.listdir(OUT):
        if name.endswith(".md") and name not in wanted:
            os.remove(os.path.join(OUT, name))
    print(f"{len(wanted)} paper pages")


if __name__ == "__main__":
    main()
