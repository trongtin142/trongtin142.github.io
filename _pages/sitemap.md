---
title: "Sitemap"
eyebrow: "About"
permalink: /sitemap/
description: "All pages of the site, in English and Vietnamese."
---
{% include rd-ctx.html %}
<p class="prose">All pages of the site. An <a href="{{ base_path }}/sitemap.xml">XML version</a> is available for search engines.</p>
{%- assign sorted = site.pages | sort: "url" -%}
<section class="block">
<h2>English</h2>
<ul class="rows">
{%- for p in sorted -%}{%- if p.title and p.sitemap != false and p.lang != "vi" -%}{%- unless p.url contains ".xml" or p.url contains ".json" or p.url contains ".css" -%}
  <li class="row"><a class="row__title" href="{{ base_path }}{{ p.url }}">{{ p.title }}</a><span class="row__when">{{ p.url }}</span></li>
{%- endunless -%}{%- endif -%}{%- endfor -%}
</ul>
</section>
<section class="block">
<h2>Tiếng Việt</h2>
<ul class="rows">
{%- for p in sorted -%}{%- if p.title and p.sitemap != false and p.lang == "vi" -%}
  <li class="row"><a class="row__title" href="{{ base_path }}{{ p.url }}">{{ p.title }}</a><span class="row__when">{{ p.url }}</span></li>
{%- endif -%}{%- endfor -%}
</ul>
</section>
