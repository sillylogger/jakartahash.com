---
layout: default
title: Kennels
---

### Local Kennels

{% for kennel in site.data.kennels %}
<div class="kennel-card">
  <h4 class="kennel-title">{{ kennel.emoji }} {{ kennel.name }}{% if kennel.abbreviation %} ({{ kennel.abbreviation }}){% endif %}</h4>
  <p class="kennel-tagline">{{ kennel.tagline }}</p>
  <p class="kennel-description">{{ kennel.description }}</p>
</div>
{% endfor %}
