# post.twig

A post is a page inside a folder sorted by date, typically used for blogs or news sections.

In the **dev theme**, posts are styled the same as regular pages. However, you can customize the template to show additional information, such as author or date, below the headline.

```twig
<div class="flex-l mw8-5 center">

  <aside class="sidebar w-100 w-30-l pa3">
    {% include 'partials/header.twig' %}
    {% include 'partials/widgets.twig' %}
    {% include 'partials/navigation.twig' %}
  </aside>

  <article class="w-100 w-70-l pv4 ph4 ph5-l lh-copy f5 f4-l">
    <nav>
      {% include 'partials/breadcrumb.twig' %}
    </nav>

    <h1>{{ title }}</h1>

    {{ content }}

    {% if theme.nextpage %}
      {% include 'partials/paging.twig' %}
    {% endif %}
  </article>

</div>
```

**Note:**  

- Regular pages in folders have a two-digit prefix (e.g., `01-`) and can be reordered manually.  
- Posts use a date prefix (e.g., `202501221315-`) and are automatically sorted in descending order. Other than that, the template logic is the same.

