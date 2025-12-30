# Mobile Spacing Adjustment Guide

This guide explains how to adjust spacing between texts, image containers, and titles on the **mobile version only** of the Three Dimensions website.

## Why This Guide Exists

Previously, changes to mobile spacing in `responsive.css` were not taking effect due to CSS specificity issues. This has been fixed by adding mobile-specific media queries **inside the inline `<style>` tags** in each HTML file.

## How to Adjust Mobile Spacing

### Step 1: Locate the Mobile Media Query Section

Open the HTML file you want to modify (e.g., `index.html`) and scroll to the bottom of the `<style>` tag (around line 688-750). You'll find a section labeled:

```css
/* ==========================================================================
   MOBILE-SPECIFIC OVERRIDES - These rules ensure spacing changes work on mobile
   Added at the end of inline styles to have higher specificity than responsive.css
   ========================================================================== */
@media (max-width: 768px) {
  /* Your mobile spacing rules here */
}
```

### Step 2: Understand the Spacing Units

We use `rem` units for spacing. Here's a quick reference:

- `0.25rem` = ~4px (very small gap)
- `0.5rem` = ~8px (small gap)
- `0.75rem` = ~12px (medium-small gap)
- `1rem` = ~16px (medium gap)
- `1.5rem` = ~24px (medium-large gap)
- `2rem` = ~32px (large gap)
- `3rem` = ~48px (extra large gap)

### Step 3: Find the Element You Want to Adjust

Each element has a comment explaining what it controls. For example:

```css
/* Space below "Überzeuge dich selbst." title */
.cta-text {
  margin: 2rem 0 0.25rem 0 !important;
  /*      ↑    ↑    ↑    ↑
          top  right bottom left
  */
}
```

### Step 4: Adjust the Values

The `margin` property uses the format: `margin: top right bottom left !important;`

**Examples:**

To increase space **below** a title:
```css
/* Before */
.ar-text {
  margin: 0.5rem 0 0.25rem 0 !important;
}

/* After - increased bottom margin from 0.25rem to 1rem */
.ar-text {
  margin: 0.5rem 0 1rem 0 !important;
}
```

To increase space **above** a container:
```css
/* Before */
.ar-container {
  margin: 2rem 0 0.5rem 0 !important;
}

/* After - increased top margin from 2rem to 3rem */
.ar-container {
  margin: 3rem 0 0.5rem 0 !important;
}
```

### Step 5: Test Your Changes

1. Save the HTML file
2. Open the page in a browser
3. Resize to mobile width (375px x 667px) or use browser dev tools (F12 → Device Toolbar)
4. Verify the spacing looks correct
5. Resize to desktop (1280px+) to confirm desktop spacing is unchanged

## Important Rules

### ✅ DO:
- **Always keep `!important`** - This ensures your mobile rules override desktop rules
- **Only modify values inside the `@media (max-width: 768px)` block** - Changes outside this block affect desktop too
- **Test on actual mobile devices** if possible, not just browser dev tools
- **Use rem units** for consistency (not px or em)

### ❌ DON'T:
- Don't remove the `@media (max-width: 768px)` wrapper - this makes rules apply to all screen sizes
- Don't remove `!important` - mobile overrides won't work without it
- Don't modify the desktop styles (lines before the media query) unless you want to change desktop spacing too

## Common Adjustments

### Reduce Gap Between Title and Description

```css
@media (max-width: 768px) {
  .ar-text {
    margin: 0.5rem 0 0.1rem 0 !important; /* Reduced bottom margin to 0.1rem */
  }
}
```

### Increase Space Before an Image Container

```css
@media (max-width: 768px) {
  .ar-container {
    margin: 4rem 0 0.5rem 0 !important; /* Increased top margin to 4rem */
  }
}
```

### Tighten All Spacing in a Section

```css
@media (max-width: 768px) {
  .cta-text {
    margin: 1rem 0 0.1rem 0 !important;
  }
  
  .description-text-2 {
    margin: 1rem 0 0.25rem 0 !important;
  }
  
  .ar-text {
    margin: 0.25rem 0 0.1rem 0 !important;
  }
  
  .ar-description {
    margin: 0.5rem 0 0.5rem 0 !important;
  }
}
```

## Element Reference for index.html

| CSS Class | What It Controls |
|-----------|------------------|
| `.cta-text` | "Überzeuge dich selbst." title |
| `.description-text-2` | "Auf unseren 3 Beispielseiten..." description |
| `.ar-text` | "AR erweckt dein Produkt zum Leben" title |
| `.ar-description` | "Sieh dir an wie Augmented Reality..." description |
| `.ar-container` | First image container (table/coffee machine) |
| `.ar-container-2-wrapper` | Second section wrapper ("Zeig was in deinem Produkt") |
| `.ar-container-3-wrapper` | Third section wrapper ("Der Klassiker, ein Musthave") |
| `.ar-container-2-text` | "Zeig was in deinem Produkt steckt" title |
| `.ar-container-2-description` | Description for second section |
| `.ar-container-3-text` | "Der Klassiker, ein Musthave" title |
| `.ar-container-3-description` | Description for third section |

## Troubleshooting

### Problem: Changes Don't Take Effect

**Solution 1:** Clear browser cache
- Chrome/Edge: Ctrl+Shift+Delete → Clear cached images and files
- Safari: Cmd+Option+E
- Or use "Hard Reload": Ctrl+Shift+R (Cmd+Shift+R on Mac)

**Solution 2:** Verify you're editing inside the `@media (max-width: 768px)` block

**Solution 3:** Check that `!important` is present at the end of each rule

### Problem: Desktop Spacing Changed Too

**Solution:** You likely edited the wrong section. Desktop styles should only be modified outside the `@media` block. Revert your changes and edit only inside `@media (max-width: 768px)`.

### Problem: Spacing Looks Different on Real Phone vs Browser

**Solution:** This is normal due to font rendering and device pixel ratios. Always test on real devices for final verification. You may need to fine-tune values after testing on actual phones.

## Advanced: Responsive.css Alternative

If you prefer, you can also add mobile-specific overrides to `responsive.css`, but you must ensure they have **higher specificity** than inline styles. This requires more complex selectors:

```css
/* In responsive.css - requires higher specificity */
@media (max-width: 768px) {
  body .white-gradient-section .text-section .ar-text {
    margin: 0.5rem 0 0.25rem 0 !important;
  }
}
```

**Recommendation:** Stick with editing the inline `<style>` tag in HTML files - it's simpler and guaranteed to work.

## Questions?

If spacing changes still don't work after following this guide:
1. Check browser console (F12) for CSS errors
2. Use browser dev tools to inspect the element and see which CSS rule is actually being applied
3. Verify the HTML file was saved correctly
4. Make sure you're testing at the correct viewport size (≤768px for mobile)

## Related Files

- `index.html` - Homepage spacing
- `ar-produktvisualisierung.html` - AR page spacing
- `Details-durch-3D.html` - Details page spacing
- `3D-Renderings-fuer-Shops.html` - Renderings page spacing
- `responsive.css` - Global responsive styles (now secondary to inline styles)
