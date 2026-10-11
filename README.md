# Best Content Creator in Mwandi District

A responsive community voting page built with plain HTML, CSS, and JavaScript. The visual style uses an aurora background with golden typography, purple accents, green-blue glow, and electric vote buttons.

## Run locally

No build step or dependencies are required:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Before publishing

1. Open `script.js`.
2. Edit the `nominees` array with the real nominee names.
3. The first four nominee photos are already connected in `images/nominee-01.jpg` through `images/nominee-04.jpg`. The final two nominee slots are intentionally left open for later uploads.
4. For future photos, add an image path to the relevant nominee in the `nominees` array, for example:

   ```html
   <img src="images/nominee-01.jpg" alt="Nominee name" />
   ```

5. Change `CREATOR_PIN` at the top of `script.js`.
6. Update the `2026` year if needed.

## Important vote-storage note

This version is a front-end demo: votes are stored in each visitor's browser using `localStorage`. GitHub Pages can host the design, but it cannot securely collect shared votes or keep vote results private by itself. The creator dashboard/PIN in this demo is for previewing the interface only, not real security. For a live private vote, connect the vote button to a backend such as Supabase, Firebase, or a protected serverless API; keep the results endpoint creator-authenticated and store only one vote per voter according to your chosen voting rules.

## Included interactions

- Nominee slots ready for photos and names
- One-vote-per-browser demo behavior
- Public nominee cards do not display vote totals; totals appear only in the creator dashboard
- Confirm-vote modal
- Electric hover, glow, and active click states
- Creator dashboard modal with PIN gate and totals view
- Responsive mobile navigation
- Scroll reveal animations

## Files

- `index.html` — page structure, nominee slots, modals
- `styles.css` — aurora theme, responsive layout, electric button states
- `script.js` — nominee data, demo vote logic, creator dashboard
