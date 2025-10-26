# home.twig

The homepage in Typemill is handled with a special template `home.twig`. While Typemill is not a full website builder, this construct allows you to create flexible landing pages.

In `index.twig`, we check if the current page is the homepage and include the `home.twig` template:

```twig
{# Something for the homepage (optionally) #}
{% if home %}

    {% include 'pages/home.twig' %}

{% endif %}
```

## Define homepage sections

In `home.twig`, a `home` variable is created to store the positions of different sections, as defined in the theme settings:

```twig
<!-- create an object with all elements of the homepage and their positions -->
{% set home = { 
    "homeContent" : theme.contentPosition,
    "homeNavi" : theme.naviPosition,
    }
%}
```

## Sort and include sections

The sections are sorted by their position number. Sections with a value greater than 0 are included:

```twig
<!-- sort the elements by position, loop over them and include them if position is not 0 -->
{% for section,index in home|sort %}

    {% if index > 0 %}

        {% include 'home/' ~ section ~ '.twig' %}

    {% endif %}

{% endfor %}
```

Example of the `home` array:

```twig
{ 
    "homeContent" : 1,
    "homeNavi" : 2,
}
```

This would result in including:

```twig
{% include 'home/homeContent.twig' %}
{% include 'home/homeNavi.twig' %}

```

## Theme settings

The positions are configurable in the theme `yaml` file:

```yaml
# Settings for the homepage
home:
  type: fieldset
  legend: 'Homepage'
  fields:
    contentPosition:
      type: number
      label: 'Position of Default Content Segment'
      description: 'This segment will show the default markdown content for the homepage. Use 0 to disable this section.'
      css: 'lg:w-full'
    naviPosition:
      type: number
      label: 'Position of First Level Teasers'
      description: 'A segment with teasers that show the first level elements of the navigation. Use 0 to disable the section.'
      css: 'lg:w-full'
```

Check the `home` folder to see the implementation details of each section.

