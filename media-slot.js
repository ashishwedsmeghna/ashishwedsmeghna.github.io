// <media-slot> — full-bleed placeholder that accepts an IMAGE or a VIDEO.
// Images: handled by the inner <image-slot> (persists in the project, shows on share links).
// Videos: drop a video file or use "Upload video". Stored in this browser (IndexedDB) for preview.
//         For the live site, put the file in assets/ and set the `video-url` (+ `poster-url`) attribute.
// Attributes: id (required), placeholder, fit (cover|contain), image-url, video-url, poster-url, mask.
(() => {
  if (customElements.get('media-slot')) return;
  const STORE = 'videos';
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('media-slots', 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = (mode, fn) => db().then(d => new Promise((res, rej) => {
    const t = d.transaction(STORE, mode); const q = fn(t.objectStore(STORE));
    t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
  }));
  const getV = id => tx('readonly', s => s.get(id)).catch(() => null);
  const putV = (id, b) => tx('readwrite', s => s.put(b, id));
  const delV = id => tx('readwrite', s => s.delete(id)).catch(() => {});
  const editable = () => !!(window.omelette && window.omelette.writeFile);
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isVideo = f => f && /^video\//.test(f.type);

  class MediaSlot extends HTMLElement {
    static get observedAttributes() { return ['video-url', 'poster-url', 'fit', 'placeholder', 'image-url', 'mask']; }
    connectedCallback() {
      if (!this.shadowRoot) this._build();
      this._sync();
      this._load();
      if (!this._io && 'IntersectionObserver' in window) {
        this._io = new IntersectionObserver(([e]) => { this._visible = e.isIntersecting; this._autoplay(); }, { threshold: 0.25 });
        this._io.observe(this);
      }
    }
    disconnectedCallback() { if (this._io) { this._io.disconnect(); this._io = null; } }
    attributeChangedCallback() { if (this.shadowRoot) { this._sync(); this._load(); } }

    _build() {
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML =
        '<style>' +
        ':host{display:block;position:absolute;inset:0;width:100%;height:100%;overflow:hidden}' +
        'image-slot{position:absolute;inset:0;width:100%;height:100%}' +
        'video{position:absolute;inset:0;width:100%;height:100%;display:none}' +
        ':host([data-has-video]) video{display:block}' +
        ':host([data-has-video]) image-slot{visibility:hidden}' +
        '.bar{position:absolute;left:50%;bottom:72px;transform:translateX(-50%);display:none;gap:8px;z-index:5;flex-wrap:wrap;justify-content:center}' +
        ':host([data-editable]) .bar{display:flex}' +
        ':host([data-editable][data-has-video]) .bar{left:auto;right:14px;bottom:14px;transform:none;opacity:0;transition:opacity .2s}' +
        ':host([data-editable][data-has-video]:hover) .bar{opacity:1}' +
        'button{font:600 13px/1 system-ui,sans-serif;letter-spacing:.02em;padding:13px 20px;border-radius:999px;border:1px solid #B39459;background:#681F2D;color:#FFFDF7;cursor:pointer;box-shadow:0 6px 18px -8px rgba(0,0,0,.5)}' +
        'button:hover{background:#56182A}' +
        'button[data-a=remove]{background:rgba(28,22,20,.85);border-color:rgba(255,255,255,.3)}' +
        '.drop{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(104,31,45,.55);color:#fff;font:500 14px system-ui,sans-serif;z-index:6;pointer-events:none}' +
        ':host([data-dragging]) .drop{display:flex}' +
        '</style>' +
        '<image-slot shape="rect"></image-slot>' +
        '<video muted loop playsinline preload="metadata"></video>' +
        '<div class="drop">Drop video to use it here</div>' +
        '<div class="bar"><button data-a="video" type="button">Upload MP4 video</button><button data-a="remove" type="button" hidden>Remove video</button></div>' +
        '<input type="file" accept="video/mp4,video/*" hidden>';
      this._img = r.querySelector('image-slot');
      this._vid = r.querySelector('video');
      this._vid.muted = true;
      this._input = r.querySelector('input');
      this._rm = r.querySelector('[data-a=remove]');
      this._up = r.querySelector('[data-a=video]');
      r.querySelector('[data-a=video]').addEventListener('click', () => this._input.click());
      this._rm.addEventListener('click', () => this._remove());
      this._input.addEventListener('change', () => { const f = this._input.files[0]; this._input.value = ''; if (isVideo(f)) this._store(f); });
      const markEditable = () => this.toggleAttribute('data-editable', editable());
      markEditable();
      this.addEventListener('pointerenter', markEditable);
      // Video drops are intercepted here; image drops fall through to <image-slot>.
      const hasVideo = e => [...(e.dataTransfer && e.dataTransfer.items || [])].some(i => /^video\//.test(i.type));
      this.addEventListener('dragover', e => { if (editable() && hasVideo(e)) { e.preventDefault(); e.stopPropagation(); this.setAttribute('data-dragging', ''); } }, true);
      this.addEventListener('dragleave', () => this.removeAttribute('data-dragging'), true);
      this.addEventListener('drop', e => {
        this.removeAttribute('data-dragging');
        const f = e.dataTransfer && e.dataTransfer.files[0];
        if (!isVideo(f)) return;
        e.preventDefault(); e.stopPropagation();
        if (editable()) this._store(f);
      }, true);
    }

    _sync() {
      const fit = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain' ? 'contain' : 'cover';
      const ph = this.getAttribute('placeholder') || 'Artwork';
      const mask = this.getAttribute('mask');
      if (this.id) this._img.setAttribute('id', this.id);
      this._img.setAttribute('fit', fit);
      this._img.setAttribute('placeholder', ph + ' — drop an image (or a video)');
      const src = this.getAttribute('image-url');
      if (src) this._img.setAttribute('src', src); else this._img.removeAttribute('src');
      if (mask) { this._img.setAttribute('mask', mask); this._vid.style.clipPath = mask; }
      this._vid.style.objectFit = fit;
      const poster = this.getAttribute('poster-url');
      if (poster) this._vid.poster = poster; else this._vid.removeAttribute('poster');
      this._vid.setAttribute('aria-label', ph);
    }

    async _load() {
      const id = this.id; if (!id) return;
      const token = (this._token = (this._token || 0) + 1);
      const blob = await getV(id);
      if (token !== this._token) return;
      if (this._url) { URL.revokeObjectURL(this._url); this._url = null; }
      let src = '';
      if (blob) { this._url = URL.createObjectURL(blob); src = this._url; }
      else if (window.__resources && window.__resources[id]) src = window.__resources[id];
      else if (this.getAttribute('video-url')) src = this.getAttribute('video-url');
      this._rm.hidden = !blob;
      this._up.textContent = src ? 'Replace video' : 'Upload MP4 video';
      if (src) {
        if (this._vid.getAttribute('src') !== src) this._vid.src = src;
        this.setAttribute('data-has-video', '');
        this._vid.controls = reduced();
        this._autoplay();
      } else {
        this._vid.removeAttribute('src'); this._vid.load();
        this.removeAttribute('data-has-video');
      }
    }
    _autoplay() {
      if (!this.hasAttribute('data-has-video') || reduced()) return;
      if (this._visible === false) this._vid.pause();
      else this._vid.play().catch(() => {});
    }
    async _store(file) {
      try { await putV(this.id, file); } catch (e) { console.warn('media-slot: could not store video', e); }
      this._load();
    }
    async _remove() { await delV(this.id); this._load(); }
  }
  customElements.define('media-slot', MediaSlot);
})();
