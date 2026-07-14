'use strict';

// ─── UTILS ────────────────────────────────────────────────────────
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ═══════════════════════════════════════════════════════════════
//  SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
(function initProgressBar() {
  if (REDUCED) return;
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, {
    position: 'fixed', top: '0', left: '0',
    width: '0%', height: '2px',
    background: 'linear-gradient(to right, #e8960a, #4a9eff)',
    zIndex: '200', pointerEvents: 'none',
    transition: 'width .1s linear',
  });
  document.body.prepend(bar);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION — hide/show on scroll + active link + hamburger
// ═══════════════════════════════════════════════════════════════
(function initNav() {
  const header = $('#nav-header');
  const hamburger = $('#nav-hamburger');
  const mobileNav = $('#nav-mobile');
  const mobileLinks = $$('.nav-mobile-link');
  if (!header) return;

  // Hide/show on scroll
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('hidden', y > lastY && y > 120);
      header.classList.toggle('scrolled', y > 50);
      lastY = y;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  // Active link via IntersectionObserver
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.25 });
  sections.forEach(s => io.observe(s));

  // Hamburger / mobile drawer
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
    });
    // Close on link click
    mobileLinks.forEach(l => l.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
    }));
    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  }
})();

// ═══════════════════════════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════
(function initReveal() {
  const targets = $$(
    '.reveal-clip-right, .reveal-curtain-drop, .reveal-slide-from-edge, .reveal-fade-from-black'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -35px 0px' });

  targets.forEach(t => io.observe(t));
})();

// ═══════════════════════════════════════════════════════════════
//  STAT COUNTERS
// ═══════════════════════════════════════════════════════════════
(function initCounters() {
  const nums = $$('.stat-number[data-target]');
  if (!nums.length) return;

  function count(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    if (REDUCED) { el.textContent = target + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - (1 - p) ** 3;
      el.textContent = Math.round(target * ease) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { count(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(el => io.observe(el));
})();

// ═══════════════════════════════════════════════════════════════
//  HERO MOUSE PARALLAX
// ═══════════════════════════════════════════════════════════════
(function initHeroParallax() {
  if (REDUCED) return;
  const hero = $('#hero');
  const fogAmber = $('.hero-fog-amber');
  const fogIce = $('.hero-fog-ice');
  if (!hero || !fogAmber || !fogIce) return;

  let mx = 0, my = 0, cx = 0, cy = 0, raf = null;
  const STR = 14, LERP = 0.055;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(animate);
  });
  hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });

  function animate() {
    raf = null;
    cx += (mx - cx) * LERP;
    cy += (my - cy) * LERP;
    fogAmber.style.transform = `translate(${-cx * STR * .8}px,${-cy * STR * .5}px)`;
    fogIce.style.transform   = `translate(${cx * STR * .6}px,${cy * STR * .4}px)`;
    if (Math.abs(cx) > 0.001 || Math.abs(cy) > 0.001) raf = requestAnimationFrame(animate);
  }
})();

// ═══════════════════════════════════════════════════════════════
//  SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════
(function initScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ═══════════════════════════════════════════════════════════════
//  SERVICE ROWS — expand / collapse
// ═══════════════════════════════════════════════════════════════
(function initServiceRows() {
  const rows = $$('.service-row');

  // Wrap inner content for grid
  rows.forEach(row => {
    // Build inner wrapper
    const inner = document.createElement('div');
    inner.className = 'service-row-inner';
    // Move children into wrapper
    while (row.firstChild) inner.appendChild(row.firstChild);
    row.appendChild(inner);
  });

  rows.forEach(row => {
    function toggle() {
      const isActive = row.classList.contains('active');
      // Close all
      rows.forEach(r => {
        r.classList.remove('active');
        r.setAttribute('aria-expanded', 'false');
      });
      // Open this if was closed
      if (!isActive) {
        row.classList.add('active');
        row.setAttribute('aria-expanded', 'true');
      }
    }
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
})();

// Project filtering is handled in the unified deck system module below.

// ═══════════════════════════════════════════════════════════════
//  CONTACT FORM — validation + mailto submit
// ═══════════════════════════════════════════════════════════════
(function initContactForm() {
  const form = $('#contact-form');
  const toast = $('#toast');
  if (!form) return;

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVAvc7CaEZ0MV-trOIIquoT6sJJAKm-89rqeOfPA_PjJtZrtzCGkBOX5Rh6vUG5A2L/exec';

  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' toast--error' : '');
    setTimeout(() => toast.className = 'toast', 4000);
  }

  function validate() {
    let valid = true;

    const fields = [
      { id: 'form-name',    errId: 'err-name',    msg: 'Please enter your full name.',       check: v => v.trim().length >= 2 },
      { id: 'form-email',   errId: 'err-email',   msg: 'Please enter a valid email address.', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: 'form-service', errId: 'err-service', msg: 'Please select a service.',            check: v => v !== '' },
      { id: 'form-message', errId: 'err-message', msg: 'Please describe your project (min 20 chars).', check: v => v.trim().length >= 20 },
    ];

    fields.forEach(({ id, errId, msg, check }) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errId);
      const val = input ? input.value : '';
      const ok = check(val);
      if (input) input.classList.toggle('error', !ok);
      if (errEl) errEl.textContent = ok ? '' : msg;
      if (!ok) valid = false;
    });

    return valid;
  }

  // Clear errors on input
  $$('.form-input', form).forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errEl = document.getElementById(`err-${input.id.replace('form-', '')}`);
      if (errEl) errEl.textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors above.', true);
      return;
    }

    const btn = $('#contact-submit-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const service = document.getElementById('form-service').value;
    const message = document.getElementById('form-message').value.trim();

    // Check if script URL is configured and valid
    const isConfigured = GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

    if (isConfigured) {
      const payload = { name, email, service, message };

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Bypasses preflight OPTIONS and handles redirect. Response will be opaque.
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        showToast('✓ Project inquiry initiated successfully! We will contact you soon.');
        form.reset();
        $$('.form-input', form).forEach(i => {
          i.classList.add('fg-success');
          setTimeout(() => i.classList.remove('fg-success'), 2500);
        });
      })
      .catch(err => {
        console.error('Google Sheets submission error:', err);
        btn.classList.remove('loading');
        btn.disabled = false;
        showToast('✗ Submission failed. Please check network or try again.', true);
      });
    } else {
      // Fallback to mailto
      const subject = encodeURIComponent(`[TASKAS] New Project Inquiry — ${service}`);
      const body    = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nProject Details:\n${message}`
      );
      const mailtoLink = `mailto:team@taskas.tech?subject=${subject}&body=${body}`;

      setTimeout(() => {
        window.location.href = mailtoLink;
        btn.classList.remove('loading');
        btn.disabled = false;
        showToast('✓ Your email client has opened. We look forward to hearing from you!');
        form.reset();
        $$('.form-input', form).forEach(i => {
          i.classList.add('fg-success');
          setTimeout(() => i.classList.remove('fg-success'), 2500);
        });
      }, 800);
    }
  });

  // Pre-populate plan if selected from pricing page
  const selectedPlan = localStorage.getItem('selected-plan');
  if (selectedPlan) {
    const serviceSelect = document.getElementById('form-service');
    const messageTextarea = document.getElementById('form-message');
    if (serviceSelect && messageTextarea) {
      let optionExists = Array.from(serviceSelect.options).some(opt => opt.value === selectedPlan);
      if (!optionExists) {
        const newOpt = document.createElement('option');
        newOpt.value = selectedPlan;
        newOpt.textContent = selectedPlan;
        serviceSelect.appendChild(newOpt);
      }
      serviceSelect.value = selectedPlan;
      
      const planName = selectedPlan.split(' ')[0];
      messageTextarea.value = `I am interested in initiating the ${planName} plan. Let's discuss details and timelines.`;
      
      localStorage.removeItem('selected-plan');
      
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 600);
    }
  }
})();

// ═══════════════════════════════════════════════════════════════
//  WORDMARK SHIMMER (after entrance)
// ═══════════════════════════════════════════════════════════════
(function initWordmarkShimmer() {
  if (REDUCED) return;
  const wm = $('#hero-wordmark');
  if (!wm) return;

  setTimeout(() => {
    const style = document.createElement('style');
    style.textContent = `
      #hero-wordmark {
        background-size: 200% 100%;
        animation: wordmark-shimmer 7s ease-in-out infinite, wordmark-reveal 1.8s cubic-bezier(0.16,1,0.3,1) .5s both !important;
      }
      @keyframes wordmark-shimmer {
        0%,100% { background-position: 0% 0; }
        50%      { background-position: 100% 0; }
      }
    `;
    document.head.appendChild(style);
  }, 2400);
})();

// ═══════════════════════════════════════════════════════════════
//  THEME TOGGLE SYSTEM
// ═══════════════════════════════════════════════════════════════
(function initThemeToggle() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const getTheme = () => {
    const saved = localStorage.getItem('taskas-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light-theme', isLight);
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    localStorage.setItem('taskas-theme', theme);
    
    // Dispatch custom event to notify WebGL scene
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  };

  // Initial load
  applyTheme(getTheme());

  toggle.addEventListener('click', () => {
    const current = document.documentElement.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(current);
  });
})();

// ═══════════════════════════════════════════════════════════════
//  3D WEBGL PARTICLE CONSTELLATION
// ═══════════════════════════════════════════════════════════════
(function initWebGLScene() {
  const canvas = $('#webgl-canvas');
  if (!canvas) return;

  // Check WebGL support
  let gl;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {}
  if (!gl) {
    console.warn("WebGL not supported. 3D canvas disabled.");
    canvas.style.display = 'none';
    return;
  }

  // Three.js setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // transparent background to see CSS gradients
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Programmatic circular dot texture
  const createCircleTexture = () => {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(c);
  };

  const texture = createCircleTexture();

  // Build particles
  const particleCount = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const originalColors = {
    dark: [],
    light: []
  };
  
  // Custom properties for motion
  const randomOffsets = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  // Helpers to get primary/secondary colors
  const getTealColor = (isLight) => isLight ? new THREE.Color('#0ea5e9') : new THREE.Color('#00f2fe');
  const getIndigoColor = (isLight) => isLight ? new THREE.Color('#6366f1') : new THREE.Color('#7f00ff');

  const isLightTheme = () => document.documentElement.classList.contains('light-theme');

  for (let i = 0; i < particleCount; i++) {
    // Distribute in a cylinder or wave grid shape
    const theta = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 80;
    
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    // Define colors for both modes
    const isPrimary = Math.random() > 0.4;
    const colorDark = isPrimary ? getTealColor(false) : getIndigoColor(false);
    const colorLight = isPrimary ? getTealColor(true) : getIndigoColor(true);

    originalColors.dark.push(colorDark);
    originalColors.light.push(colorLight);

    const activeColor = isLightTheme() ? colorLight : colorDark;
    colors[i * 3] = activeColor.r;
    colors[i * 3 + 1] = activeColor.g;
    colors[i * 3 + 2] = activeColor.b;

    randomOffsets[i] = Math.random() * 100;
    speeds[i] = 0.2 + Math.random() * 0.8;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Global light (ambient only, simple)
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Handle Theme Changed
  window.addEventListener('theme-changed', (e) => {
    const isLight = e.detail.theme === 'light';
    const colorAttribute = geometry.getAttribute('color');
    
    // Change blending mode: AdditiveBlending looks great on dark mode, NormalBlending works better for high contrast on light mode
    material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.opacity = isLight ? 0.9 : 0.8;
    material.size = isLight ? 2.5 : 2.0; // Slightly larger on light mode for contrast

    const activeList = isLight ? originalColors.light : originalColors.dark;
    for (let i = 0; i < particleCount; i++) {
      colorAttribute.setXYZ(i, activeList[i].r, activeList[i].g, activeList[i].b);
    }
    colorAttribute.needsUpdate = true;
  });

  // Mouse Interactivity
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) - 0.5;
    targetMouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  // Scroll Interactivity
  let scrollOffset = 0;
  let targetScrollOffset = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScrollOffset = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, { passive: true });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, /Android|iPhone|iPad/i.test(navigator.userAgent) ? 1 : 2));
  });

  // Animation Loop
  let clock = new THREE.Clock();
  let active = true;

  // Use Page Visibility API to save CPU when tab is inactive
  document.addEventListener('visibilitychange', () => {
    active = !document.hidden;
  });

  const animate = () => {
    if (!active) {
      requestAnimationFrame(animate);
      return;
    }

    const elapsedTime = clock.getElapsedTime();

    // Lerp mouse coordinates for smooth lag-behind follow effect
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Lerp scroll progress
    scrollOffset += (targetScrollOffset - scrollOffset) * 0.08;

    // 1. Move camera based on mouse parallax
    camera.position.x += (mouseX * 40 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 40 - camera.position.y) * 0.05;
    
    // 2. Zoom in/out and pan down based on scroll
    camera.position.z = 80 - scrollOffset * 25;
    camera.position.y += (-scrollOffset * 40 - camera.position.y) * 0.08;
    camera.lookAt(0, -scrollOffset * 40, 0);

    // 3. Animate particles: subtle wave drift (sine wave movement)
    const positionAttribute = geometry.getAttribute('position');
    for (let i = 0; i < particleCount; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      
      // Wave motion on Z axis depending on X and Y positions
      const offset = randomOffsets[i];
      const speed = speeds[i];
      const zValue = Math.sin(elapsedTime * speed + offset) * 5 + Math.cos(x * 0.05 + elapsedTime * 0.5) * 4;
      
      positionAttribute.setZ(i, zValue);
    }
    positionAttribute.needsUpdate = true;

    // Slowly rotate the entire particle system
    particleSystem.rotation.y = elapsedTime * 0.03 + scrollOffset * Math.PI * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
})();

// ═══════════════════════════════════════════════════════════════
//  PROJECT BLUR REVEAL DECK CAROUSEL SYSTEM
// ═══════════════════════════════════════════════════════════════
(function initProjectDeckSystem() {
  const cards = $$('.project-card');
  const filterBtns = $$('.filter-btn');
  const prevBtn = $('#deck-prev-btn');
  const nextBtn = $('#deck-next-btn');
  const dotsContainer = $('#deck-dots');
  
  if (!cards.length) return;
  
  let activeIndex = 0;
  let visibleCards = [...cards];
  let autoLoopInterval = null;
  const LOOP_DURATION = 5000; // 5 seconds per card

  function startAutoLoop() {
    stopAutoLoop();
    autoLoopInterval = setInterval(() => {
      next();
    }, LOOP_DURATION);
  }

  function stopAutoLoop() {
    if (autoLoopInterval) {
      clearInterval(autoLoopInterval);
      autoLoopInterval = null;
    }
  }

  function resetAutoLoop() {
    startAutoLoop();
  }
  
  // Text blur-reveal processing
  // Split titles and descriptions into individual word spans
  cards.forEach(card => {
    const titleEl = $('.project-name', card);
    const descEl = $('.project-desc', card);
    
    if (titleEl) {
      const text = titleEl.textContent.trim();
      titleEl.innerHTML = '';
      const words = text.split(/\s+/);
      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.className = 'dc-word';
        span.textContent = word;
        span.style.animationDelay = `${100 + idx * 30}ms`;
        titleEl.appendChild(span);
        if (idx < words.length - 1) {
          titleEl.appendChild(document.createTextNode(' '));
        }
      });
    }
    
    if (descEl) {
      const text = descEl.textContent.trim();
      descEl.innerHTML = '';
      const words = text.split(/\s+/);
      words.forEach((word, idx) => {
        const span = document.createElement('span');
        span.className = 'dc-word';
        span.textContent = word;
        span.style.animationDelay = `${230 + idx * 18}ms`;
        descEl.appendChild(span);
        if (idx < words.length - 1) {
          descEl.appendChild(document.createTextNode(' '));
        }
      });
    }
  });

  // Hover Parallax Tilt (active card only)
  cards.forEach(card => {
    const inner = $('.project-card-inner', card);
    if (!inner) return;
    
    let bounds;
    
    const onMouseEnter = () => {
      // Only tilt if it's the active card
      if (visibleCards[activeIndex] !== card) return;
      bounds = card.getBoundingClientRect();
      card.classList.add('is-tilting');
      stopAutoLoop(); // Pause auto-slide when hovering active card
    };
    
    const onMouseMove = (e) => {
      if (visibleCards[activeIndex] !== card) return;
      if (!bounds) bounds = card.getBoundingClientRect();
      
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      
      const percentX = mouseX / bounds.width;
      const percentY = mouseY / bounds.height;
      
      const maxTilt = 8; // subtle tilt angle
      const tiltY = (percentX - 0.5) * maxTilt * 2;
      const tiltX = (percentY - 0.5) * -maxTilt * 2;
      
      inner.style.setProperty('--tilt-x', `${tiltX}deg`);
      inner.style.setProperty('--tilt-y', `${tiltY}deg`);
    };
    
    const onMouseLeave = () => {
      card.classList.remove('is-tilting');
      inner.style.removeProperty('--tilt-x');
      inner.style.removeProperty('--tilt-y');
      bounds = null;
      if (visibleCards[activeIndex] === card) {
        startAutoLoop(); // Resume auto-slide when leaving active card
      }
    };
    
    card.addEventListener('mouseenter', onMouseEnter, { passive: true });
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });

  // Stacking logic (3D Horizontal Feature Carousel)
  function restackCards() {
    const n = visibleCards.length;
    if (n === 0) return;
    
    cards.forEach(c => {
      c.style.display = 'none'; // hide all cards globally first
    });

    const w = window.innerWidth;
    let tx, ry, scaleFactor;
    
    if (w >= 1024) {
      tx = 46;
      ry = 12;
      scaleFactor = 0.85;
    } else if (w >= 768) {
      tx = 42;
      ry = 10;
      scaleFactor = 0.82;
    } else if (w >= 480) {
      tx = 36;
      ry = 8;
      scaleFactor = 0.75;
    } else {
      tx = 30;
      ry = 6;
      scaleFactor = 0.70;
    }

    visibleCards.forEach((card, i) => {
      card.style.display = 'block'; // show visible cards
      
      const inner = $('.project-card-inner', card);
      if (!inner) return;
      
      // Determine relative circular offset
      let offset = i - activeIndex;
      while (offset > n / 2) offset -= n;
      while (offset < -n / 2) offset += n;

      const isFront = offset === 0;
      const isVisible = Math.abs(offset) <= 1;

      if (isFront) {
        card.style.zIndex = 10;
        card.style.transform = 'translateX(0%) scale(1) rotateY(0deg)';
        card.style.opacity = '1';
        card.style.filter = 'blur(0px)';
        card.style.visibility = 'visible';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.zIndex = 5 - Math.abs(offset);
        card.style.pointerEvents = 'none';
        
        // Remove hover tilt offsets for inactive cards
        inner.style.removeProperty('--tilt-x');
        inner.style.removeProperty('--tilt-y');
        
        if (isVisible) {
          card.style.transform = `translateX(${offset * tx}%) scale(${scaleFactor}) rotateY(${-offset * ry}deg)`;
          card.style.opacity = '0.4';
          card.style.filter = 'blur(4px)';
          card.style.visibility = 'visible';
        } else {
          // Offscreen cards recede and fade
          card.style.transform = `translateX(${offset * tx}%) scale(${scaleFactor - 0.15}) rotateY(${-offset * (ry + 5)}deg)`;
          card.style.opacity = '0';
          card.style.filter = 'blur(6px)';
          card.style.visibility = 'hidden';
        }
      }
    });

    // Generate/update pagination dots
    updateDots();
    
    // Trigger animations for the active card
    triggerTextAnimations();
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    
    visibleCards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'deck-dot' + (idx === activeIndex ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(idx === activeIndex));
      dot.setAttribute('aria-label', `Project ${idx + 1} of ${visibleCards.length}`);
      
      dot.addEventListener('click', () => {
        if (idx === activeIndex) return;
        activeIndex = idx;
        restackCards();
        resetAutoLoop();
      });
      
      dotsContainer.appendChild(dot);
    });
  }

  function triggerTextAnimations() {
    const activeCard = visibleCards[activeIndex];
    if (!activeCard) return;
    
    // Reset and trigger word animations
    const words = $$('.dc-word', activeCard);
    words.forEach(word => {
      // Re-trigger CSS animation
      word.style.animation = 'none';
      word.offsetHeight; // trigger reflow
      word.style.animation = '';
    });
  }

  // Navigation handlers
  function next() {
    const n = visibleCards.length;
    if (n <= 1) return;
    activeIndex = (activeIndex + 1) % n;
    restackCards();
    resetAutoLoop();
  }

  function prev() {
    const n = visibleCards.length;
    if (n <= 1) return;
    activeIndex = (activeIndex - 1 + n) % n;
    restackCards();
    resetAutoLoop();
  }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // Swipe/Drag gestures
  let startX = null;
  
  cards.forEach(card => {
    card.addEventListener('pointerdown', (e) => {
      // Swipe/drag only works on top card
      if (visibleCards[activeIndex] !== card) return;
      startX = e.clientX;
    }, { passive: true });
    
    card.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const diffX = e.clientX - startX;
      startX = null;
      
      if (diffX < -50) {
        next();
      } else if (diffX > 50) {
        prev();
      }
    }, { passive: true });
  });

  // Filter integration
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        
        // Update active class on filter buttons
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Filter visible card set
        visibleCards = cards.filter(card => {
          const cats = (card.dataset.category || '').split(' ');
          return filter === 'all' || cats.includes(filter);
        });
        
        // Reset active state
        activeIndex = 0;
        restackCards();
        resetAutoLoop();
      });
    });
  }

  // Recalculate layout on window resize / orientation change
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      restackCards();
      resetAutoLoop();
    }, 100);
  });

  // Expose deck controls for debugging
  window.__deck = {
    next,
    prev,
    startAutoLoop,
    stopAutoLoop,
    getActiveIndex: () => activeIndex,
    getAutoLoopInterval: () => autoLoopInterval,
    getVisibleCards: () => visibleCards
  };

  // Initialize
  restackCards();
  startAutoLoop();
})();

