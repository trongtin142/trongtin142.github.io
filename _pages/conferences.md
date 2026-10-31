---
title: "Conferences"
eyebrow: "Conferences"
permalink: "/conferences/"
map: true
l_talks: "Presentations"
description: "Conference presentations by Trong-Tin (Tommy) NGUYEN, with an interactive map of talks, conference service and academic visits."
---
{% include rd-ctx.html %}

{%- assign vi = false -%}{%- if page.lang == "vi" -%}{%- assign vi = true -%}{%- endif -%}
{%- assign C = site.data.conferences -%}
<section class="block">
  <h2>{{ t.map_title }}</h2>
  <p class="block__intro">{{ t.map_note }}</p>
  <div class="map" id="talk-map" role="region" aria-label="{{ t.map_title }}"></div>
  <ul class="map-legend">
    <li><i class="dot--talk"></i>{{ t.map_talk }}</li>
    <li><i class="dot--service"></i>{{ t.map_service }}</li>
    <li><i class="dot--visit"></i>{{ t.map_visit }}</li>
    <li><i class="dot--teaching"></i>{{ t.map_teaching }}</li>
  </ul>
</section>
{%- assign sep = "" -%}
{%- capture mapjson -%}
[{%- for pl in C.places -%}
  {%- assign pid = pl[0] -%}{%- assign P = pl[1] -%}
  {%- assign kinds = "" -%}{%- assign lines = "" -%}
  {%- for x in C.talks -%}{%- if x.place == pid -%}
    {%- assign kinds = kinds | append: "talk," -%}
    {%- if vi -%}{%- assign line = x.year | append: " · " | append: x.event_vi -%}{%- else -%}{%- assign line = x.year | append: " · " | append: x.event -%}{%- endif -%}
    {%- assign lines = lines | append: line | append: "||" -%}
  {%- endif -%}{%- endfor -%}
  {%- for x in C.others -%}{%- if x.place == pid -%}
    {%- assign kinds = kinds | append: x.kind | append: "," -%}
    {%- if vi -%}{%- assign line = x.year | append: " · " | append: x.text_vi -%}{%- else -%}{%- assign line = x.year | append: " · " | append: x.text -%}{%- endif -%}
    {%- assign lines = lines | append: line | append: "||" -%}
  {%- endif -%}{%- endfor -%}
  {%- if lines != "" -%}
  {{ sep }}{"name": {% if vi %}{{ P.name_vi | jsonify }}{% else %}{{ P.name | jsonify }}{% endif %}, "lat": {{ P.lat }}, "lng": {{ P.lng }}, "kinds": {{ kinds | split: "," | jsonify }}, "items": {{ lines | split: "||" | jsonify }}}
  {%- assign sep = "," -%}
  {%- endif -%}
{%- endfor -%}]
{%- endcapture -%}
<script type="application/json" id="map-data">{{ mapjson }}</script>
<section class="block">
  <h2>{{ page.l_talks }}</h2>
  <div class="talks">
  {%- assign prev = "" -%}
  {%- for x in C.talks -%}
    {%- assign P = C.places[x.place] -%}
    <article class="talk{% if prev == x.year %} is-same-year{% endif %}">
      <span class="talk__year">{{ x.year }}</span>
      <div>
        <p class="talk__event">{% if vi %}{{ x.event_vi }}{% else %}{{ x.event }}{% endif %}</p>
        <p class="talk__title">“{% if vi %}{{ x.title_vi }}{% else %}{{ x.title }}{% endif %}”</p>
        <span class="talk__loc">{% include rd-icon.html name="pin" %}{% if vi %}{{ x.host_vi }}{% else %}{{ x.host }}{% endif %}</span>
        {%- if x.slides or x.video -%}<div class="pub__act">{% if x.slides %}<a class="btn btn--sm" href="{{ x.slides }}">{% include rd-icon.html name="board" %}Slides</a>{% endif %}{% if x.video %}<a class="btn btn--sm" href="{{ x.video }}">{% include rd-icon.html name="ext" %}Video</a>{% endif %}</div>{%- endif -%}
      </div>
    </article>
    {%- assign prev = x.year -%}
  {%- endfor -%}
  </div>
</section>
