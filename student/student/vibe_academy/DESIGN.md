# Design System Strategy: The Fluid Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**
This design system moves away from the rigid, boxy constraints of traditional "EdTech" and adopts the fluid, expressive language of modern social media. It is a hybrid of **Notion’s structural clarity** and **TikTok’s immersive energy**. 

To avoid a "templated" look, we employ **intentional asymmetry** and **tonal layering**. The UI is treated as an editorial canvas where content is not just "placed" but "curated." We break the grid using overlapping elements, floating glass surfaces, and a radical departure from traditional borders. The result is a premium, high-energy environment that feels native to a Gen Z audience—fast, sophisticated, and deeply intentional.

---

## 2. Colors & Surface Philosophy
The palette balances the vibrancy of **Primary (#6a1cf6)** and **Tertiary (#aa008e)** with a professional, grounded **Surface (#f5f6f7)**.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
*   **The Logic:** Borders create visual "noise" that interrupts the flow of information. 
*   **The Execution:** Boundaries must be defined solely through background color shifts or surface elevation. To separate a lesson module from the sidebar, use `surface-container-low` against the base `background`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
*   **Level 0 (Base):** `surface` or `background` for the main canvas.
*   **Level 1 (Sections):** `surface-container-low` for large content blocks.
*   **Level 2 (Cards):** `surface-container-lowest` (White in Light Mode) to create a "lifted" feel.
*   **Level 3 (Pop-overs):** Glassmorphic surfaces using `surface-bright` at 80% opacity with a `24px` backdrop-blur.

### The "Glass & Gradient" Rule
Flat colors are for utility; gradients are for "soul."
*   **CTAs & Heroes:** Use a linear gradient from `primary` (#6a1cf6) to `primary_container` (#ac8eff) at a 135-degree angle.
*   **Glassmorphism:** For Floating Action Buttons (FABs) and Navigation Bars, use semi-transparent surface tokens with background blurs to allow content colors to bleed through, creating an integrated, high-end feel.

---

## 3. Typography: Editorial Authority
We utilize a triad of typefaces to establish a sophisticated hierarchy.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its geometric but warm personality. Large scales (e.g., `display-lg` at 3.5rem) should be used with tight letter-spacing (-2%) to create a "poster-like" impact.
*   **Titles & Body (Inter):** The workhorse. Inter provides maximum legibility for educational content. `title-lg` (1.375rem) serves as the primary anchor for card headings.
*   **Labels (Manrope):** Used for functional UI elements like pill-shaped tags and progress indicators. Its slightly wider stance makes small-caps or uppercase labels feel premium and intentional.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural lines.

*   **The Layering Principle:** Instead of shadows on every card, place a `surface-container-lowest` card on a `surface-container` background. The subtle delta in hex code creates a "soft lift."
*   **Ambient Shadows:** For floating elements (like FABs or Modals), use extra-diffused shadows. 
    *   *Spec:* `Y: 16px, Blur: 32px, Spread: -4px, Color: on-surface (8% opacity)`.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge (e.g., in high-contrast dark mode), use the `outline-variant` token at **15% opacity**. Never use 100% opaque lines.
*   **Glassmorphism:** Apply a `blur(12px)` to any surface using a semi-transparent `surface-variant`. This softens the layout, making the Gen Z experience feel airy and modern.

---

## 5. Components

### Buttons & Pills
*   **Primary Button:** Gradient-filled (`primary` to `primary_container`) with `lg` (2rem) roundedness. 
*   **Pill Tags:** Use `secondary_container` backgrounds with `on_secondary_container` text. These must always be fully rounded (`9999px`).
*   **FABs (Floating Action Buttons):** Always glassmorphic. Use a `surface-bright` background at 70% opacity with a heavy shadow and `md` (1.5rem) corners.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of divider lines between list items. Use **Vertical White Space** (16px or 24px from the scale) or a subtle hover state shift to `surface-container-high` to define rows.
*   **Education Cards:** Use `xl` (3rem) or `lg` (2rem) corner radii. Content should be padded with a minimum of 32px to provide "breathing room."

### Progress & Interaction
*   **Circular Progress:** Use `primary` for the active track and `surface-container-highest` for the inactive track. No borders.
*   **Input Fields:** Ghost-style inputs. Use `surface-container-low` as the background. On focus, transition the background to `surface-lowest` and add a subtle `primary` glow (not a solid stroke).

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts (e.g., a 7-column main content area with a 4-column offset sidebar).
*   **Do** lean into high-contrast "Dark Mode"—ensure `primary_fixed_dim` is used for readability against dark backgrounds.
*   **Do** use "Plus Jakarta Sans" for all large-scale educational milestones or headers.

### Don’t
*   **Don't** use a 1px border to separate anything. If it feels messy, add more padding, not a line.
*   **Don't** use standard 4px or 8px corners. This system lives in the **16px–24px (lg to xl)** range to feel friendly and modern.
*   **Don't** use "pure black" shadows. Shadows must always be a tinted version of the surface color to maintain a "high-end editorial" glow.