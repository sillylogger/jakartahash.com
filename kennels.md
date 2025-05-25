---
layout: default
title: Kennels
description: Discover the various Hash House Harriers kennels in Jakarta, each with their own unique traditions, schedules, and communities.
---

{% for kennel in site.data.kennels %}
<div class="kennel-card">
  <h4 class="kennel-title">
    {{ kennel.emoji }} {{ kennel.name }}
    {% if kennel.abbreviation %} ({{ kennel.abbreviation }}){% endif %}
    {% if kennel.facebook_url %}
      <a href="{{ kennel.facebook_url }}" target="_blank" rel="noopener">Facebook Page</a>
    {% endif %}
  </h4>
  <p class="kennel-tagline">{{kennel.day}}; {{ kennel.tagline }}</p>
  <p class="kennel-description">{{ kennel.description }}</p>
</div>
{% endfor %}
