
/* =========================================================
   CLEAN SHARED INTERACTION SYSTEM
   ========================================================= */

/* Mobile navigation */
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');

if(toggle && nav){
  const closeNav=()=>{
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
  };

  toggle.addEventListener('click',(event)=>{
    event.stopPropagation();
    const isOpen=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click',closeNav);
  });

  document.addEventListener('click',event=>{
    if(!nav.contains(event.target) && !toggle.contains(event.target)){
      closeNav();
    }
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') closeNav();
  });

  window.addEventListener('resize',()=>{
    if(window.innerWidth>900) closeNav();
  },{passive:true});
}

/* LAST-GOOD scroll reveal system */
document.querySelectorAll('.reveal').forEach(el=>{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        requestAnimationFrame(()=>entry.target.classList.add('visible'));
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.13,rootMargin:'0px 0px -6% 0px'});
  observer.observe(el);
});

/* Header state */
const header=document.querySelector('.site-header');
if(header){
  const syncHeader=()=>{
    header.classList.toggle('header-scrolled',window.scrollY>24);
  };
  window.addEventListener('scroll',syncHeader,{passive:true});
  syncHeader();
}

/* Desktop cursor badge — never run on touch devices */
if(window.matchMedia('(pointer:fine)').matches){
  const badge=document.querySelector('.cursor-badge');
  if(badge){
    let mx=0,my=0,bx=0,by=0;

    const tick=()=>{
      bx+=(mx-bx)*.17;
      by+=(my-by)*.17;
      badge.style.left=bx+'px';
      badge.style.top=by+'px';
      requestAnimationFrame(tick);
    };
    tick();

    const targets=document.querySelectorAll(
      '.gallery-img,.hero-media,.hero-screenshot-media,.card,.photo-card,.panel-photo,.map-card,.owner-card-photo,.food-shot'
    );

    targets.forEach(el=>{
      el.addEventListener('mouseenter',()=>{
        badge.textContent=el.classList.contains('map-card')?'VISIT':'VIEW';
        badge.classList.add('show');
      });
      el.addEventListener('mouseleave',()=>{
        badge.classList.remove('show');
      });
      el.addEventListener('mousemove',event=>{
        mx=event.clientX;
        my=event.clientY;
      });
    });
  }
}

/* Gallery lightbox */
const lightbox=document.querySelector('.lightbox');
const lightImg=lightbox?.querySelector('img');
const closeLightbox=()=>{
  if(!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
};

document.querySelectorAll('.gallery-img').forEach(item=>{
  item.addEventListener('click',()=>{
    const src=item.dataset.full || item.querySelector('img')?.src;
    if(!lightbox || !lightImg || !src) return;
    lightImg.src=src;
    lightImg.alt=item.querySelector('img')?.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});

lightbox?.querySelector('button')?.addEventListener('click',closeLightbox);
lightbox?.addEventListener('click',event=>{
  if(event.target===lightbox) closeLightbox();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') closeLightbox();
});

/* Menu filters */
const filters=document.querySelectorAll('.menu-filter');
const sections=document.querySelectorAll('[data-menu-category]');

if(filters.length && sections.length){
  filters.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filters.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');

      const category=btn.dataset.filter;

      sections.forEach(section=>{
        const show=category==='all' || section.dataset.menuCategory===category;

        if(!show){
          section.style.opacity='0';
          section.style.transform='translateY(-7px)';
          setTimeout(()=>{
            if(category!=='all' && section.dataset.menuCategory!==category){
              section.style.display='none';
            }
          },250);
        }else{
          section.style.display='block';
          section.style.opacity='0';
          section.style.transform='translateY(8px)';

          requestAnimationFrame(()=>requestAnimationFrame(()=>{
            section.style.transition='opacity .38s ease,transform .42s cubic-bezier(.2,.82,.2,1)';
            section.style.opacity='1';
            section.style.transform='none';
          }));
        }
      });
    });
  });
}

/* Missing-image helper.
   Empty images inside the lightbox are intentionally ignored. */
(function(){
  const showMissing=(img)=>{
    if(!img || img.dataset.missingHandled==='1') return;
    img.dataset.missingHandled='1';

    const src=img.getAttribute('src')||'';
    if(!src || img.closest('.lightbox')) return;

    const filename=(img.dataset.photoFile || src.split('/').pop() || 'missing-image').split('?')[0];

    const box=document.createElement('div');
    box.className='missing-photo';
    box.setAttribute('role','img');
    box.setAttribute('aria-label',`Missing photo: ${filename}`);
    box.innerHTML=
      '<strong>PHOTO MISSING</strong>' +
      `<code>${filename}</code>` +
      '<small>This page is looking for this exact image file.</small>';

    img.style.display='none';
    img.setAttribute('aria-hidden','true');
    img.parentNode?.insertBefore(box,img);
  };

  document.addEventListener('error',event=>{
    if(event.target?.tagName==='IMG') showMissing(event.target);
  },true);

  document.querySelectorAll('img').forEach(img=>{
    if(!img.closest('.lightbox') && img.getAttribute('src') &&
       img.complete && img.naturalWidth===0){
      showMissing(img);
    }
  });
})();
