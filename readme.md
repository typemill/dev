# Typemill Dev

The **Typemill Dev Edition** is a development version of Typemill that includes a **Dev Theme** and a **Demo Plugin**. It’s designed as a hands-on learning environment for theme and plugin developers.

![screenshot of the dev theme](/dev-theme-1.png)

## Theme Guide

The **Theme Guide** walks you through the structure of the Dev Theme. Each article in the guide corresponds to a file in the theme folder and provides detailed explanations, examples, and best practices for working with Twig templates and YAML configurations.

You can explore how different templates (like `file.twig`, `folder.twig`, or `home.twig`) are structured and how they interact with Typemill’s content system.

## Demo Plugin

The **Demo Plugin** demonstrates the basic architecture of a Typemill plugin — including configuration, event hooks, and integration with the editor interface. The guide for the plugin is still in progress, but you can inspect the plugin folder to learn from the code directly.

## How to Use

1. **Clone this repository** to your local machine.  
2. **Run composer update** to get the vendor folder.
3. **Set edit rights** to the folders `cache`, `content`, `data`, `media`, `settings`
3. **Run it on a local server** (Apache preferred).  
4. **Create your first user** via `/tm/login`.  
5. **Start exploring** 

Browse the built-in website with explanations and experiment directly with the included Dev Theme to create something new.

## Further Reading

For full technical references, see the official documentation:

- [Theme Development Guide](https://docs.typemill.net/theme-developers)  
- [Plugin Development Guide](https://docs.typemill.net/plugin-developers)
