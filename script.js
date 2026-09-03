
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
if(toggle&&nav){
  const closeNav=()=>{
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
  };
  toggle.addEventListener('click',(e)=>{
    e.stopPropagation();
    const open=!nav.classList.contains('open');
    nav.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',open?'true':'false');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
  document.addEventListener('click',e=>{
    if(!nav.contains(e.target)&&!toggle.contains(e.target)) closeNav();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') closeNav();
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth>900) closeNav();
  },{passive:true});
}

/* LAST-GOOD SCROLL REVEAL — keep this deliberately simple. */
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

/* Header scroll state */
const hdr=document.querySelector('.site-header');
if(hdr){
  const syncHeader=()=>hdr.classList.toggle('header-scrolled',window.scrollY>24);
  window.addEventListener('scroll',syncHeader,{passive:true});
  syncHeader();
}

/* Hover cursor */
if(window.matchMedia('(pointer:fine)').matches){
  const badge=document.querySelector('.cursor-badge');
  if(badge){
    let mx=0,my=0,bx=0,by=0;
    const tick=()=>{
      bx+=(mx-bx)*.17;by+=(my-by)*.17;
      badge.style.left=bx+'px';badge.style.top=by+'px';
      requestAnimationFrame(tick);
    };
    tick();
    document.querySelectorAll('.gallery-img,.hero-media,.card,.photo-card,.panel-photo,.map-card,.owner-card-photo,.food-shot').forEach(el=>{
      el.addEventListener('mouseenter',()=>{
        badge.textContent=el.classList.contains('map-card')?'VISIT':'VIEW';
        badge.classList.add('show');
      });
      el.addEventListener('mouseleave',()=>badge.classList.remove('show'));
      el.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
    });
  }
}

/* Functional gallery lightbox */
const lightbox=document.querySelector('.lightbox');
const lightImg=lightbox?.querySelector('img');
const close=()=>{
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden','true');
};
document.querySelectorAll('.gallery-img').forEach(item=>{
  item.addEventListener('click',()=>{
    const src=item.dataset.full||item.querySelector('img')?.src;
    if(!lightbox||!lightImg||!src)return;
    lightImg.src=src;
    lightImg.alt=item.querySelector('img')?.alt||'';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});
lightbox?.querySelector('button')?.addEventListener('click',close);
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

/* Menu filters with smooth transitions */
const filters=document.querySelectorAll('.menu-filter');
const sections=document.querySelectorAll('[data-menu-category]');
if(filters.length&&sections.length){
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat=btn.dataset.filter;
    sections.forEach(sec=>{
      const show=cat==='all'||sec.dataset.menuCategory===cat;
      if(!show){
        sec.style.opacity='0';
        sec.style.transform='translateY(-7px)';
        setTimeout(()=>{if(cat!=='all'&&sec.dataset.menuCategory!==cat)sec.style.display='none'},250);
      }else{
        sec.style.display='block';
        sec.style.opacity='0';
        sec.style.transform='translateY(8px)';
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          sec.style.transition='opacity .38s ease,transform .42s cubic-bezier(.2,.82,.2,1)';
          sec.style.opacity='1';sec.style.transform='none';
        }));
      }
    });
  }));
}

/* Subtle button magnetic hover */
if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.btn,.nav-cta').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))/r.width;
      const dy=(e.clientY-(r.top+r.height/2))/r.height;
      el.style.transform=`translate(${dx*2.2}px,${dy*1.3-2}px)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform=''});
  });
}
