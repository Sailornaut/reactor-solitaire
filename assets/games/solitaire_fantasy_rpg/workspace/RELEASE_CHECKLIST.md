# Release Checklist — Reactor Solitaire: Core Surge

Work through each section in order before uploading to itch.io or any public host.

---

## 1. Local Art Files

Art lives in `public/assets/art/`. Vite copies this directory into `dist/` on build.
Missing files fall back to procedural canvas textures — game remains playable.

- [ ] `public/assets/art/backdrop.jpg` — battle background (1024×576 px recommended)
- [ ] `public/assets/art/hero.jpg` — hero portrait (512×512 px recommended)
- [ ] `public/assets/art/enemy.jpg` — enemy portrait (512×512 px recommended)
- [ ] `public/assets/art/title.jpg` — title screen key art (1024×576 px recommended)

---

## 2. Local Audio Files

Audio lives in `public/assets/audio/`. Missing files silently no-op — game remains playable.

- [x] `public/assets/audio/bgm.mp3` — loopable battle BGM
- [x] `public/assets/audio/sfx-hit.mp3` — card/magic hit SFX
- [x] `public/assets/audio/sfx-ui.mp3` — UI click/confirm SFX
- [x] `public/assets/audio/sfx-limit.mp3` — Core Surge activation SFX
- [x] `public/assets/audio/sfx-enemy.mp3` — enemy attack SFX

---

## 3. No Private URLs

Confirm no private CDN or blob-storage URLs are present anywhere in source or build output.

```bash
cd assets/games/solitaire_fantasy_rpg/workspace
grep -r "seeleh5\|seeles\.ai\|blob\.core\.windows" src/ public/ dist/ package.json
# expected: no output
```

- [ ] Command returns no output

---

## 4. Tests Pass

```bash
cd assets/games/solitaire_fantasy_rpg/workspace
npm run test
```

- [ ] All test files pass (3 suites, 84 tests as of last run)

---

## 5. Production Build Passes

```bash
npm run build
# expected: ✓ built in ~500ms, no errors
```

- [ ] Build completes with no errors
- [ ] `dist/` contains `index.html`, `assets/index-*.js`, `assets/index-*.css`
- [ ] `dist/assets/audio/` contains the audio files
- [ ] `dist/assets/art/` contains the art files (once added above)

---

## 6. Preview Build Locally

```bash
npm run preview
# opens at http://localhost:4173
```

- [ ] Title screen renders with art or fallback gradient
- [ ] Start Mission button works
- [ ] Cards deal, move, and reach foundations correctly
- [ ] Surge bar fills on card moves
- [ ] Enemy takes damage and HP bar updates
- [ ] Core Surge button activates at 100% Surge
- [ ] Win and lose screens display correctly
- [ ] Restart Run starts the next encounter
- [ ] Audio plays (BGM loops, SFX fire on actions)
- [ ] Background theme changes between encounters
- [ ] Enemy name updates in the HUD across encounters
- [ ] No console errors (DevTools → Console)
- [ ] No 404s for local asset paths (DevTools → Network)

---

## 7. itch.io Upload

- [ ] Run `npm run build` one final time after all assets are in place
- [ ] Zip the contents of `dist/` (not the folder itself — zip `index.html` + `assets/`)
- [ ] Upload zip to itch.io as an HTML game
- [ ] Set "This file will be played in the browser" on the upload
- [ ] Set viewport to at least 1280×720 in the embed settings
- [ ] Play-test the hosted version end-to-end
- [ ] Confirm no 404s in the hosted version (DevTools → Network)

---

## 8. Credits and Licensing

- [ ] `CREDITS.md` is accurate and up to date
- [ ] Music license terms confirmed with artist (Falling Sun / Sollis)
- [ ] Kenney CC0 sound effects credited (see CREDITS.md)
- [ ] Art attribution confirmed for any generated or sourced images
- [ ] No copyrighted characters, names, or assets from commercial games
