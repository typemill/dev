# file.twig

The `file.twig` template renders a standard content page. It includes partials for the header, widgets, and navigation on the left, and displays the breadcrumb, title, and content on the right. At the end, it includes the paging navigation.

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

        {% include 'partials/paging.twig' %}    

    </article>

</div>
```

It’s good practice to make some elements optional so that the admin can enable or disable them in the theme settings. For example:

```twig
{% if theme.paging %}

    {% include 'partials/paging.twig' %}

{% endif %}
```

Define a checkbox option for this in your theme configuration:

```yaml
paging:
   type: checkbox
   label: 'Paging'
   checkboxlabel: 'Add previous/next-links below the content'
```

