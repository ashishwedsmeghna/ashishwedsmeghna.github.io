# Publish to GitHub Pages

Repo: https://github.com/ashishwedsmeghna/ashishwedsmeghna.github.io
Live URL after deploy: https://ashishwedsmeghna.github.io

1. Unzip the downloaded project and open a terminal in that folder.
2. Run:

```bash
git init -b main
git add -A
git commit -m "Wedding invitation site"
git remote add origin https://github.com/ashishwedsmeghna/ashishwedsmeghna.github.io.git
git push -u origin main --force
```

(`--force` replaces anything already in the repo. Leave it off if the repo has files you want to keep; then run `git pull origin main --allow-unrelated-histories` first.)

3. In the repo on GitHub: Settings → Pages → Source: "Deploy from a branch", Branch: `main` / `(root)`. Save.
4. Wait 1–3 minutes, then open https://ashishwedsmeghna.github.io

## Files that must be in the repo
- `index.html` (the site)
- `support.js`, `image-slot.js`, `media-slot.js`
- `assets/videos/*.mp4` (12 files, ~130 MB total; each is under GitHub's 100 MB per-file limit)
- `assets/images/groom-ashish.jpg`, `bride-meghna.jpg`, `couple-ashish-meghna.jpg` (photos; index.html loads these directly)
- `.nojekyll` and `.image-slots.state.json` (hidden files; check they were unzipped. If `.nojekyll` is missing, run `touch .nojekyll`)

## Updating later
After edits in the editor, download again, copy the files over the folder, then:

```bash
git add -A && git commit -m "Update" && git push
```
