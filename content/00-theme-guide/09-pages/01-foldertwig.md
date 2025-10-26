# folder.twig

The `folder.twig` template renders a content folder. A content folder in Typemill includes its own `index.md` file (content) and uses the same layout elements as `file.twig` in the dev theme.

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

        {% if item.folderContent|length > 0 %}

            <nav class="folderlist w-100 mw8 center f5">

                <ul class="list pl0 pt5 bb b--light-gray">

                    {% for subpage in item.folderContent %}

                        <li class="margin-bottom-1 bt b--light-gray no-transition">

                            <a class="link dib w-100 relative fw3 pv2 pr2 margin-bottom-1 bl bw2 b--transparent" href="{{ subpage.urlAbs }}">{{ subpage.name }}</a>

                        </li>

                    {% endfor %}

                </ul>

            </nav>

        {% endif %}

    </article>

</div>
```

If the folder contains subpages, they are listed below the folder content as an additional navigation:

```twig
{% if item.folderContent|length > 0 %}

    ...

    {% for subpage in item.folderContent %}

    ....

```

Instead of listing simple links, you can also render subpages as article teasers by fetching their details. Explore the implementation in the [Pilot theme](https://themes.typemill.net/pilot) for more details.

