/* ─────────────────────────────────────────
       INTRO / CINEMATIC ENTRANCE
    ───────────────────────────────────────── */
    (function () {
      const intro = document.getElementById('intro');
      const brand = document.getElementById('introBrand');
      const sub = document.getElementById('introSub');
      const bar = document.getElementById('introBar');
      const petals = document.querySelectorAll('.aperture-petal');

      // Draw tick marks around aperture ring
      const ticks = document.getElementById('ticks');
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * 360;
        const rad = angle * Math.PI / 180;
        const r1 = 82, r2 = i % 5 === 0 ? 76 : 79;
        const x1 = 90 + r1 * Math.sin(rad), y1 = 90 - r1 * Math.cos(rad);
        const x2 = 90 + r2 * Math.sin(rad), y2 = 90 - r2 * Math.cos(rad);
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
        ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
        ticks.appendChild(ln);
      }

      let petalsDone = false;
      // Rotate aperture continuously
      let rot = 0;
      const apertureEl = document.querySelector('.aperture svg');
      function rotateLens() {
        rot += 0.4;
        apertureEl.style.transform = `rotate(${rot}deg)`;
        requestAnimationFrame(rotateLens);
      }
      rotateLens();

      // Show petals one by one
      petals.forEach((p, i) => {
        setTimeout(() => {
          p.style.opacity = '1';
          if (i === petals.length - 1) petalsDone = true;
        }, 100 + i * 90);
      });

      // Show brand text
      setTimeout(() => { brand.classList.add('show'); }, 700);
      setTimeout(() => { sub.classList.add('show'); }, 1100);

      // Progress bar
      setTimeout(() => { bar.classList.add('go'); }, 400);

      // Fade out intro after 2.8s
      setTimeout(() => {
        intro.classList.add('fade-out');
        document.body.classList.remove('locked');
        setTimeout(() => { intro.style.display = 'none'; }, 1100);
        // trigger hero bg zoom
        document.getElementById('heroBg').classList.add('zoomed');
      }, 2800);
    })();

    /* ─────────────────────────────────────────
       CURSOR GLOW (desktop only)
    ───────────────────────────────────────── */
    const glow = document.getElementById('cursor-glow');
    if (window.matchMedia('(pointer:fine)').matches) {
      document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
      });
      document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    }

    /* ─────────────────────────────────────────
       HEADER SCROLL
    ───────────────────────────────────────── */
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    /* ─────────────────────────────────────────
       MOBILE NAV
    ───────────────────────────────────────── */
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    }));

    /* ─────────────────────────────────────────
       REVEAL ON SCROLL
    ───────────────────────────────────────── */
    const revEls = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
    const revIO = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.12 });
    revEls.forEach(el => revIO.observe(el));

    /* ─────────────────────────────────────────
       FILM STRIP & LIGHTBOX STATE
    ───────────────────────────────────────── */
    let currentGalleryImages = [];
    let currentLightboxIdx = 0;

    const photos = [
      /* 1 — Indian Wedding bride ceremony */
      { src: 'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop', tag: 'WEDDING' },
      /* 2 — FIXED: Indian wedding couple (replaced broken URL) */
      { src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=800&auto=format&fit=crop', tag: 'WEDDING' },
      /* 3 — Pre-Wedding romantic outdoor couple */
      { src: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=800&auto=format&fit=crop', tag: 'PRE-WED' },
      /* 4 — Pre-Wedding couple nature */
      { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop', tag: 'PRE-WED' },
      /* 5 — CHANGED: Studio portrait with backdrop */
      { src: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=800&auto=format&fit=crop', tag: 'STUDIO' },
      /* 6 — CHANGED: Couple photography (MODEL removed) */
      { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop', tag: 'COUPLE' },
      /* 7 — Couple photography romantic */
      { src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop', tag: 'COUPLE' },
      /* 8 — Outdoor photography golden light */
      { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop', tag: 'OUTDOOR' },
      /* 9 — CHANGED: Outdoor golden-hour portrait */
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', tag: 'OUTDOOR' },
      /* 10 — Birthday celebration colourful */
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', tag: 'BIRTHDAY' },
    ];
    const track = document.getElementById('filmstrip');
    currentGalleryImages = photos.map(p => ({ src: p.src, tag: p.tag, title: p.tag + ' Photography' }));
    track.innerHTML = photos.map((p, i) => `
  <div class="frame" tabindex="0" data-cat="${p.tag}">
    <div class="sprockets">${'<span></span>'.repeat(9)}</div>
    <div class="frame-photo">
      <img src="${p.src}" alt="${p.tag} photography – Hobby Studio Visnagar, frame ${i + 1}" loading="lazy">
      <div class="frame-overlay"><div class="frame-overlay-text">${p.tag} · HOBBY STUDIO</div></div>
    </div>
    <div class="frame-footer"><span class="num">FRAME ${String(i + 1).padStart(3, '0')}</span><span>${p.tag}</span></div>
  </div>
`).join('');

    // Filter tabs
    document.getElementById('filterBar').addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.frame').forEach(f => {
        f.classList.toggle('hidden', cat !== 'ALL' && f.dataset.cat !== cat);
      });
    });

    // Drag / swipe scroll
    let isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; track.classList.add('dragging'); });
    track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - track.offsetLeft; track.scrollLeft = scrollLeft - (x - startX) * 1.2; });
    // Touch: native scrolling already works; add active class for highlight
    track.addEventListener('touchstart', () => { }, { passive: true });

    // Hover active state on mobile tap
    document.querySelectorAll('.frame').forEach(f => {
      f.addEventListener('touchstart', () => f.classList.add('active'), { passive: true });
      f.addEventListener('touchend', () => setTimeout(() => f.classList.remove('active'), 400), { passive: true });
    });

    // Arrow buttons
    const SCROLL_AMT = 310;
    document.getElementById('stripPrev').addEventListener('click', () => track.scrollBy({ left: -SCROLL_AMT, behavior: 'smooth' }));
    document.getElementById('stripNext').addEventListener('click', () => track.scrollBy({ left: SCROLL_AMT, behavior: 'smooth' }));
    attachFrameClicks();

    /* ─────────────────────────────────────────
       STAR RATING
    ───────────────────────────────────────── */
    let selectedStars = 5; // Default to 5 stars

    const starBtns = document.querySelectorAll(".star-btn");

    function updateStarsDisplay(val) {
      starBtns.forEach((btn, i) => {
        const lit = i < val;
        btn.classList.toggle("lit", lit);
        btn.style.color = lit ? "var(--gold-soft)" : "rgba(240, 233, 218, 0.3)";
      });
    }

    // Set initial 5-star view
    updateStarsDisplay(selectedStars);

    starBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        selectedStars = Number(btn.dataset.val);
        updateStarsDisplay(selectedStars);
      });

      btn.addEventListener("mouseenter", () => {
        const hoverVal = Number(btn.dataset.val);
        updateStarsDisplay(hoverVal);
      });

      btn.addEventListener("mouseleave", () => {
        updateStarsDisplay(selectedStars);
      });
    });

    /* ─────────────────────────────────────────
       FOOTER YEAR
    ───────────────────────────────────────── */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ═══════════════════════════════════════════
       🚀 BACKEND CONNECTION — HOBBY STUDIO
       ═══════════════════════════════════════════ */

    // If backend is hosted on a separate URL (e.g. Render backend + Vercel frontend),
    // set window.PRODUCTION_BACKEND_URL = 'https://your-api.onrender.com'
    const PROD_API_URL = window.PRODUCTION_BACKEND_URL || '';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

    const API_BASE = isLocal
      ? 'http://localhost:5000/api'
      : (PROD_API_URL ? `${PROD_API_URL.replace(/\/$/, '')}/api` : `${window.location.origin}/api`);

    const SERVER_URL = isLocal
      ? 'http://localhost:5000'
      : (PROD_API_URL ? PROD_API_URL.replace(/\/$/, '') : window.location.origin);

    // Initial fallback reviews if database is empty or offline
    const initialReviews = [
      { name: "Pooja & Harsh", service: "Wedding Photography", text: "Hobby Studio captured our wedding so beautifully. Every single frame feels magical and full of emotion!", stars: 5 },
      { name: "Meera Patel", service: "Pre-Wedding Shoot", text: "The team is exceptionally creative and patient. They made us feel so comfortable throughout the shoot.", stars: 5 },
      { name: "Ketan Shah", service: "Studio Portrait", text: "Outstanding quality and very professional service. Best photography studio in Visnagar without a doubt!", stars: 5 }
    ];

    function renderReviewList(reviewsList) {
      const container = document.getElementById('reviewCards');
      const noMsg = document.getElementById('noReviews');
      if (!container) return;

      container.querySelectorAll('.review-card').forEach(c => c.remove());

      if (!reviewsList || reviewsList.length === 0) {
        if (noMsg) noMsg.style.display = '';
        return;
      }

      if (noMsg) noMsg.style.display = 'none';

      reviewsList.forEach(r => {
        const starsNum = Math.min(5, Math.max(1, Number(r.stars) || 5));
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
          <div class="review-stars" style="color:var(--gold-soft);font-size:1.1rem;margin-bottom:8px;">${'★'.repeat(starsNum)}${'☆'.repeat(5 - starsNum)}</div>
          <div class="review-text">"${r.text}"</div>
          <div class="review-meta">
            <div class="review-author">${r.name}</div>
            <div class="review-type">${r.service || 'Photography'}</div>
          </div>`;
        container.appendChild(card);
      });
    }

    // ─── 1. SUBMIT BOOKING FORM ───
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const btn = this.querySelector('button[type="submit"]');
        const originalHtml = btn ? btn.innerHTML : '';
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<span>Submitting Booking...</span>';
        }

        const data = {
          name: document.getElementById('cName')?.value || '',
          phone: document.getElementById('cPhone')?.value || '',
          email: document.getElementById('cEmail')?.value || '',
          service: document.getElementById('cService')?.value || 'Wedding Photography',
          preferredDate: document.getElementById('cDate')?.value || '',
          message: document.getElementById('cMsg')?.value || '',
          hp_website: document.getElementById('cHpWebsite')?.value || '',
        };

        try {
          const res = await fetch(`${API_BASE}/public/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(result.error || 'Submission failed');

          alert('✓ ' + (result.message || 'Booking received! We will contact you within 24 hours.'));
          contactForm.reset();
        } catch (err) {
          console.error('Booking submission error:', err);
          alert('Could not submit booking: ' + err.message + '\nYou can also call us directly at +91 98790 81558.');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
        }
      });
    }

    // ─── 2. SUBMIT REVIEW ───
    const submitReviewBtn = document.getElementById('submitReview');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', async () => {
        const name = document.getElementById('rName')?.value.trim();
        const text = document.getElementById('rText')?.value.trim();
        const service = document.getElementById('rService')?.value || 'Wedding Photography';
        const bot_check = document.getElementById('rBotCheck')?.value || '';

        if (!name || !text) {
          alert("Please fill in both your name and review message.");
          return;
        }

        if (!selectedStars || selectedStars < 1 || selectedStars > 5) {
          alert("Please select a star rating (1 to 5 stars).");
          return;
        }

        submitReviewBtn.disabled = true;
        const originalBtnText = submitReviewBtn.innerHTML;
        submitReviewBtn.innerHTML = '<span>Submitting...</span>';

        try {
          const res = await fetch(`${API_BASE}/public/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              text,
              service,
              stars: Number(selectedStars),
              bot_check,
            })
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Failed to submit review");

          // Reset inputs
          if (document.getElementById("rName")) document.getElementById("rName").value = "";
          if (document.getElementById("rText")) document.getElementById("rText").value = "";
          selectedStars = 5;
          updateStarsDisplay(5);

          const successEl = document.getElementById("reviewSuccess");
          if (successEl) {
            successEl.style.display = "block";
            successEl.textContent = "✦ " + (data.message || "Thank you! Your review has been submitted.");
            setTimeout(() => { successEl.style.display = "none"; }, 5000);
          }

          // Reload updated review list
          await loadReviewsFromBackend();
        } catch (err) {
          console.error("Review submission error:", err);
          alert("Could not submit review: " + err.message);
        } finally {
          submitReviewBtn.disabled = false;
          submitReviewBtn.innerHTML = originalBtnText;
        }
      });
    }

    // ─── 3. LOAD REVIEWS FROM BACKEND ───
    async function loadReviewsFromBackend() {
      const reviewContainer = document.getElementById('reviewCards');
      if (reviewContainer && (!reviewContainer.children || !reviewContainer.children.length || reviewContainer.querySelector('.no-reviews'))) {
        const skeletonHtml = `
          <div class="skeleton-card"><div class="skeleton-line w-40"></div><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div></div>
          <div class="skeleton-card"><div class="skeleton-line w-40"></div><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div></div>
        `;
        if (typeof reviewContainer.insertAdjacentHTML === 'function') {
          reviewContainer.insertAdjacentHTML('afterbegin', skeletonHtml);
        }
      }
      try {
        const res = await fetch(`${API_BASE}/public/reviews`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        const reviews = data.reviews || [];

        if (reviews.length > 0) {
          renderReviewList(reviews);
        } else {
          renderReviewList(initialReviews);
        }
      } catch (err) {
        console.warn('Backend reviews unavailable, displaying initial reviews:', err.message);
        renderReviewList(initialReviews);
      }
    }

    // ─── 4. LOAD GALLERY FROM BACKEND ───
    async function loadGalleryFromBackend() {
      try {
        const res = await fetch(`${API_BASE}/public/gallery`);
        if (!res.ok) throw new Error('Failed to load gallery');
        const data = await res.json();
        const images = data.images || [];
        if (images.length === 0) return;

        const track = document.getElementById('filmstrip');
        if (!track) return;

        currentGalleryImages = images.map(p => ({
          src: p.image.startsWith('http') ? p.image : SERVER_URL + p.image,
          tag: p.category,
          title: p.title || (p.category + ' Photography')
        }));
        track.innerHTML = images.map((p, i) => `
          <div class="frame" tabindex="0" data-cat="${p.category}">
            <div class="sprockets">${'<span></span>'.repeat(9)}</div>
            <div class="frame-photo">
              <img src="${p.image.startsWith('http') ? p.image : SERVER_URL + p.image}" alt="${p.title || p.category + ' photography'}" loading="lazy">
              <div class="frame-overlay"><div class="frame-overlay-text">${p.category} · HOBBY STUDIO</div></div>
            </div>
            <div class="frame-footer">
              <span class="num">FRAME ${String(i + 1).padStart(3, '0')}</span>
              <span>${p.category}</span>
            </div>
          </div>
        `).join('');

        // Re-bind touch events
        document.querySelectorAll('.frame').forEach(f => {
          f.addEventListener('touchstart', () => f.classList.add('active'), { passive: true });
          f.addEventListener('touchend', () => setTimeout(() => f.classList.remove('active'), 400), { passive: true });
        });
        attachFrameClicks();
      } catch (err) {
        console.log('Using static gallery items:', err.message);
      }
    }


    /* ═══════════════════════════════════════════
       MODERN UI POLISH: FULLSCREEN LIGHTBOX
    ═══════════════════════════════════════════ */
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTag = document.getElementById('lightboxTag');
    const lightboxTitle = document.getElementById('lightboxTitle');

    function openLightbox(index) {
      if (!currentGalleryImages.length || !lightboxModal) return;
      currentLightboxIdx = (index + currentGalleryImages.length) % currentGalleryImages.length;
      const item = currentGalleryImages[currentLightboxIdx];
      
      lightboxImg.src = item.src;
      lightboxTag.textContent = item.tag || 'PORTFOLIO';
      lightboxTitle.textContent = item.title || 'Hobby Studio Visnagar';
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightboxModal) return;
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function prevLightbox() { openLightbox(currentLightboxIdx - 1); }
    function nextLightbox() { openLightbox(currentLightboxIdx + 1); }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);

    window.addEventListener('keydown', (e) => {
      if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
    });

    function attachFrameClicks() {
      const frames = document.querySelectorAll('.frame');
      frames.forEach((frame, idx) => {
        frame.style.cursor = 'zoom-in';
        frame.addEventListener('click', () => openLightbox(idx));
      });
    }



    // Initialize content
    loadReviewsFromBackend();
    loadGalleryFromBackend();

    /* ═══════════════════════════════════════════
       PWA SERVICE WORKER REGISTRATION (OFFLINE SPEED)
    ═══════════════════════════════════════════ */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('✓ PWA Service Worker active:', reg.scope))
          .catch(err => console.log('Service Worker note:', err.message));
      });
    }

    /* ═══════════════════════════════════════════
       FORM AUTOSAVE (LOCAL STORAGE DRAFT)
    ═══════════════════════════════════════════ */
    const DRAFT_KEY = 'hobby_studio_booking_draft';
    const formFields = ['cName', 'cPhone', 'cEmail', 'cService', 'cDate', 'cMsg'];

    // Restore draft if exists
    try {
      const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      formFields.forEach(id => {
        const el = document.getElementById(id);
        if (el && savedDraft[id] && !el.value) {
          el.value = savedDraft[id];
        }
      });
    } catch (e) {}

    // Auto-save on input
    formFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
            draft[id] = el.value;
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
          } catch (e) {}
        });
      }
    });

    // Clear draft on successful submit
    if (contactForm) {
      contactForm.addEventListener('submit', () => {
        setTimeout(() => {
          try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        }, 1000);
      });
    }