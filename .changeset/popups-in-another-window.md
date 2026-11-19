---
"@ui-sdk/core": patch
---

Popups rendered or moved into another window, like one an app opens with `window.open`, now work there as in the page: they focus their first control on open, keep Tab inside a modal dialog, give focus back to their trigger on close, and flip against that window's edges. Core used to read focus, input and the viewport from the page's own `document` and `window`, and `instanceof HTMLElement` checks failed for elements made in the other window.
