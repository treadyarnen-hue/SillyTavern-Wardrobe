# Wardrobe

A simple SillyTavern extension that tracks what {{user}} is currently wearing and feeds it to the model each reply.

You type in outfits for six categories (Work, Everyday, Formal, Loungewear, Sports, Bedtime) plus a separate underwear layer, pick which outfit is currently worn, and toggle underwear on or off. The extension keeps the model aware of the current outfit. It never suggests or auto-fills anything; everything is typed in by you.

## Install (manual)
1. Download or clone this repository.
2. Put the folder in your SillyTavern install at `public/scripts/extensions/third-party/`.
3. Fully restart SillyTavern.
4. Open the Extensions panel and expand the "Wardrobe" drawer.

## Install (URL)
In SillyTavern, open Extensions, click "Install extension", and paste this repository's URL.

## Status
Input UI with per-character wardrobes, prompt injection (the model always knows {{user}}'s current outfit), and model-driven changes: the model can switch the active outfit itself via a hidden tag when the scene calls for it.
