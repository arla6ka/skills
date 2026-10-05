---
name: sheet
install-base: <name>
---

# Sheet

Slides a panel in from an edge. It installs to components/<name>/ui. Replace <what it holds> here.

## Rules
1. sheet-trigger MUST Open the Sheet from a ``<SheetTrigger>``, because focus returns to it on close.
   - Correct: ``<SheetTrigger asChild>`<Button>`</SheetTrigger>``
2. sheet-title SHOULD Give the Sheet a <SheetTitle>.
registry: <name>
