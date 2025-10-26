# widgets.twig

Every theme must have a widgetized area. This is the main area where plugins can inject code, for example a search field or a language switch. The twig code for a widgetized area looks always the same:

```twig
{% if widgets %}
	<div class="widgetcontainer">
		{% for name,widget in widgets %}
		<div id="{{ name }}">
			{{ widget }}
		</div>
		{% endfor %}
	</div>
{% endif %}
```

The vidget variable is an array with the name of the widget (key) and a html snippet (widget). The html is often an input field or another element that is later filled with the javascript that the plugin injects into the page.

