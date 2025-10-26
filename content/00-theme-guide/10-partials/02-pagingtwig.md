# paging.twig

The paging partial adds a forward and backward navigation to the next or previous item. It is included in the file.twig and appears below the content.

```twig
{% if item.prevItem or item.nextItem %}

    <div id="bottompager" class="f5 pv5 flex-l flex-m justify-between">
        {% if item.prevItem %}
            <a class="link w-100 w-40-l w-40-m mv1 pv2 ph3 ba dim dib" href="{{ item.prevItem.urlRel }}">&lsaquo;&nbsp; {{ item.prevItem.name }}</a>
        {% endif %}
        {% if item.nextItem %}
            <a class="link w-100 w-40-l w-40-m mv1 pv2 ph3 dib ba dim tr" href="{{ item.nextItem.urlRel }}">{{ item.nextItem.name }} &nbsp;&rsaquo;</a>
        {% endif %}
    </div>

{% endif %}

```

Read more about the [Item variable](https://docs.typemill.net/theme-developers/theme-variables/item) in the documentation.

