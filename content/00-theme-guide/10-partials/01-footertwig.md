# footer.twig

This theme only includes a very simple footer line with the author, the copyright, and the year. All information are taken from the system settings that the admin can edit in the interface. In the conditions at the start, we set some variables and print them out in the final line:

```twig
<footer>
    {% set nowYear = "now"|date("Y") %}
    {% if settings.year is empty or settings.year == nowYear %}
        {% set copyrightYears = nowYear %}
    {% else %}
        {% set copyrightYears = settings.year ~ ' - ' ~ nowYear %}
    {% endif %}

    <div>
        <p>{{ settings.copyright }} by {{ settings.author }}, {{ copyrightYears }}. All Rights Reserved. Built with <a class="link custom-red hover-dark-gray" href="https://typemill.net">TYPEMILL</a>.</p>
    </div>
</footer>
```

Most other themes include an editable footer with three columns. The following example is taken from the cyanine theme. It starts with the form definitions in the yaml file, so that the admin can edit the footer columns in the theme settings:

```yaml
forms:
  fields:
    fieldsetfooter:
      type: fieldset
      legend: 'Footer columns'
      fields:
        footercolumns:
          type: checkboxlist
          label: 'Activate footer columns'
          options:
            footer1: 'Column 1'
            footer2: 'Column 2'
            footer3: 'Column 3'
        footer1:
          type: textarea
          label: 'footer column 1 (use markdown)'
        footer2:
          type: textarea
          label: 'footer column 2 (use markdown)'
        footer3:
          type: textarea
          label: 'footer column 3 (use markdown)'

```

Then you can print the columns out in your template with the following twig-logic:

```twig
{% if theme.footercolumns is not empty %}

    <footer class="w-100 bl br bb lh-copy">
        <div class="w-100 center grid-container">
            <div class="grid-footer">
                <div class="center pv3 flex-l">
                    {% for column,key in theme.footercolumns %}

                        {% if theme[key] %}
                            <div class="w-100 pv3 ph3 ph4-l">
                                {{ markdown(theme[key]) }}
                            </div>
                        {% endif %}

                    {% endfor %}
                </div>
            </div>
        </div>
    </footer>

{% endif %}

```

The field definition contains a checkboxlist "footercolumns" with the three options "footer1", "footer2", "footer3". The twig code loops over these options like this:

```twig
{% for column,key in theme.footercolumns %}
```

The `key` now holds the names "footer1", "footer2", "footer3", depending on what the admin has activated. In the next step we just look if a field with the key exists in the settings. If it exists, we just print the content out and render it with the markdown function:

```twig
{% if theme[key] %}
    <div class="w-100 pv3 ph3 ph4-l">
        {{ markdown(theme[key]) }}
    </div>
{% endif %}
```

That is a very simple and elegant way to handle admin settings dynamically. And you can also reuse this pattern for other features, for example for boxes that should appear in the sidebar.

