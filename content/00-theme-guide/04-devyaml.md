# dev.yaml

The `dev.yaml` file configures the theme and must have the same name as the theme folder.

### Basic Information

```yaml
name: Dev Theme
version: 3.0.0
description: A developer starter theme for Typemill. 
author: Your Name
homepage: https://yourhomepage
license: MIT
```

This info is shown in the Typemill admin panel and used for version checks. All other definitions in the yaml file are optional.

## Default Settings

```yaml
settings:
  myfield: My Default Value
```

These are default settings used by the theme. You can access them in Twig via:

```twig
{{ settings.themes.dev.myfield }} // prints out "My Default Value".
```

## Admin Settings Form

These form fields appear in the system settings under “Theme Configuration” and let the admin edit the theme settings:

```yaml
forms:
  fields:

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

```

## Page-specific Settings

This tab appears in the page editor and lets users configure settings per page.

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

## Content Security Policy (CSP)

If your theme loads external content (e.g. fonts, scripts), you must whitelist those domains.

```yaml
csp:
  - https://fonts.googleapis.com
  - https://cdn.jsdelivr.net
```

For more on available field types, see the Typemill [form documentation](https://docs.typemill.net/forms).

