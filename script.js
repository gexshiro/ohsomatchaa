/* =========================================================
   OH SO MATCHA — CLEAN INTERACTION LAYER
   ========================================================= */

/* =========================
   MOBILE NAVIGATION
   ========================= */

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();

    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 900) {
        closeNav();
      }
    },
    { passive: true }
  );
}

/* =========================
   SCROLL REVEAL
   ========================= */

document.querySelectorAll('.reveal').forEach((el) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.13,
      rootMargin: '0px 0px -6% 0px'
    }
  );

  observer.observe(el);
});

/* =========================
   HEADER SCROLL STATE
   ========================= */

const header = document.querySelector('.site-header');

if (header) {
  const syncHeader = () => {
    header.classList.toggle('header-scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', syncHeader, {
    passive: true
  });

  syncHeader();
}

/* =========================
   DESKTOP VIEW CURSOR
   ========================= */

if (window.matchMedia('(pointer:fine)').matches) {
  const badge = document.querySelector('.cursor-badge');

  if (badge) {
    let mouseX = 0;
    let mouseY = 0;
    let badgeX = 0;
    let badgeY = 0;

    const animateBadge = () => {
      badgeX += (mouseX - badgeX) * 0.17;
      badgeY += (mouseY - badgeY) * 0.17;

      badge.style.left = `${badgeX}px`;
      badge.style.top = `${badgeY}px`;

      requestAnimationFrame(animateBadge);
    };

    animateBadge();

    const targets = document.querySelectorAll(
      [
        '.gallery-img',
        '.hero-media',
        '.hero-screenshot-media',
        '.card',
        '.photo-card',
        '.panel-photo',
        '.map-card',
        '.location-map',
        '.owner-card',
        '.owner-card-photo',
        '.food-shot'
      ].join(',')
    );

    targets.forEach((element) => {
      element.addEventListener('mouseenter', () => {
        const isMap =
          element.classList.contains('map-card') ||
          element.classList.contains('location-map');

        badge.textContent = isMap ? 'VISIT' : 'VIEW';
        badge.classList.add('show');
      });

      element.addEventListener('mouseleave', () => {
        badge.classList.remove('show');
      });

      element.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
      });
    });
  }
}

/* =========================
   GALLERY LIGHTBOX
   ========================= */

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');

const closeLightbox = () => {
  if (!lightbox) return;

  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
};

document.querySelectorAll('.gallery-img').forEach((item) => {
  item.addEventListener('click', () => {
    const image = item.querySelector('img');

    const source =
      item.dataset.full ||
      image?.getAttribute('src');

    if (!lightbox || !lightboxImage || !source) {
      return;
    }

    lightboxImage.src = source;
    lightboxImage.alt = image?.getAttribute('alt') || '';

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

lightbox?.querySelector('button')?.addEventListener(
  'click',
  closeLightbox
);

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
  }
});

/* =========================
   MENU FILTERS
   ========================= */

const filters = document.querySelectorAll('.menu-filter');
const menuSections = document.querySelectorAll('[data-menu-category]');

if (filters.length && menuSections.length) {
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((btn) => {
        btn.classList.remove('active');
      });

      button.classList.add('active');

      const category = button.dataset.filter;

      menuSections.forEach((section) => {
        const shouldShow =
          category === 'all' ||
          section.dataset.menuCategory === category;

        if (!shouldShow) {
          section.style.opacity = '0';
          section.style.transform = 'translateY(-7px)';

          setTimeout(() => {
            if (
              category !== 'all' &&
              section.dataset.menuCategory !== category
            ) {
              section.style.display = 'none';
            }
          }, 250);
        } else {
          section.style.display = 'block';
          section.style.opacity = '0';
          section.style.transform = 'translateY(8px)';

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              section.style.transition =
                'opacity .38s ease, transform .42s cubic-bezier(.2,.82,.2,1)';

              section.style.opacity = '1';
              section.style.transform = 'none';
            });
          });
        }
      });
    });
  });
}

/* =========================
   MISSING PHOTO HANDLER
   =========================
   Only handles actual image files.
   The intentionally empty image inside the lightbox is ignored.
   ========================= */

document.addEventListener(
  'error',
  (event) => {
    const image = event.target;

    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    /* Ignore the lightbox image */
    if (image.closest('.lightbox')) {
      return;
    }

    const source = image.getAttribute('src') || '';

    /* Ignore intentionally empty images */
    if (!source) {
      return;
    }

    const filename =
      image.getAttribute('data-photo-file') ||
      source.split('/').pop() ||
      'missing-image';

    if (image.dataset.missingHandled === '1') {
      return;
    }

    image.dataset.missingHandled = '1';

    const placeholder = document.createElement('div');

    placeholder.className = 'missing-photo';

    placeholder.setAttribute(
      'role',
      'img'
    );

    placeholder.setAttribute(
      'aria-label',
      `Missing photo: ${filename}`
    );

    placeholder.innerHTML = `
      <strong>PHOTO MISSING</strong>
      <code>${filename}</code>
      <small>This page is looking for this exact image file.</small>
    `;

    image.style.display = 'none';
    image.setAttribute('aria-hidden', 'true');

    image.parentNode?.insertBefore(
      placeholder,
      image
    );
  },
  true
);

/* Catch image failures that happened before the
   error listener was attached. */

document
  .querySelectorAll('img[data-photo-file]')
  .forEach((image) => {
    if (
      !image.closest('.lightbox') &&
      image.getAttribute('src') &&
      image.complete &&
      image.naturalWidth === 0
    ) {
      image.dispatchEvent(
        new Event('error')
      );
    }
  });
