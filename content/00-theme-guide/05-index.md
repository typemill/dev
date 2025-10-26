# Index.twig

The `index.twig` file is the entry point for your Typemill theme. It serves two main purposes:

1. **Extending the global layout** via `layout.twig`, which provides the HTML structure including `<head>` and `<body>`.
2. **Conditionally including content templates** based on the page type (e.g., file, folder, post) or custom settings defined in meta tabs.

## Basic Example

A minimal version of `index.twig` might look like this:

```twig
{# Use the global layout for all pages #}
{% extends '/layout.twig' %}

{# Define the page meta title #}
{% block title %}{{ meta.title }}{% endblock %}

{# Include the default content template #}
{% block content %}
    {% include 'pages/file.twig' %}
{% endblock %}
```

## Using Custom Variables

To make your theme easier to manage and duplicate, it's a good idea to define short aliases for frequently used objects at the beginning of the file. For example:

```twig
{# Extend the global layout #}
{% extends '/layout.twig' %}

{# Alias for current theme settings (replace "dev" with your theme name) #}
{% set theme = settings.themes.dev %}

{# Alias for default meta info (title, description, etc.) #}
{% set meta = metatabs.meta %}

{# Alias for theme-specific meta data (from metatabs.dev) #}
{% set metaDev = metatabs.dev %}
```

The aliases will be available in all your theme files. If you copy and rename your theme, you can simply update these aliases and the theme will work.

## Conditional Template Logic

The main content block usually includes a set of conditions to load different templates depending on the content type or page settings. Here's a sample from the dev theme:

```twig
{% block content %}

    {# Homepage #}
    {% if home %}
        {% include 'pages/home.twig' %}

    {# Custom template selected by author #}
    {% elseif metaDev.template == 'demotemplate' %}
        {% include 'pages/demotemplate.twig' %}

    {# Posts (date-prefixed files) #}
    {% elseif item.elementType == 'file' and (item.thisChapter.contains == 'posts' or meta.template == 'post') %}
        {% include 'pages/post.twig' %}

    {# Standard content file #}
    {% elseif item.elementType == 'file' %}
        {% include 'pages/file.twig' %}

    {# Glossary-style folder listing #}
    {% elseif item.elementType == 'folder' and metaDev.glossary %}
        {% include 'pages/glossary.twig' %}

    {# Folder with pages (number-prefixed files) #}
    {% elseif item.elementType == 'folder' and item.contains == 'pages' %}
        {% include 'pages/folder.twig' %}

    {# Folder with posts (date-prefixed files) #}
    {% elseif item.elementType == 'folder' and item.contains == 'posts' %}
        {% include 'pages/blog.twig' %}

    {# Always add a fallback if no condition works #}
	{% else %}
		{% include 'pages/file.twig' %}		

    {% endif %}

{% endblock %}
```

Useful variables are:

- `home`: `true` if the current page is the homepage.
- `item.elementType`: Either `file` or `folder`.
- `item.contains`: Either `posts` or `pages` (for folders only).
- `item.thisChapter.contains`: Refers to the parent folder of a file.

## Selectable Page Templates

You can add fields in the **theme meta tab** to allow content authors to select different templates. Two examples:

```twig
{# Custom template selected from dropdown #}
{% elseif metaDev.template == 'demotemplate' %}
    {% include 'pages/demotemplate.twig' %}

{# Glossary list enabled via checkbox #}
{% elseif item.elementType == 'folder' and metaDev.glossary %}
    {% include 'pages/glossary.twig' %}
```

The corresponding meta-tab configuration in `dev.yaml` would look like this:

```yaml
metatabs:
  dev:
    fields:
      fieldsetfolder:
        type: fieldset
        legend: 'Dev Folder Settings'
        fields:
          glossary:
            type: checkbox
            label: 'Glossary List'
            checkboxlabel: 'List pages or posts of this folder as glossary (only for folders)'

      fieldsetDev:
        type: fieldset
        legend: 'Dev Settings'
        fields:
          template:
            type: select
            label: "Select a template"
            options:
              standard: 'Standard'
              demotemplate: 'Demo Template'
```

The `template` field provides a dropdown to choose between different templates. The `glossary` checkbox allows enabling a glossary-style folder listing.

## Learn More

To better understand how posts, pages, and folders work in Typemill, check the [Content Structure documentation](https://docs.typemill.net/developer-basics/content).

