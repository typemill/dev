# layout.twig

The `layout.twig` file defines the **HTML scaffold** for your Typemill theme. It contains everything that should wrap around the dynamic content of your pages, such as meta tags, headers, footers, stylesheets, and scripts.

This file is **extended** by `index.twig` (and other templates), and acts as the shared base layout for all pages.

## Suggested Structure

You can design the layout freely, but if you're starting from scratch, this basic structure is a reliable foundation:

```html
<!DOCTYPE html>
<html lang="{{ settings.langattr | default('en') }}">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}{% endblock %}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta name="description" content="{{ metatabs.meta.description }}" />
    <meta name="author" content="{{ metatabs.meta.author }}" />
    <link rel="canonical" href="{{ item.urlAbs }}" />

    {{ assets.renderMeta() }}

    {% block stylesheets %}
        <link rel="stylesheet" href="{{ base_url }}/themes/dev/css/tachyons.min.css">
        <link rel="stylesheet" href="{{ base_url }}/themes/dev/css/style.css" />
        {{ assets.renderCSS() }}
    {% endblock %}
</head>
<body>

    {% include 'partials/header.twig' %}

    {% block content %}{% endblock %}

    {% include 'partials/footer.twig' %}

    {% block javascripts %}
        <script src="{{ base_url }}/themes/dev/js/script.js"></script>
        {{ assets.renderJS() }}
    {% endblock %}

</body>
</html>
```

## Title and Meta Tags

The `<head>` section starts with a block for dynamic page titles provided by `index.twig`:

```twig
<title>{% block title %}{% endblock %}</title>
```

Then, it includes common meta tags using dynamic values from the page's metadata and the item-object:

```twig
<meta name="description" content="{{ metatabs.meta.description }}" />
<meta name="author" content="{{ metatabs.meta.author }}" />
<link rel="canonical" href="{{ item.urlAbs }}" />
```

Additional meta tags from Typemill and its plugins are automatically injected using:

```twig
{{ assets.renderMeta() }}
```

## Stylesheet Block

Inside the `stylesheets` block, you can include CSS libraries (e.g. Tachyons) as well as your own styles:

```twig
{% block stylesheets %}
    <link rel="stylesheet" href="{{ base_url }}/themes/dev/css/tachyons.min.css">
    <link rel="stylesheet" href="{{ base_url }}/themes/dev/css/style.css" />
    {{ assets.renderCSS() }}
{% endblock %}
```

The `assets.renderCSS` ensures plugin developers can inject their own CSS as well.

## Using Variables for Styles

CSS variables make it easy to configure your theme’s appearance from the theme settings. You can use them for colors, layout sizes, or dark mode switches. The [guide theme](https://themes.typemill.net/guide) includes a lot of examples of these techniques.

Start by defining your fields in `dev.yaml`:

```yaml
# Example settings to change the background color
fieldsetColors:
  type: fieldset
  legend: 'Colors'
  fields:
    bodyColorBackground:
      type: text
      label: 'BODY: Background Color'
      placeholder: '#fff'
      css: 'lg:w-half'
    bodyColor:
      type: text
      label: 'BODY: Text Color'
      placeholder: '#333'
      css: 'lg:w-half'
    linkColor:
      type: text
      label: 'BODY: Link Color'
      placeholder: 'blue'
      css: 'lg:w-half'
```

Assign these values to CSS variables in your Twig template. Always include fallback values:

```twig
<style>
  :root {
    --bodyColorBackground: {{ theme.bodyColorBackground ? theme.bodyColorBackground : '#fff' }};
    --bodyColor: {{ theme.bodyColor ? theme.bodyColor : '#333' }};
    --linkColor: {{ theme.linkColor ? theme.linkColor : 'blue' }};
  }
</style>
```

Then use the variables in your CSS:

```css
body {
  background-color: var(--bodyColorBackground);
  color: var(--bodyColor);
}
a {
  color: var(--linkColor);
}
```

## Page Content and Partials

The layout includes partial templates for the header and footer. The main content will be injected where the `content` block is defined:

```twig
{% include 'partials/header.twig' %}

{% block content %}{% endblock %}

{% include 'partials/footer.twig' %}
```

You can place these partials in the `partials/` folder of your theme and customize them as needed.

## JavaScript Block

JavaScript files should be included just before the closing `</body>` tag. Like CSS, plugin scripts are injected automatically with the assets-function:

```twig
{% block javascripts %}
    <script src="{{ base_url }}/themes/dev/js/script.js"></script>
    {{ assets.renderJS() }}
{% endblock %}
```

## Optional: Inline SVG Icons

If you want to use inline SVG icons throughout your theme, you can preload them once at the top of the `<body>`. Here’s an example you can adapt:

```html
<svg style="position: absolute; width: 0; height: 0; overflow: hidden" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <symbol id="icon-link" viewBox="0 0 32 32">
            <title>link</title>
            <path d="..."/>
        </symbol>
    </defs>
</svg>
```

You can now use the icon anywhere like this:

```html
<svg class="icon"><use xlink:href="#icon-link"></use></svg>
```

