---
title: "Education"
eyebrow: "About"
permalink: "/education/"
chip_degree: "Degrees"
chip_training: "Additional training"
description: "Education of Trong-Tin (Tommy) NGUYEN: PhD in Economics at EconomiX, Université Paris Nanterre; MA in Development Economics (UEH and Erasmus University Rotterdam); BA (UEH)."
---
{% include rd-ctx.html %}

{%- assign n_items = site.data.timeline.education | size -%}
{%- if n_items >= site.rd.filter_min %}
<div class="filters" data-filter-for="tl-education">
  <div class="chips" role="group"><button class="chip" type="button" data-key="all" aria-pressed="true">{{ t.all }}</button><button class="chip" type="button" data-key="degree" aria-pressed="false">{{ page.chip_degree }}</button><button class="chip" type="button" data-key="training" aria-pressed="false">{{ page.chip_training }}</button></div>
</div>
{%- endif %}
<div id="tl-education">
  {% include rd-timeline.html items=site.data.timeline.education %}
  <p class="empty" data-filter-empty hidden>{{ t.no_match }}</p>
</div>
