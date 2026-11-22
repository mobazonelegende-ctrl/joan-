/* ==========================================================
   JOAN AKE — animations & interactions
   GSAP + ScrollTrigger + Lenis (smooth scroll)
   ========================================================== */

/* ---------- ⚙️ À MODIFIER : tes infos de contact ---------- */
const CONFIG = {
  whatsapp: '2250779940313',
  message:  'Bonjour JOAN AKE, je souhaite un devis pour un projet vidéo.',
  socials: {
    youtube:   '#',                   // ← lien de ta chaîne YouTube
    instagram: '#',                   // ← lien de ton Instagram
    tiktok:    'https://www.tiktok.com/@joanake',
    linkedin:  '#'                    // ← lien de ton LinkedIn
  }
};

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let lenis = null;

  /* ---------- liens WhatsApp + réseaux ---------- */
  const waUrl = (txt) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt || CONFIG.message)}`;
  const waReady = !/^0+$/.test(CONFIG.whatsapp);
  $$('[data-wa]').forEach(a => { a.href = waUrl(); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-social]').forEach(a => {
    const url = CONFIG.socials[a.dataset.social];
    if (url && url !== '#') { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    else a.addEventListener('click', e => e.preventDefault());
  });
  $('#year').textContent = new Date().getFullYear();

  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200); };

  /* ---------- vidéos : charge quand visible, joue en silence ---------- */
  const vids = $$('video[data-src]');
  const vio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.src && !v._failed) {
          v.src = v.dataset.src;
          v.addEventListener('loadeddata', () => { v.classList.add('ready'); }, { once: true });
          v.addEventListener('error', () => { v._failed = true; v.removeAttribute('src'); v.load(); }, { once: true });
        }
        if (v.classList.contains('ready')) v.play().catch(() => {});
        else v.addEventListener('loadeddata', () => { if (en.target._vis) v.play().catch(() => {}); }, { once: true });
        v._vis = true;
      } else { v._vis = false; v.pause(); }
    });
  }, { threshold: .35 });
  vids.forEach(v => vio.observe(v));

  /* ---------- lecteur vidéo : on fige le défilement fluide pendant la lecture ---------- */
  document.addEventListener('player:open',  () => lenis && lenis.stop());
  document.addEventListener('player:close', () => lenis && lenis.start());

  /* ---------- menu mobile ---------- */
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const o = burger.classList.toggle('open'); menu.classList.toggle('open', o);
    burger.setAttribute('aria-expanded', o); o ? lenis && lenis.stop() : lenis && lenis.start();
    document.body.classList.toggle('noscroll', o);
  });

  /* ---------- formulaire → WhatsApp ---------- */
  $('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, name = f.name.value.trim(), msg = f.message.value.trim();
    if (!name || !msg) { toast('Merci de renseigner votre nom et votre message.'); return; }
    const txt = `Bonjour JOAN AKE,\nJe suis ${name}${f.phone.value ? ' (' + f.phone.value + ')' : ''}.\nProjet : ${f.type.value}\n\n${msg}`;
    if (!waReady) { toast('Numéro WhatsApp non configuré (js/main.js).'); return; }
    window.open(waUrl(txt), '_blank', 'noopener');
  });
  const planMap = { 'Vidéo Brute': 'Vidéo Brute', 'Vidéo Montée': 'Vidéo Montée', 'Vidéo Publicitaire': 'Vidéo Publicitaire', 'Clip / Publicité': 'Vidéo Publicitaire' };
  $$('[data-plan]').forEach(b => b.addEventListener('click', () => { $('#f-type').value = planMap[b.dataset.plan] || 'Autre projet'; }));

  /* ---------- fallback sans GSAP ---------- */
  const fallback = () => {
    document.documentElement.classList.remove('js');
    const l = $('#loader'); l && l.remove();
    $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); $(id).scrollIntoView({ behavior: 'smooth' }); } }));
  };

  const boot = () => {
    if (!window.gsap || !window.ScrollTrigger) { fallback(); return; }
    gsap.registerPlugin(ScrollTrigger);
    const EASE = 'power3.inOut', OUT = 'expo.out';          // lent → rapide → lent

    /* ----- smooth scroll ----- */
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();                                         // bloqué pendant le préchargeur
    }
    const scrollTo = (target) => lenis ? lenis.scrollTo(target, { offset: -60, duration: 1.6 }) : $(target)?.scrollIntoView({ behavior: 'smooth' });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) {
        e.preventDefault();
        burger.classList.remove('open'); menu.classList.remove('open'); document.body.classList.remove('noscroll'); lenis && lenis.start();
        scrollTo(id);
      }
    }));

    /* ----- barre de progression + nav ----- */
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });
    const nav = $('#nav');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => {
        nav.classList.toggle('scrolled', s.scroll() > 40);
        nav.classList.toggle('hide', s.direction === 1 && s.scroll() > 500 && !menu.classList.contains('open'));
      }
    });
    $$('.menu a').forEach(a => {
      const sec = $(a.getAttribute('href')); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => s.isActive && ($$('.menu a').forEach(x => x.classList.remove('active')), a.classList.add('active')) });
    });

    /* ----- curseur ----- */
    if (fine && !reduce) {
      const c = $('#cursor'), d = $('#cursorDot');
      const cx = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
      const dx = gsap.quickTo(d, 'x', { duration: .1 }), dy = gsap.quickTo(d, 'y', { duration: .1 });
      addEventListener('mousemove', e => { gsap.to([c, d], { opacity: 1, duration: .3 }); cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });
      $$('a,button,.card,.clip').forEach(el => { el.addEventListener('mouseenter', () => c.classList.add('big')); el.addEventListener('mouseleave', () => c.classList.remove('big')); });
    }

    /* ----- boutons magnétiques + tilt 3D ----- */
    if (fine && !reduce) {
      $$('.magnetic').forEach(b => {
        const mx = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.5)' }), my = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.5)' });
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
        b.addEventListener('mouseleave', () => { mx(0); my(0); });
      });
      $$('.tilt').forEach(c => {
        const rx = gsap.quickTo(c, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .6, ease: 'power3' });
        gsap.set(c, { transformPerspective: 900 });
        c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
        c.addEventListener('mouseleave', () => { rx(0); ry(0); });
      });
    }

    /* ----- titres : split par lignes ----- */
    $$('[data-split]').forEach(h => {
      const lines = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = lines.map(l => `<span class="split-line"><span>${l}</span></span>`).join('');
      gsap.from($$('.split-line>span', h), { yPercent: 115, rotate: 3, duration: 1.3, ease: OUT, stagger: .12, scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    $$('[data-split-center]').forEach(h => {
      gsap.from(h, { opacity: 0, scale: .82, y: 60, duration: 1.6, ease: OUT, scrollTrigger: { trigger: h, start: 'top 85%' } });
    });

    /* ----- scroll reveal ----- */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      onEnter: els => gsap.to(els, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.2, ease: OUT, stagger: .12, overwrite: true })
    });

    /* ----- image reveal (clip-path) ----- */
    $$('[data-clip]').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0 round 20px)' }, { clipPath: 'inset(0% 0 0 0 round 20px)', duration: 1.5, ease: EASE, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    /* ----- parallax ----- */
    $$('[data-parallax]').forEach(el => {
      const s = parseFloat(el.dataset.parallax), host = el.closest('section');
      gsap.fromTo(el, { yPercent: -s * 30 }, { yPercent: s * 30, ease: 'none', scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-parallax-in]').forEach(img => {
      const dir = parseFloat(img.dataset.parallaxIn) < 0 ? 1 : -1;
      gsap.fromTo(img, { yPercent: 5 * dir }, { yPercent: -5 * dir, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero-text', { yPercent: -10, opacity: .0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: true } });
    gsap.to('.marquee-track', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ----- SCROLLYTELLING : section épinglée ----- */
    const steps = $$('#steps .step'), imgs = $$('.story-img'), capTxt = ['L\'idée', 'Le tournage', 'Le montage', 'La livraison'];
    const count = $('#storyCount'), cap = $('#storyCap'), fill = $('#stepsFill');
    let cur = 0;
    const setStep = (i) => {
      if (i === cur) return; cur = i;
      steps.forEach((s, k) => s.classList.toggle('active', k <= i && k === i));
      count.textContent = String(i + 1).padStart(2, '0'); cap.textContent = capTxt[i];
      gsap.fromTo([count, cap], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: OUT, stagger: .08 });
    };
    $$('.story-img img').forEach(img => gsap.set(img, { scale: parseFloat(img.dataset.zoom || 1), transformOrigin: img.dataset.origin || '50% 50%' }));
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', () => {
      gsap.set(imgs.slice(1), { opacity: 1, clipPath: 'inset(100% 0 0 0)' });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.story-pin', start: 'top top', end: '+=320%', pin: true, scrub: .8, anticipatePin: 1,
          onUpdate: s => { setStep(Math.min(3, Math.floor(s.progress * 4 + .02))); gsap.set(fill, { scaleY: s.progress }); }
        }
      });
      imgs.forEach((im, i) => {
        const z = parseFloat($('img', im).dataset.zoom || 1);
        tl.fromTo($('img', im), { scale: z * 1.25 }, { scale: z, duration: .3, ease: 'none' }, Math.max(0, i * .25 - .05));
        if (i > 0) tl.fromTo(im, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .12, ease: EASE }, i * .25 - .05);
      });
      tl.to({}, { duration: .02 });
      return () => { cur = -1; };
    });
    mm.add('(max-width: 860px)', () => {
      gsap.set(imgs.slice(1), { opacity: 0, clipPath: 'inset(0)' });
      steps.forEach((st, i) => ScrollTrigger.create({
        trigger: st, start: 'top 62%', end: 'bottom 62%',
        onToggle: s => { if (!s.isActive) return;
          gsap.to(imgs, { opacity: (k) => k === i ? 1 : 0, duration: .7, ease: 'power2.inOut' });
          setStep(i);
        }
      }));
      gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    });

    /* ----- CLIPS : défilement horizontal épinglé ----- */
    mm.add('(min-width: 861px)', () => {
      const track = $('#clipsTrack');
      const dist = () => Math.max(260, track.scrollWidth - innerWidth + 40);
      const move = () => Math.max(0, track.scrollWidth - innerWidth + 40);
      const hTween = gsap.to(track, {
        x: () => -move(), ease: 'none',
        scrollTrigger: { trigger: '.clips-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => gsap.set('#clipsBar', { scaleX: s.progress }) }
      });
      $$('.clip').forEach(c => gsap.from(c, { scale: .9, opacity: .35, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: hTween, start: 'left 98%', end: 'left 60%', scrub: true } }));
    });

    /* ----- animation du showreel ----- */
    gsap.from('.big-play', { scale: 0, rotate: -180, duration: 1.4, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: '.showreel', start: 'top 55%' } });

    /* ----- panneaux : léger décalage ----- */
    gsap.from('.price', { y: 80, opacity: 0, duration: 1.2, ease: OUT, stagger: .15, scrollTrigger: { trigger: '.price-grid', start: 'top 85%' } });

    /* ----- INTRO (après le préchargeur) ----- */
    const heroA = $$('[data-hero="a"]'), name = $('[data-hero="b"]'), vis = $('[data-hero="v"]'), swash = $('#swash');
    const L = swash.getTotalLength();
    gsap.set(heroA, { opacity: 0, y: 36 });
    gsap.set(name, { yPercent: 115 });
    gsap.set(swash, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(vis, { opacity: 1 });
    gsap.set('.hero-frame', { clipPath: 'inset(100% 0 0 0 round 26px)' });
    gsap.set('.hero-frame img', { scale: 1.35 });
    gsap.set('.hero-tag,.hero-ring', { opacity: 0, scale: .6 });

    const intro = () => {
      lenis && lenis.start();
      const tl = gsap.timeline({ defaults: { ease: OUT } });
      tl.to('.hero-frame', { clipPath: 'inset(0% 0 0 0 round 26px)', duration: 1.8, ease: EASE }, 0)
        .to('.hero-frame img', { scale: 1, duration: 2.4 }, 0)
        .to(name, { yPercent: 0, duration: 1.6 }, .25)
        .to(swash, { strokeDashoffset: 0, duration: 1.4, ease: EASE }, .8)
        .to(heroA, { opacity: 1, y: 0, duration: 1.2, stagger: .12 }, .6)
        .to('.hero-tag', { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.6)' }, 1.4)
        .to('.hero-ring', { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.6)' }, 1.55)
        .from('.nav', { yPercent: -100, opacity: 0, duration: 1.1 }, 1.0)
        .from('.scroll-hint', { opacity: 0, y: 20, duration: 1 }, 2);
    };

    /* ----- préchargeur ----- */
    const loader = $('#loader'), bar = $('.loader-bar i'), num = $('#count');
    const state = { v: 0 };
    const done = () => {
      gsap.timeline({ onComplete: () => { loader.remove(); } })
        .to('.loader-inner', { y: -30, opacity: 0, duration: .6, ease: 'power3.in' })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: EASE }, '-=.1')
        .add(intro, '-=.7');
    };
    if (reduce) { loader.remove(); gsap.set(heroA.concat([name]), { clearProps: 'all' }); intro(); }
    else {
      const loaded = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r)));
      const hero = new Image(); hero.src = 'assets/photos/hero-portrait.jpg';
      const heroDone = new Promise(r => { hero.onload = hero.onerror = r; if (hero.complete) r(); });
      let ready = false; Promise.all([loaded, heroDone]).then(() => ready = true);
      gsap.to(state, { v: 100, duration: 2.2, ease: 'power2.inOut',
        onUpdate: () => { const p = Math.round(state.v); num.textContent = p; bar.style.transform = `scaleX(${p / 100})`; if (p >= 90 && !ready) state.v = 90; },
        onComplete: () => { const w = setInterval(() => { if (ready) { clearInterval(w); num.textContent = 100; bar.style.transform = 'scaleX(1)'; done(); } }, 80); } });
    }

    addEventListener('load', () => ScrollTrigger.refresh());
  };

  boot_wrapper();
  function boot_wrapper() {
    // scripts "defer" : le DOM est prêt ; on attend GSAP/Lenis (aussi "defer", donc déjà exécutés avant ce fichier)
    if (window.gsap) boot(); else { let n = 0; const t = setInterval(() => { if (window.gsap || ++n > 40) { clearInterval(t); boot(); } }, 100); }
  }
})();
