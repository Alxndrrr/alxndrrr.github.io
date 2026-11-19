/* Mobile navigation adapted from Ghost theme assets/js/init.js (MIT). */
document.documentElement.classList.replace('no-js', 'js');
/* Share rich micropost nodes across desktop/mobile slots, preserving media state
   and avoiding duplicate Ghost card IDs when the same post is in both feeds. */
(function () {
    const desktop = document.querySelector(".alx-home-desktop");
    const mixed = document.querySelector(".alx-home-mixed-feed");
    if (!desktop || !mixed) return;

    const posts = new Map();
    const parking = document.createElement("div");
    parking.hidden = true;
    mixed.after(parking);

    [desktop, mixed].forEach((feed, index) => {
        feed.querySelectorAll(".alx-micro-card").forEach((card) => {
            const id = card.getAttribute("data-alx-micro-id");
            if (!id) return;
            const slot = document.createElement("template");
            card.before(slot);
            if (!posts.has(id)) posts.set(id, {card, slots: []});
            const post = posts.get(id);
            post.slots[index] = slot;
            if (post.card !== card) card.remove();
        });
    });

    const wide = window.matchMedia("(min-width: 1100px)");
    function placePosts() {
        posts.forEach(({card, slots}) => {
            const slot = slots[wide.matches ? 0 : 1];
            if (slot) slot.after(card);
            else parking.appendChild(card);
        });
    }
    placePosts();
    wide.addEventListener("change", placePosts);
})();


(() => {
    const button = document.querySelector('.gh-burger');
    const nav = document.querySelector('#main-navigation');
    const root = document.documentElement;
    const mobile = matchMedia('(max-width:767px)');
    const background = [...document.querySelectorAll('.site-content,.site-footer')];
    let scrollPosition = 0;
    function close(restoreFocus = false) {
        if (!document.body.classList.contains('gh-head-open')) return;
        document.body.classList.remove('gh-head-open');
        root.classList.remove('gh-navigation-open');
        root.style.removeProperty('--gh-navigation-scroll-top');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Menu openen');
        background.forEach(el => el.inert = false);
        window.scrollTo({top:scrollPosition,behavior:'instant'});
        if (restoreFocus) button.focus();
    }
    button?.addEventListener('click', () => {
        if (document.body.classList.contains('gh-head-open')) return close();
        if (!mobile.matches) return;
        scrollPosition = window.scrollY;
        root.style.setProperty('--gh-navigation-scroll-top', `${-scrollPosition}px`);
        root.classList.add('gh-navigation-open');
        document.body.classList.add('gh-head-open');
        button.setAttribute('aria-expanded','true');
        button.setAttribute('aria-label','Menu sluiten');
        background.forEach(el => el.inert = true);
    });
    document.addEventListener('keydown', event => {
        if (!document.body.classList.contains('gh-head-open')) return;
        if (event.key === 'Escape') {event.preventDefault();close(true);}
        if (event.key === 'Tab') {
            const nodes = [...document.querySelector('#gh-head').querySelectorAll('a,button')].filter(el => el.getClientRects().length);
            const first=nodes[0],last=nodes.at(-1);
            if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
    nav?.addEventListener('click', event => {if(event.target.closest('a'))close();});
    mobile.addEventListener('change', () => {if(!mobile.matches)close();});
})();
/* Desktop overflow menu adapted from the theme's dropdown.js; valid sibling links. */
(() => {
    const menu=document.querySelector('.gh-head-menu');
    const nav=menu?.querySelector('.nav');
    if(!nav)return;
    const items=[...nav.children];
    const mobile=matchMedia('(max-width:767px)');
    let more;
    function close(){document.body.classList.remove('is-dropdown-open');more?.querySelector('button')?.setAttribute('aria-expanded','false');const list=more?.querySelector('.gh-dropdown');if(list)list.hidden=true;}
    function arrange(){
        close();more?.remove();items.forEach(item=>nav.appendChild(item));
        nav.style.flexWrap=mobile.matches?'':'nowrap';
        if(mobile.matches||nav.scrollWidth<=menu.clientWidth)return;
        more=document.createElement('li');more.className='nav-overflow';
        const button=document.createElement('button');button.className='nav-more-toggle';button.type='button';button.setAttribute('aria-label','Meer navigatie');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','overflow-navigation');
        button.innerHTML='<svg aria-hidden="true" viewBox="0 0 32 32" fill="currentColor"><circle cx="8" cy="16" r="2.667"/><circle cx="16" cy="16" r="2.667"/><circle cx="24" cy="16" r="2.667"/></svg>';
        const list=document.createElement('ul');list.className='gh-dropdown';list.id='overflow-navigation';list.hidden=true;
        more.append(button,list);nav.appendChild(more);
        for(let index=items.length-1;index>=0&&nav.scrollWidth>menu.clientWidth;index--)list.prepend(items[index]);
        button.addEventListener('click',()=>{const open=list.hidden;close();list.hidden=!open;button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('is-dropdown-open',open);});
        more.addEventListener('keydown',event=>{if(event.key==='Escape'){close();button.focus();}});
    }
    document.addEventListener('click',event=>{if(more&&!more.contains(event.target))close();});
    new ResizeObserver(arrange).observe(menu);
    document.fonts.ready.then(arrange);
})();

/* Currently: swipe/arrow navigation wraps in both directions. */
(() => {
 const carousel=document.querySelector('.currently-carousel');
 if(!carousel)return;
 const slides=[...carousel.querySelectorAll('[data-currently-slide]')];
 if(slides.length<2)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const interval=Math.max(2,Number(carousel.dataset.interval)||3)*1000;
 let index=0,timer,start,suppressClick=false;
 const indicator=carousel.querySelector('.currently-indicator');
 const dots=[...carousel.querySelectorAll('[data-currently-dot]')];
 carousel.tabIndex=0;
 carousel.setAttribute('aria-label','Waar ik nu mee bezig ben. Veeg of gebruik de pijltjestoetsen voor een andere kaart.');
 function show(next){index=(next+slides.length)%slides.length;slides.forEach((slide,i)=>{const active=i===index;slide.classList.toggle('is-active',active);slide.inert=!active;slide.setAttribute('aria-hidden',String(!active));});dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));if(indicator)indicator.setAttribute('aria-label',`Kaart ${index+1} van ${slides.length}`);}
 function sync(){clearInterval(timer);if(!reduced.matches&&!document.hidden&&!start&&!carousel.matches(':hover')&&!carousel.contains(document.activeElement))timer=setInterval(()=>show(index+1),interval);}
 carousel.addEventListener('pointerdown',event=>{if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;suppressClick=false;start={id:event.pointerId,x:event.clientX,y:event.clientY};clearInterval(timer);event.target.closest('.currently-overview-link')?.setPointerCapture(event.pointerId);});
 carousel.addEventListener('pointerup',event=>{
  if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(Math.abs(dx)>10||Math.abs(dy)>10)suppressClick=true;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)show(index+(dx<0?1:-1));
  sync();
 });
 carousel.addEventListener('pointercancel',()=>{start=null;suppressClick=true;sync();});
 carousel.addEventListener('click',event=>{if(suppressClick){event.preventDefault();suppressClick=false;}},true);
 carousel.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));sync();});
 carousel.addEventListener('mouseenter',sync);carousel.addEventListener('mouseleave',sync);
 carousel.addEventListener('focusin',sync);carousel.addEventListener('focusout',()=>setTimeout(sync,0));
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 show(0);sync();
})();

/* Static absolute dates remain useful without JS; relative text follows the reader's clock. */
(() => {
 const dates=[...document.querySelectorAll('time[data-relative-date]')];
 if(!dates.length)return;
 const relative=new Intl.RelativeTimeFormat('nl-NL',{numeric:'auto'});
 const calendarDay=value=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value);const part=type=>Number(parts.find(p=>p.type===type).value);return Date.UTC(part('year'),part('month')-1,part('day'))/86400000;};
 function refresh(){const today=calendarDay(new Date());dates.forEach(el=>{const date=new Date(el.dateTime);if(!Number.isFinite(date.getTime()))return;const days=calendarDay(date)-today;el.textContent=Math.abs(days)<30?relative.format(days,'day'):Math.abs(days)<365?relative.format(Math.trunc(days/30),'month'):relative.format(Math.trunc(days/365),'year');});}
 refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();

/* Ghost-style card navigation, preserving links, controls and text selection. */
(function () {
 document.querySelectorAll('.alx-micro-card').forEach(card => {
  const destination = card.querySelector('.alx-micro-card-destination');
  if (!destination) return;
  card.addEventListener('click', event => {
   if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
   if (event.target.closest('a,button,input,textarea,select,label,video,audio,iframe,summary,[contenteditable],.kg-toggle-card')) return;
   if (window.getSelection().toString()) return;
   destination.click();
  });
 });
})();

/* The explicit release offset keeps the switch identical in every time zone. */
(() => {
 const card=document.querySelector('[data-gta-release]');
 if(!card)return;
 const release=Date.parse(card.dataset.gtaRelease);
 if(!Number.isFinite(release))return;
 const countdown=card.querySelector('[data-gta-countdown]');
 const playing=card.querySelector('[data-gta-playing]');
 const clock=card.querySelector('[data-gta-clock]');
 const raw=card.dataset.gtaProgress;
 const progress=Number(raw);
 const known=raw.trim()!==''&&Number.isFinite(progress)&&progress>=0&&progress<=100;
 if(known){
  card.querySelector('[data-gta-percent]').textContent=new Intl.NumberFormat('nl-NL',{maximumFractionDigits:2}).format(progress)+'% voltooid';
  const bar=card.querySelector('[data-gta-bar]');
  bar.setAttribute('aria-valuenow',String(progress));
  bar.removeAttribute('aria-valuetext');
  card.querySelector('[data-gta-fill]').style.width=progress+'%';
 }
 function refresh(){
  const remaining=Math.max(0,Math.ceil((release-Date.now())/1000));
  countdown.hidden=remaining===0;playing.hidden=remaining>0;
  if(!remaining)return;
  const days=Math.floor(remaining/86400);
  const hours=Math.floor(remaining%86400/3600);
  const minutes=Math.floor(remaining%3600/60);
  const seconds=remaining%60;
  clock.textContent=`${days}d ${String(hours).padStart(2,'0')}u ${String(minutes).padStart(2,'0')}m ${String(seconds).padStart(2,'0')}s`;
 }
 refresh();setInterval(refresh,1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
