/* ==========================================================
   JOAN AKE — lecteur vidéo plein écran
   Tout élément avec data-play="chemin.mp4" lance la vidéo
   dès le premier appui / clic (avec le son, en pleine résolution).
   ========================================================== */
(() => {
  const lb = document.getElementById('lightbox'), v = document.getElementById('lbVideo');
  if (!lb || !v) return;
  const title = document.getElementById('lbTitle'), closeBtn = document.getElementById('lbClose');
  let opener = null;

  const open = (src, name, trigger) => {
    opener = trigger || null;
    if (title) title.textContent = name || '';
    v.src = new URL(src, document.baseURI).href;
    const cover = src.replace('/videos/', '/video-posters/').replace(/\.mp4$/i, '.jpg');
    v.poster = new URL(cover, document.baseURI).href;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('noscroll');
    v.load();
    const p = v.play();                       // lancé directement par le geste de l'utilisateur
    if (p && p.catch) p.catch(() => {
      if (lb.classList.contains('open') && title) title.textContent = 'Lecture impossible. Utilise les contrôles vidéo ou ferme le lecteur.';
    });
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    if (!lb.classList.contains('open')) return;
    v.pause(); v.removeAttribute('src'); v.load();
    v.removeAttribute('poster');
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
    if (opener) opener.focus({ preventScroll: true });
  };

  document.querySelectorAll('[data-play]').forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.preventDefault();
      open(trigger.dataset.play, trigger.dataset.title, trigger);
    });
  });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  v.addEventListener('error', () => { if (lb.classList.contains('open') && title) title.textContent = 'Vidéo introuvable — vérifie le fichier dans assets/videos/'; });
})();
