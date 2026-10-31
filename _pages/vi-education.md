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

<div class="filters" data-filter-for="tl-education">
  <div class="chips" role="group"><button class="chip" type="button" data-key="all" aria-pressed="true">{{ t.all }}</button><button class="chip" type="button" data-key="degree" aria-pressed="false">{{ page.chip_degree }}</button><button class="chip" type="button" data-key="training" aria-pressed="false">{{ page.chip_training }}</button></div>
</div>
<div id="tl-education">
  {% include rd-timeline.html items=site.data.timeline.education %}
  <p class="empty" data-filter-empty hidden>{{ t.no_match }}</p>
</div>
