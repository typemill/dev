# navigation.twig

The navigation is probably the most complex part of the theme. The good thing is that you don't need to change it in most cases, because it always works the same:  It loops over the navigation variable and prints out the navigation links.

```twig
{% macro loop_over(navigation) %}

    {% import _self as macros %}

    {% for element in navigation %}
	
		{% set depth = element.keyPathArray|length %}
		
        {% if element.activeParent %}
			<li class="{{ element.elementType }} level-{{ depth }} active parent">
		{% elseif element.active %}
			<li class="{{ element.elementType }} level-{{ depth }} active">
		{% else %}
			<li class="{{ element.elementType }} level-{{ depth }}">
		{% endif %}
            {% if (element.elementType == 'folder') %}
				<a href="{{ element.urlAbs }}">{{ element.name }}</a>
				{% if (element.folderContent|length > 0) and (element.contains == 'pages') %}	
                	<ul>
                    	{{ macros.loop_over(element.folderContent) }}
                	</ul>
				{% endif %}
            {% else %}
				<a href="{{ element.urlAbs }}">{{ element.name }}</a>
            {% endif %}
        </li>
    {% endfor %}
{% endmacro %}

{% import _self as macros %}

<ul>
    {{ macros.loop_over(navigation) }}
</ul>
```

The content of Typemill is organized in nested folders. If you want to loop over nested folders with several levels, then you usually do that with a recursive function in PHP. Twig provides its own feature called "macro" for this. The macro is called "loop_over(navigation)" and you can see that this function is called again if there is another folder inside a folder.

There are some details that might be interesting when you want to style the navigation. For example, each item in the navigation gets the class "level-" with the depth, so if the item is in the first, second, or third level of the navigation. The depth is calculated like this:

```twig
{% set depth = element.keyPathArray|length %}
```

We also print out the elementType of the navigation item so we know if it is a folder or file. You can again use this classes to style the element. And we add classes to indicate if the item is the current active page or a parent folder of the current active page:

```twig
{% if element.activeParent %}
	<li class="{{ element.elementType }} level-{{ depth }} active parent">
{% elseif element.active %}
	<li class="{{ element.elementType }} level-{{ depth }} active">
{% else %}
	<li class="{{ element.elementType }} level-{{ depth }}">
{% endif %}
```

Finally we check if the element is a folder or a file, and if it is a folder, we again loop over the content of the folder:

```twig
{% if (element.elementType == 'folder') %}
	<a href="{{ element.urlAbs }}">{{ element.name }}</a>
	{% if (element.folderContent|length > 0) and (element.contains == 'pages') %}	
          <ul>
              {{ macros.loop_over(element.folderContent) }}
          </ul>
	{% endif %}
{% else %}
    <a href="{{ element.urlAbs }}">{{ element.name }}</a>
{% endif %}
```

With this information you usually have all classes that are needed to style the navigation in frontend. In most cases you don't need to change anything.

There are different ways to style the navigation, for example as header navigation or as side navigation. There are also different options to style the navigation for mobile views. And there are quite complex options to open and close the navigation levels with JavaScript in the frontend, This is out of scope for this dev theme, but you can check the cyanine theme (basic side navigation), the pilot theme (header navigation), and the guide theme (complex side navigation with much JavaScript) for implementation details.

