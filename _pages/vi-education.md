---
title: "Học vấn"
eyebrow: "Giới thiệu"
permalink: "/vi/education/"
lang: "vi"
chip_degree: "Bằng cấp"
chip_training: "Đào tạo bổ sung"
description: "Học vấn của Nguyễn Trọng Tín (Tommy Nguyen): Tiến sĩ Kinh tế học tại EconomiX, Đại học Paris Nanterre; Thạc sĩ Kinh tế Phát triển (UEH và Đại học Erasmus Rotterdam); Cử nhân (UEH)."
---
{% include rd-ctx.html %}

{%- assign n_items = site.data.timeline.education | size -%}
{%- if n_items >= site.rd.filter_min %}
<div class="filters" data-filter-for="tl-education">
  <div class="chips" role="group"><button class="chip" type="button" data-key="all" aria-pressed="true">{{ t.all }}</button><button class="chip" type="button" data-key="degree" aria-pressed="false">{{ page.chip_degree }}</button><button class="chip" type="button" data-key="training" aria-pressed="false">{{ page.chip_training }}</button></div>
</div>
{%- endif %}
<div id="tl-education">
  {%- assign edu_deg = site.data.timeline.education | where_exp: "e", "e.tags contains 'degree'" -%}
  {%- assign edu_tr = site.data.timeline.education | where_exp: "e", "e.tags contains 'training'" -%}
  {% include rd-timeline.html items=edu_deg logo_left=true %}
  {%- if edu_tr.size > 0 %}
  <h2 class="tl-sub">{{ page.chip_training }}</h2>
  {% include rd-timeline.html items=edu_tr logo_left=true %}
  {%- endif %}
  <p class="empty" data-filter-empty hidden>{{ t.no_match }}</p>
</div>
