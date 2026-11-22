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
    v.src = src;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('noscroll');
    document.dispatchEvent(new CustomEvent('player:open'));
    const p = v.play();                       // lancé directement par le geste de l'utilisateur
    if (p && p.catch) p.catch(() => {});      // si le navigateur bloque, les contrôles restent visibles
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    if (!lb.classList.contains('open')) return;
    v.pause(); v.removeAttribute('src'); v.load();
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
    document.dispatchEvent(new CustomEvent('player:close'));
    if (opener) opener.focus({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-play]');
    if (!t) return;
    e.preventDefault();
    open(t.dataset.play, t.dataset.title, t);
  });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  v.addEventListener('error', () => { if (lb.classList.contains('open') && title) title.textContent = 'Vidéo introuvable — vérifie le fichier dans assets/videos/'; });
})();
