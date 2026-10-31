---
title: "Contact"
eyebrow: "Contact"
permalink: "/contact/"
l_address: "Postal address"
l_form: "Send a message"
description: "Contact Trong-Tin (Tommy) NGUYEN: EconomiX (UMR 7235, CNRS), Université Paris Nanterre, email and academic profiles."
---
{% include rd-ctx.html %}

<div class="contact">
  <article class="card">
    <p class="card__label">{% include rd-icon.html name="pin" %} {{ page.l_address }}</p>
    <address><strong>EconomiX (UMR 7235, CNRS)</strong><br>Université Paris Nanterre<br>200 avenue de la République<br>92001 Nanterre Cedex, France</address>
  </article>
  <article class="card">
    <p class="card__label">{% include rd-icon.html name="mail" %} Email</p>
    <p class="email-row"><a href="mailto:trongtin.nguyen@parisnanterre.fr">trongtin.nguyen@parisnanterre.fr</a><button class="btn btn--sm" type="button" data-copy-text="trongtin.nguyen@parisnanterre.fr" aria-label="{{ t.copy_email }}">{% include rd-icon.html name="copy" %}<span>{{ t.copy }}</span></button></p>
    <p class="email-row"><a href="mailto:nttin@hcmiu.edu.vn">nttin@hcmiu.edu.vn</a><button class="btn btn--sm" type="button" data-copy-text="nttin@hcmiu.edu.vn" aria-label="{{ t.copy_email }}">{% include rd-icon.html name="copy" %}<span>{{ t.copy }}</span></button></p>
    <p class="card__label">{% include rd-icon.html name="link" %} {{ t.profiles }}</p>
    {% include rd-profiles.html %}
  </article>
</div>
{%- if site.rd.formspree and site.rd.formspree != "" -%}
<section class="block form-block">
  <h2>{{ page.l_form }}</h2>
  <form class="form card" action="https://formspree.io/f/{{ site.rd.formspree }}" method="POST" data-formspree>
    <div class="form__row">
      <label>{{ t.form_name }}<input name="name" id="cf-name" autocomplete="name" required></label>
      <label>{{ t.form_email }}<input name="email" id="cf-email" type="email" autocomplete="email" required></label>
    </div>
    <div class="form__row">
      <label>{{ t.form_affiliation }}<input name="affiliation" id="cf-affiliation" autocomplete="organization"></label>
      <label>{{ t.form_topic }}<select name="topic" id="cf-topic">{% for o in t.form_topics %}<option>{{ o }}</option>{% endfor %}</select></label>
    </div>
    <label>{{ t.form_message }}<textarea name="message" id="cf-message" required></textarea></label>
    <input class="form__trap" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input type="hidden" name="_language" value="{{ page_lang }}">
    <div class="actions"><button class="btn btn--primary" type="submit">{% include rd-icon.html name="send" %}<span>{{ t.form_send }}</span></button></div>
    <p class="form__status" role="status" hidden></p>
  </form>
</section>
{%- endif -%}
