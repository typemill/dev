# homeContent.twig

The `homeContent.twig` template defines a content section that appears on the homepage. It is included by `home.twig` from the `pages` folder and simply displays the homepage title and content entered by the editor:

```twig
<section class="mw8 center">

    <h1>{{ title }}</h1>

    {{ content }}

</section>
```

