/* ============================================================
   Portfolio — Main Script
   Premium, dependency-free JavaScript for a personal portfolio.
   ES6+ · Intersection Observer · requestAnimationFrame
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. TYPING EFFECT
     ---------------------------------------------------------- */
  (() => {
    const el = document.querySelector('.typing-text');
    if (!el) return;

    const words = [
      'Full Stack Developer',
      'React Developer',
      'AI Enthusiast',
      'Software Engineer',
    ];
    const TYPING_SPEED   = 100;   // ms per character
    const ERASING_SPEED   = 50;
    const PAUSE_BETWEEN   = 2000;

    let wordIdx   = 0;
    let charIdx   = 0;
    let isErasing = false;

    const tick = () => {
      const current = words[wordIdx];

      if (isErasing) {
        charIdx--;
        el.textContent = current.substring(0, charIdx);

        if (charIdx === 0) {
          isErasing = false;
          wordIdx   = (wordIdx + 1) % words.length;
          setTimeout(tick, TYPING_SPEED);
        } else {
          setTimeout(tick, ERASING_SPEED);
        }
      } else {
        charIdx++;
        el.textContent = current.substring(0, charIdx);

        if (charIdx === current.length) {
          isErasing = true;
          setTimeout(tick, PAUSE_BETWEEN);
        } else {
          setTimeout(tick, TYPING_SPEED);
        }
      }
    };

    // Ensure blinking cursor via CSS is visible; kick off the loop.
    el.classList.add('typing-cursor');
    tick();
  })();

  /* ----------------------------------------------------------
     2. THEME TOGGLE  (dark ↔ light)
     ---------------------------------------------------------- */
  (() => {
    const btn  = document.querySelector('.theme-toggle');
    const icon = document.querySelector('.theme-toggle-icon');
    if (!btn) return;

    const STORAGE_KEY = 'theme';
    const MOON = '🌙';
    const SUN  = '☀️';

    const applyTheme = (theme) => {
      if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (icon) icon.innerHTML = SUN;
      } else {
        document.body.removeAttribute('data-theme');
        if (icon) icon.innerHTML = MOON;
      }
    };

    // Load saved preference (default → dark)
    const saved = localStorage.getItem(STORAGE_KEY);
    applyTheme(saved);                           // null → dark

    btn.addEventListener('click', () => {
      const isLight = document.body.getAttribute('data-theme') === 'light';
      const next    = isLight ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  })();

  /* ----------------------------------------------------------
     3. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  (() => {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollTop   = window.scrollY;
      const docHeight   = document.documentElement.scrollHeight - window.innerHeight;
      const percent     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width   = `${percent}%`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  })();

  /* ----------------------------------------------------------
     4. NAVBAR BEHAVIOR
     ---------------------------------------------------------- */
  (() => {
    const navbar   = document.querySelector('.navbar');
    const toggle   = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    // 4a — background opacity change on scroll
    if (navbar) {
      let ticking = false;
      const onScroll = () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // 4b — highlight active section link
        let currentId = '';
        sections.forEach((sec) => {
          const top = sec.offsetTop - 100;
          if (window.scrollY >= top) currentId = sec.id;
        });

        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });

        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(onScroll);
          ticking = true;
        }
      }, { passive: true });
    }

    // 4c — mobile menu toggle
    if (toggle && navbar) {
      toggle.addEventListener('click', () => {
        navbar.classList.toggle('nav-open');
      });
    }

    // 4d — close mobile menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navbar) navbar.classList.remove('nav-open');
      });
    });
  })();

  /* ----------------------------------------------------------
     5. SMOOTH SCROLLING  (anchor links → #target)
     ---------------------------------------------------------- */
  (() => {
    const NAVBAR_HEIGHT = 80;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;                     // bare "#" — ignore

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  })();

  /* ----------------------------------------------------------
     6. SCROLL ANIMATIONS  (Intersection Observer)
     ---------------------------------------------------------- */
  (() => {
    const items = document.querySelectorAll('.animate-on-scroll');
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);       // animate only once
          }
        });
      },
      { threshold: 0.15 },
    );

    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 100}ms`;   // staggered entrance
      observer.observe(el);
    });
  })();

  /* ----------------------------------------------------------
     7. SKILL CARD 3‑D TILT
     ---------------------------------------------------------- */
  (() => {
    const MAX_DEG = 5;

    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = e.clientX - rect.left;       // cursor x inside card
        const y    = e.clientY - rect.top;
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;

        // Normalise –1 → +1 then scale to MAX_DEG
        const rotateY =  ((x - cx) / cx) * MAX_DEG;
        const rotateX = -((y - cy) / cy) * MAX_DEG;

        card.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform =
          'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  })();

  /* ----------------------------------------------------------
     8. ACHIEVEMENT COUNTER ANIMATION
     ---------------------------------------------------------- */
  (() => {
    const counters = document.querySelectorAll('.counter-value[data-target]');
    if (counters.length === 0) return;

    const DURATION = 2000; // ms

    const animateCounter = (el) => {
      const target   = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals, 10) || 0;
      if (isNaN(target)) return;

      const start = performance.now();

      const step = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / DURATION, 1);

        // Ease‑out: 1 − (1 − t)²
        const eased = 1 - Math.pow(1 - progress, 2);
        const current = eased * target;
        el.textContent = decimals > 0
          ? current.toFixed(decimals)
          : Math.floor(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = decimals > 0
            ? target.toFixed(decimals)
            : target;                               // ensure exact value
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);       // once
          }
        });
      },
      { threshold: 0.15 },
    );

    counters.forEach((c) => observer.observe(c));
  })();

  /* ----------------------------------------------------------
     9. CONTACT FORM
     ---------------------------------------------------------- */
  (() => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const msg = document.querySelector('.form-message');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic required‑field validation
      const fields  = form.querySelectorAll('[required]');
      let allValid  = true;

      fields.forEach((field) => {
        if (!field.value.trim()) {
          allValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!allValid) return;

      // Show success feedback
      if (msg) {
        msg.textContent = 'Message sent successfully! I will get back to you soon.';
        msg.classList.add('success');
      }

      // Reset after 3 seconds
      setTimeout(() => {
        form.reset();
        if (msg) {
          msg.textContent = '';
          msg.classList.remove('success');
        }
      }, 3000);
    });
  })();

  /* ----------------------------------------------------------
     10. FLOATING ICONS PARALLAX
     ---------------------------------------------------------- */
  (() => {
    const hero  = document.querySelector('.hero-section');
    const icons = document.querySelectorAll('.floating-icon');
    if (!hero || icons.length === 0) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;

      // Offset from centre, normalised to –1 → +1
      const dx = (e.clientX - rect.left - cx) / cx;
      const dy = (e.clientY - rect.top  - cy) / cy;

      icons.forEach((icon) => {
        const speed = parseFloat(icon.dataset.speed) || 1;
        const x     = dx * 30 * speed;            // max ~30 px shift
        const y     = dy * 30 * speed;
        icon.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  })();

  /* ----------------------------------------------------------
     11. PROJECT CARD HOVER CLASS
     ---------------------------------------------------------- */
  (() => {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('mouseenter', () => card.classList.add('hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
    });
  })();

  /* ----------------------------------------------------------
     12. BACK TO TOP
     ---------------------------------------------------------- */
  (() => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 500) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ----------------------------------------------------------
     13. PRELOADER
     ---------------------------------------------------------- */
  (() => {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    });
  })();

  /* ----------------------------------------------------------
     14. PARTICLE BACKGROUND EFFECT  (hero canvas)
     ---------------------------------------------------------- */
  (() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 50;
    const LINE_DIST      = 150;
    const COLORS = [
      'rgba(108, 99, 255, 0.3)',
      'rgba(0, 212, 255, 0.3)',
    ];

    let particles = [];
    let animId    = null;

    // Size canvas to its parent / hero section
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width  = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      } else {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.radius = Math.random() * 2 + 1;            // 1‑3 px
        this.x      = Math.random() * canvas.width;
        this.y      = initial
          ? Math.random() * canvas.height
          : canvas.height + this.radius;                 // below screen
        this.speedY = -(Math.random() * 0.5 + 0.2);     // float upward
        this.speedX = (Math.random() - 0.5) * 0.3;      // gentle drift
        this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Off‑screen top → reset at bottom
        if (this.y + this.radius < 0) this.reset();
        // Wrap horizontally
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx   = particles[a].x - particles[b].x;
          const dy   = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINE_DIST) {
            const opacity = 1 - dist / LINE_DIST;       // fade with distance
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 99, 255, ${opacity * 0.15})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      // Skip frame when tab is not visible (performance)
      if (document.hidden) {
        animId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectParticles();

      animId = requestAnimationFrame(animate);
    };

    // Responsive resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, 200);
    });

    resize();
    init();
    animate();
  })();

}); /* end DOMContentLoaded */
