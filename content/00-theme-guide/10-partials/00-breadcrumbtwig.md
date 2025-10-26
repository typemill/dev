# breadcrumb.twig

A breadcrumb is a classical partial that can be included on nearly all pages.

As a first segment you can include a link to the homepage with the base url variable like this:

```twig
<a href="{{ base_url }}">{{ settings.title|title }}</a>

```

Then you can loop over the [breadcrumb variable](https://docs.typemill.net/theme-developers/theme-variables/breadcrumb) that contains all segments of the current page. Note that the last item of the breadcrumb is the current page, so we do not add a link to it:

```twig
{% for crumb in breadcrumb %}
  > 
  {% if loop.last %}
      {{ crumb.name|title }}
  {% else %}
      <a class="highlight" href="{{ crumb.urlRel }}">{{ crumb.name|title }}</a>
  {% endif %}
{% endfor %}
```

