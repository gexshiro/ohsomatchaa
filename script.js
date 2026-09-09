/* OH SO MATCHA — final interaction layer */

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  const openNav = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('open') ? closeNav() : openNav();
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeNav();
  }, { passive: true });
}

/* LAST-GOOD SCROLL REVEAL — deliberately simple and stable. */
document.querySelectorAll('.reveal').forEach((el) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => entry.target.classList.add('visible'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .13, rootMargin: '0px 0px -6% 0px' });
  observer.observe(el);
});

/* Header scroll state */
const hdr = document.querySelector('.site-header');
if (hdr) {
  const syncHeader = () => hdr.classList.toggle('header-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
}


/* Fullscreen gallery viewer with next/previous navigation. */
const lightbox = document.querySelector('.lightbox');
const lightImg = lightbox?.querySelector('img');
const lightCaption = lightbox?.querySelector('.lightbox-caption');
const lightCounter = lightbox?.querySelector('.lightbox-counter');
const closeBtn = lightbox?.querySelector('.lightbox-close');
const prevBtn = lightbox?.querySelector('.lightbox-prev');
const nextBtn = lightbox?.querySelector('.lightbox-next');
const galleryItems = Array.from(document.querySelectorAll('.gallery-img'));
let currentGalleryIndex = 0;
let previousFocus = null;

const getGalleryData = (index) => {
  const item = galleryItems[index];
  const img = item?.querySelector('img');
  return {
    src: item?.dataset.full || img?.currentSrc || img?.src || '',
    alt: img?.alt || 'Oh So Matcha gallery image'
  };
};

const renderGalleryImage = (index) => {
  if (!lightbox || !lightImg || !galleryItems.length) return;
  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const { src, alt } = getGalleryData(currentGalleryIndex);
  lightImg.src = src;
  lightImg.alt = alt;
  if (lightCaption) lightCaption.textContent = alt;
  if (lightCounter) lightCounter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
};

const openLightbox = (index) => {
  if (!lightbox || !lightImg || !galleryItems.length) return;
  previousFocus = document.activeElement;
  renderGalleryImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeBtn?.focus({ preventScroll: true });
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lightImg) lightImg.src = '';
  if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  previousFocus = null;
};

galleryItems.forEach((item, index) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox(index);
  });
});

closeBtn?.addEventListener('click', closeLightbox);
prevBtn?.addEventListener('click', () => renderGalleryImage(currentGalleryIndex - 1));
nextBtn?.addEventListener('click', () => renderGalleryImage(currentGalleryIndex + 1));

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    renderGalleryImage(currentGalleryIndex - 1);
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    renderGalleryImage(currentGalleryIndex + 1);
  }
});

/* Menu filters with cancellation-safe transitions. */
const filters = document.querySelectorAll('.menu-filter');
const sections = document.querySelectorAll('[data-menu-category]');
if (filters.length && sections.length) {
  let filterRun = 0;
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const run = ++filterRun;
    filters.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    sections.forEach((sec) => {
      if (sec._filterTimer) clearTimeout(sec._filterTimer);
      const show = cat === 'all' || sec.dataset.menuCategory === cat;
      if (!show) {
        sec.style.transition = 'opacity .25s ease, transform .25s ease';
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(-7px)';
        sec._filterTimer = setTimeout(() => {
          if (run === filterRun && (cat !== 'all' && sec.dataset.menuCategory !== cat)) {
            sec.style.display = 'none';
          }
        }, 240);
      } else {
        sec.style.display = 'block';
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (run !== filterRun) return;
          sec.style.transition = 'opacity .38s ease,transform .42s cubic-bezier(.2,.82,.2,1)';
          sec.style.opacity = '1';
          sec.style.transform = 'none';
        }));
      }
    });
  }));
}

/* Subtle button magnetic hover */
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.btn,.nav-cta').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * 2.2}px,${dy * 1.3 - 2}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}
