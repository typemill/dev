# blog.twig

The `blog.twig` template renders a blog or news folder with a paginated list of posts. It is more complex than other templates because it handles slicing posts for the current page and includes metadata for each post.

## Define paging variables

At the start of the template, define variables to handle pagination:

```twig
<!-- Set variables for paging -->
{% set pagesize = 9 %}
{% set pages = (item.folderContent|length / pagesize)|round(0, 'ceil') %}
{% set currentpage = currentpage ?? 1 %}
{% set currentposts = (currentpage - 1) * pagesize %}
```

- `pagesize`: number of posts per page  
- `pages`: total number of pages  
- `currentpage`: current page number (defaults to 1)  
- `currentposts`: index of the first post on the current page  

## Render folder content

Like `folder.twig`, you can display the folder content and include partials (header, widgets, navigation, etc.).

## List posts

Use the `slice` filter to loop only over posts of the current page:

```twig
<ul class="list w-100 mw8 center f5 pl0 pv5">

  {% for element in item.folderContent|slice(currentposts, pagesize) %}
    {% set post = getPageMeta(settings, element) %}
    {% set date = element.order[0:4] ~ '-' ~ element.order[4:2] ~ '-' ~ element.order[6:2] %}

    <li class="w-100 pt4 pb4 bt bb b--light-gray mt-1">
      <a class="link f-link flex-l black dim" href="{{ element.urlAbs }}">

        <div class="w-100 w5-l h4-l bg-light-gray flex items-center justify-center overflow-hidden">
          {% if post.meta.heroimage != '' %}
            <img class="h-100 w-100 object-cover"
                 src="{{ assets.image(post.meta.heroimage).resize(820,500).src() }}"
                 {% if post.meta.heroimagealt and subpagemeta.meta.heroimagealt != '' %}
                 alt="{{ post.meta.heroimagealt }}"
                 {% endif %} />
          {% endif %}
        </div>

        <div class="w-100 ml4-l w-90-l">
          <header>
            <h3 class="f3 mt0-l mt3">{{ post.meta.title }}</h3>
          </header>
          <small class="f6"><time datetime="{{date}}">{{ date | date("d.m.Y") }}</time> | {{ post.meta.author | default(post.meta.owner) }}</small>
          <p class="lh-copy">{{ post.meta.description }}</p>
        </div>

      </a>
    </li>

  {% endfor %}

</ul>
```

**Notes:**

- `getPageMeta(settings, element)` retrieves metadata for each post.  
- `element.order` is used to extract the date from the filename (e.g., `202401081957-my-post-title.md`).  
- The hero image is optional.

## Add pagination

At the end of the blog list, add pagination using the variables defined at the start:

```twig
{% if pages > 1 %}
  <div class="w-100 pa3 center">
    <ul class="flex list pl0 justify-center">
      {% for i in 1 .. pages %}
        <li class="pa2 pa3-l ma1 ba dim">
          {% if i == currentpage %}
            {{ i }}
          {% else %}
            <a class="page" href="{{ item.urlAbs }}/p/{{ i }}">{{ i }}</a>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  </div>
{% endif %}
```

You can customize the styling, but the logic for slicing posts and generating page links can remain the same.

