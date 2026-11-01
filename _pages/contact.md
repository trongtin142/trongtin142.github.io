---
title: "Contact"
eyebrow: "Contact"
width: "wide"
permalink: "/contact/"
l_address: "Postal address"
l_form: "Send a message"
description: "Contact Trong-Tin (Tommy) NGUYEN: EconomiX (UMR 7235, CNRS), Université Paris Nanterre, email and academic profiles."
---
{% include rd-ctx.html %}
{%- assign has_form = false -%}{%- if site.rd.formspree and site.rd.formspree != "" -%}{%- assign has_form = true -%}{%- endif %}
<div class="contact{% unless has_form %} contact--noform{% endunless %}">
  <div class="contact__info">
  <article class="card">
    <p class="card__label">{% include rd-icon.html name="pin" %} {{ page.l_address }}</p>
    <address><strong>EconomiX (UMR 7235, CNRS)</strong><br>Université Paris Nanterre<br>200 avenue de la République<br>92001 Nanterre Cedex, France</address>
  </article>
  <article class="card">
    <p class="card__label">{% include rd-icon.html name="mail" %} Email</p>
    <p class="email-row"><a href="mailto:trongtin.nguyen@parisnanterre.fr">trongtin.nguyen@<wbr>parisnanterre.fr</a><button class="btn btn--sm" type="button" data-copy-text="trongtin.nguyen@parisnanterre.fr" aria-label="{{ t.copy_email }}">{% include rd-icon.html name="copy" %}<span>{{ t.copy }}</span></button></p>
    <p class="email-row"><a href="mailto:nttin@hcmiu.edu.vn">nttin@<wbr>hcmiu.edu.vn</a><button class="btn btn--sm" type="button" data-copy-text="nttin@hcmiu.edu.vn" aria-label="{{ t.copy_email }}">{% include rd-icon.html name="copy" %}<span>{{ t.copy }}</span></button></p>
    <p class="card__label">{% include rd-icon.html name="link" %} {{ t.profiles }}</p>
    {% include rd-profiles.html %}
  </article>
{%- if site.rd.booking and site.rd.booking != "" %}
  <article class="card">
    <p class="card__label">{% include rd-icon.html name="calendar" %} {{ t.book_label }}</p>
    <p class="book__text">{{ t.book_text }}</p>
    <a class="btn" href="{{ site.rd.booking }}" target="_blank" rel="noopener" data-track="booking: open">{% include rd-icon.html name="calendar" %}<span>{{ t.book_btn }}</span></a>
  </article>
{%- endif %}
  </div>
{%- if has_form %}
  <section class="card contact__form" aria-labelledby="cf-title">
  <h2 class="contact__title" id="cf-title">{{ page.l_form }}</h2>
  {% include rd-contact-form.html %}
  </section>
{%- endif %}
</div>
