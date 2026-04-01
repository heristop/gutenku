# Spotlight Reveal — Design Spec

## Context

The HaikuChapter component uses pretext-powered marker bars to redact text. Users can toggle visibility via a lightbulb button. This spec adds an interactive spotlight hover effect: on desktop, moving the cursor over the redacted card reveals text through a small circular spotlight (~60px radius) that follows the mouse. The effect works across title, author, and chapter text.

## Interaction Design

- **Desktop:** `mousemove` on `.book-content` shows a spotlight circle that follows the cursor. Within the circle, marker bars become transparent, revealing text underneath. `mouseleave` removes the spotlight.
- **Mobile:** No spotlight (touch interactions are imprecise for this). Existing tap-to-toggle behavior preserved.
- **Spotlight radius:** ~60px — reveals a few words at a time, secretive feel.
- **Edge:** Soft feathered gradient — hard center (fully revealed) fading smoothly to full marker coverage over ~40% of the radius.

## Technical Implementation

### Cursor Tracking (HaikuChapter.vue)

- `@mousemove` on `.book-content` (ref: `bookContentRef`)
- Compute position relative to element via `getBoundingClientRect()`
- Store as `spotlight: Ref<{ x: number; y: number } | null>`
- `@mouseleave` sets to `null`
- Throttled via `requestAnimationFrame`
- Passed as prop to `MarkerOverlay` (title/author) and `PretextChapter` (body)

### SVG Mask (PretextChapter.vue, MarkerOverlay.vue)

Each component:

1. Accepts `spotlight: { x: number; y: number } | null` prop
2. Converts book-content coordinates to SVG-local coordinates (subtract element's offset from book-content)
3. Adds SVG `<mask>` containing:
   - `<rect fill="white" width="100%" height="100%"/>` (all markers visible)
   - `<circle>` at local spotlight position, filled with `<radialGradient>` (markers hidden in spotlight)
4. Wraps all marker `<g>` stroke elements in `<g mask="url(#spotlight-mask)">`
5. When `spotlight` is null: no mask (markers fully visible)

### Radial Gradient

```svg
<radialGradient id="spotlight-grad">
  <stop offset="0%" stop-color="black"/>
  <stop offset="60%" stop-color="black"/>
  <stop offset="100%" stop-color="white"/>
</radialGradient>
```

Black = markers hidden (text revealed). White = markers visible.

### Coordinate Conversion

Each component computes local spotlight position:

```
const parentRect = bookContentRef.getBoundingClientRect()
const myRect = containerRef.getBoundingClientRect()
localX = spotlight.x - (myRect.left - parentRect.left)
localY = spotlight.y - (myRect.top - parentRect.top)
```

### Files Modified

| File                 | Change                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| `HaikuChapter.vue`   | Add mousemove/mouseleave on .book-content, spotlight ref, pass as prop |
| `PretextChapter.vue` | Accept spotlight prop, add SVG mask with gradient circle               |
| `MarkerOverlay.vue`  | Accept spotlight prop, add SVG mask with gradient circle               |

### Performance

- SVG mask circle cx/cy updates are cheap (no layout reflow)
- requestAnimationFrame throttling for smooth 60fps
- `will-change` not needed (SVG mask compositing is GPU-accelerated by default)

## Verification

1. Desktop: hover over redacted text → spotlight reveals text underneath
2. Move cursor smoothly → spotlight follows at 60fps
3. Leave the card → spotlight disappears
4. Works on title, author, and chapter text
5. Mobile: no spotlight visible, tap-to-toggle still works
6. `vue-tsc --noEmit` passes
7. `pnpm test:unit` passes
