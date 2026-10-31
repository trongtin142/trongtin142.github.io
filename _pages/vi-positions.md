---
title: "Công tác"
eyebrow: "Giới thiệu"
permalink: "/vi/positions/"
lang: "vi"
chip_teaching: "Giảng dạy"
chip_research: "Nghiên cứu"
description: "Quá trình công tác của Nguyễn Trọng Tín (Tommy Nguyen): ESCP Business School, Sciences Po, Trường Đại học Quốc tế ĐHQG-HCM, Đại học Paris Nanterre, Đại học Công nghệ Tallinn."
---
{% include rd-ctx.html %}

<div class="filters" data-filter-for="tl-positions">
  <div class="chips" role="group"><button class="chip" type="button" data-key="all" aria-pressed="true">{{ t.all }}</button><button class="chip" type="button" data-key="teaching" aria-pressed="false">{{ page.chip_teaching }}</button><button class="chip" type="button" data-key="research" aria-pressed="false">{{ page.chip_research }}</button><button class="chip" type="button" data-key="current" aria-pressed="false">{{ t.now }}</button></div>
</div>
<div id="tl-positions">
  {% include rd-timeline.html items=site.data.timeline.positions %}
  <p class="empty" data-filter-empty hidden>{{ t.no_match }}</p>
</div>
