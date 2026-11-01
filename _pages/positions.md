---
title: "Positions"
eyebrow: "About"
permalink: "/positions/"
chip_teaching: "Teaching"
chip_research: "Research"
description: "Academic positions of Trong-Tin (Tommy) NGUYEN: ESCP Business School, Sciences Po, International University VNU-HCM, Université Paris Nanterre, Tallinn University of Technology."
---
{% include rd-ctx.html %}

{%- assign n_items = site.data.timeline.positions | size -%}
{%- if n_items >= site.rd.filter_min %}
<div class="filters" data-filter-for="tl-positions">
  <div class="chips" role="group"><button class="chip" type="button" data-key="all" aria-pressed="true">{{ t.all }}</button><button class="chip" type="button" data-key="teaching" aria-pressed="false">{{ page.chip_teaching }}</button><button class="chip" type="button" data-key="research" aria-pressed="false">{{ page.chip_research }}</button><button class="chip" type="button" data-key="current" aria-pressed="false">{{ t.now }}</button></div>
</div>
{%- endif %}
<div id="tl-positions">
  {% include rd-timeline.html items=site.data.timeline.positions %}
  <p class="empty" data-filter-empty hidden>{{ t.no_match }}</p>
</div>
