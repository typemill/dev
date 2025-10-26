# demotemplate.twig

The `demotemplate.twig` demonstrates how to provide multiple page templates that editors can select in the interface. 

## Define the template selection in `yaml`

Add a select field in the theme `yaml` to make the template available in the editor:

```yaml
metatabs:
  dev:
    fields:    
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

## Include the template in `index.twig`

Check the selected template in the page’s meta settings and include it:

```twig
{# You can also provide templates that admin can select in the interface #}
{% elseif metaDev.template == 'demotemplate' %}

    {% include 'pages/demotemplate.twig' %}

{% endif %}
```

## Example template

Inside `demotemplate.twig`, you can fully customize the layout. For example, the following template creates a full-width content area with a special background color and includes a flyout navigation at the top:

```twig
<div class="mw8 center">

    <nav class="topnavi w-100 pa3 pb0 flex justify-between relative bb b--light-gray">

        {% include 'partials/header.twig' %}

        {% include 'partials/topNavigation.twig' %}

    </nav>

    {% include 'partials/widgets.twig' %}

    <nav class="w-100 pv4">
        {% include 'partials/breadcrumb.twig' %}
    </nav>

    <article class="w-100 pv4 ph4 ph5-l lh-copy f5 f4-l bg-light-gray">

        <h1>{{ title }}</h1>

        {{ content }}

    </article>

</div>```

