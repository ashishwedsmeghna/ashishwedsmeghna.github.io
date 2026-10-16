# Asset manifest — Ashish weds Meghna

No artwork, photos, videos or music were supplied with the brief, so every visual slot is a labelled placeholder.
Drag an image onto any slot in the preview to fill it (it persists). To hard-wire files instead, put them in `assets/` and set the paths listed below.

| Slot id | Section | Expected asset | Status |
|---|---|---|---|
| `hero-welcome` | Hero | Grand Welcome image | Missing |
| `ganesh` | Divine Blessings | Lord Ganesh image | Missing |
| `portrait-ashish` | Family | Ashish portrait / illustration | Missing |
| `portrait-meghna` | Family | Meghna portrait / illustration | Missing |
| `ceremony-tilak` | Mudda Milni / Tilak | Tilak image or video | Missing |
| `ceremony-myra` | Myra | Myra image or video | Missing |
| `ceremony-sangeet` | Sangeet | Sangeet image or video | Missing |
| `ceremony-phool` | Phool Party (TBC) | Phool Party image or video | Missing |
| `ceremony-pool` | Pool Party | Pool Party image or video | Missing |
| `ceremony-haldi` | Beach Carnival & Haldi | Beach Carnival / Haldi image or video | Missing |
| `ceremony-baraat` | Nikashi / Baraat | Baraat image or video | Missing |
| `ceremony-varmala` | Varmala | Varmala image or video | Missing |
| `ceremony-phera` | Phera | Phera image or video | Missing |
| `farewell` | Farewell | Wedding farewell / Bye image | Missing |
| — | Music toggle | Instrumental soundtrack (optional) | Not supplied — toggle hidden |

## Wiring files in code
In `Wedding Invitation.dc.html`, the `EVENTS` array holds `image`, `video` and `poster` fields per ceremony.
- `image: 'assets/tilak.jpg'` → shown in the slot (a drop still overrides it).
- `video: 'assets/tilak.mp4', poster: 'assets/tilak.jpg'` → muted, looping, inline video with poster fallback.

## Integration points
- RSVP: set the `rsvpEndpoint` tweak to a form endpoint (Formspree, Google Apps Script, own API). The form POSTs JSON `{name, attending, guests, message, submittedAt}`. Without it, the confirmation screen states that the response was not sent.
- Music: set the `musicUrl` tweak to an audio file to show the play/pause toggle. Nothing autoplays.
- Map: uses a Google Maps search for "Sun City Resort Mandarmani West Bengal". The pin is not verified; replace with an exact address when available.
