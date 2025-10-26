# glossary.twig

The glossary template demonstrates how to list the pages of a folder in a glossary style. This shows how you can add custom functionality in a theme without touching Typemill core.

## Add a checkbox in the meta tab

To allow editors to activate the glossary style for a folder, define a checkbox in the theme `yaml`:

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
```

Typemill merges this definition with other metatabs and displays it in the editor interface.

## Include the glossary template

In `index.twig`, check if the glossary checkbox is active and include the template:

```twig
{# Glossary-style folder listing #}
{% elseif item.elementType == 'folder' and metaDev.glossary %}
    {% include 'pages/glossary.twig' %}
```

## Loop over and sort folder content

The template sorts the folder content alphabetically before rendering:

```twig
{% set alphabet = 'ß' %}

<ul class="list pa0 flex-m flex-l flex-wrap tl justify-between">
    {% for element in item.folderContent|sort((a, b) => a.name <=> b.name) %}
        {% if element.name|first|upper != alphabet %}
            {% set alphabet = element.name|first|upper %}
            <h2>{{ alphabet }}</h2>
        {% endif %}
        <li class="w-100 pa3 pa0-l">
            <a class="link relative dib w-100" href="{{ element.urlAbs }}">{{ element.name }}</a>
        </li>
    {% endfor %}
</ul>
```

Sorting happens here:

```twig
{% for element in item.folderContent|sort((a, b) => a.name <=> b.name) %}
```

A new letter heading is printed whenever the first character of the element changes:

```twig
{% if element.name|first|upper != alphabet %}
    {% set alphabet = element.name|first|upper %}
    <h2>{{ alphabet }}</h2>
{% endif %}
```

This produces an alphabetically ordered list with the first letter of each section displayed as a headline.

