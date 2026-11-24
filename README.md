# Examination Tools

A small Kettu plugin with a chat-composer button, theme/background controls, layout options, local debug messages, and settings import/export.

## Files

- `manifest.json` — plugin metadata.
- `index.js` — plugin entry point.

## Install

Copy both files into a plugin folder that your installed Kettu version loads, then reload Discord/Kettu and enable the plugin. The manifest format and client selectors can vary between sideloader versions; if it does not load, check your Kettu version's documentation and console logs.

The chat button is inserted into the detected chat composer; Discord's UI selectors can change and may require updates. Background URLs are applied as CSS and should point to an image you have permission to use. Settings are saved in local browser storage.

This is a client-side customization plugin, not an official Discord feature. Use at your own discretion and review the source before installing.
