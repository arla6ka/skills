---
name: sheet
install-base: <name>
---
registry: https://example.com/r/<name>.json

# Sheet

Slides a panel in from an edge. It installs to components/<name>/ui and reads its tokens from https://example.com/r/<name>/tokens.css.

## Rules
1. sheet-trigger MUST Open the Sheet from a ``<SheetTrigger>``, because focus returns to it on close.
   - Correct: ``<SheetTrigger asChild>`<Button>`</SheetTrigger>``
2. sheet-title SHOULD Give the Sheet a ```<SheetTitle>```.
