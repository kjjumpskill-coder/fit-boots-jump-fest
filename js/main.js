/* =========================================================
   FIT-BOOTS UKRAINIAN JUMP FEST — main.js
   ========================================================= */
(function(){
  "use strict";

  var hasGSAP = (typeof gsap !== 'undefined');
  if(hasGSAP){
    try{ gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); }
    catch(e){ hasGSAP = false; }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- storage keys (shared with admin.html) ---------- */
  var LS_REG = 'jf_registrations';
  var LS_LEADS = 'jf_leads';
  var LS_CONTACTS = 'jf_contact_messages';

  function loadArr(key){
    try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; }
  }
  function saveArr(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
  function uid(){ return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  var PACKAGES = {
    'fest':      { label: "FIT-BOOTS Jump Fest & Zumba", price: 1850 },
    'gala-only': { label: "Gala Event Oscar Style", price: 2500 },
    'combo':     { label: "Комбо-пакет", price: 4350 }
  };

  /* ================= SCROLL PROGRESS BAR ================= */
  var progressBar = document.getElementById('scroll-progress');
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  /* ================= NAV ================= */
  var nav = document.getElementById('nav');
  function onScrollNav(){
    if(window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScrollNav, { passive:true });
  onScrollNav();

  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function(){
    var open = mobileMenu.style.display === 'flex';
    mobileMenu.style.display = open ? 'none' : 'flex';
  });
  mobileMenu.querySelectorAll('a,button').forEach(function(el){
    el.addEventListener('click', function(){ mobileMenu.style.display = 'none'; });
  });

  /* smooth-ish anchor scrolling */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length > 1){
        var target = document.querySelector(id);
        if(target){
          e.preventDefault();
          if(hasGSAP){
            gsap.to(window, { duration: 1.1, scrollTo: { y: target, offsetY: 70 }, ease: 'power2.inOut' });
          } else {
            var y = target.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      }
    });
  });

  /* ================= HERO ANIMATIONS ================= */
  if(hasGSAP){
    (function(){
      document.querySelectorAll('.hero h1 .line span').forEach(function(span){
        gsap.set(span, { yPercent: 120 });
      });

      var heroTl = gsap.timeline({ delay:.2 });
      heroTl
        .to('.hero__eyebrow', { opacity:1, y:0, duration:.6, ease:'power3.out' }, 0)
        .from('.hero__eyebrow', { opacity:0, y:16, duration:.6, ease:'power3.out' }, 0)
        .to('.hero h1 .line span', { yPercent:0, duration:1, ease:'power4.out', stagger:.12 }, .15)
        .from('.hero__sub', { opacity:0, y:24, duration:.8, ease:'power3.out' }, .65)
        .from('.hero__meta-item', { opacity:0, y:16, duration:.6, stagger:.1, ease:'power3.out' }, .85)
        .from('.hero__ctas .btn', { opacity:0, y:16, duration:.6, stagger:.1, ease:'power3.out' }, 1.0);

      /* hero parallax + subtle ken burns */
      if(!reduceMotion){
        gsap.to('#heroImg', {
          yPercent: 12, ease:'none',
          scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:.6 }
        });
        gsap.fromTo('#heroImg', { scale:1.08 }, { scale:1.18, duration:14, ease:'none', repeat:-1, yoyo:true });
      }
    })();

    /* ================= GENERIC REVEAL ================= */
    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.fromTo(el, { opacity:0, y:46 }, {
        opacity:1, y:0, duration:.9, ease:'power3.out',
        scrollTrigger: { trigger: el, start:'top 86%' }
      });
    });

    /* stagger children of organizers / grids by adding data attr */
    gsap.utils.toArray('.price-card').forEach(function(el, i){
      gsap.fromTo(el, { opacity:0, y:60 }, {
        opacity:1, y:0, duration:.8, delay:i*.08, ease:'power3.out',
        scrollTrigger: { trigger: el, start:'top 88%' }
      });
    });
  }

  /* ================= TIMELINE ================= */
  var timelineItems = hasGSAP ? gsap.utils.toArray('.timeline__item') : Array.from(document.querySelectorAll('.timeline__item'));
  if(hasGSAP){
    timelineItems.forEach(function(item, i){
      gsap.fromTo(item, { opacity:0, x: (i % 2 === 0 ? -40 : 40) }, {
        opacity:1, x:0, duration:.7, ease:'power3.out',
        scrollTrigger: {
          trigger:item, start:'top 82%',
          onEnter: function(){ item.classList.add('in'); },
        }
      });
    });
    gsap.to('#timelineProgress', {
      height:'100%', ease:'none',
      scrollTrigger: { trigger:'.timeline', start:'top 70%', end:'bottom 60%', scrub:.5 }
    });
  } else if('IntersectionObserver' in window){
    /* fallback: reveal timeline dots without scroll-scrubbed progress */
    var tlObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) entry.target.classList.add('in');
      });
    }, { threshold:.4 });
    timelineItems.forEach(function(item){ tlObserver.observe(item); });
  } else {
    timelineItems.forEach(function(item){ item.classList.add('in'); });
  }

  /* ================= INSTRUCTORS ================= */
  var instructors = [
    { name:'Інструктор 1', role:'Ребаунд-фітнес' },
    { name:'Інструктор 2', role:'Кросс-джамп' },
    { name:'Інструктор 3', role:'ZUMBA' },
    { name:'Інструктор 4', role:'Dance Fit' },
    { name:'Інструктор 5', role:'ZUMBA' },
    { name:'Інструктор 6', role:'Ребаунд-фітнес' }
  ];
  var instrTrack = document.getElementById('instrTrack');
  var placeholderSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>';

  instructors.forEach(function(inst, i){
    var card = document.createElement('div');
    card.className = 'instr-card reveal';
    card.innerHTML =
      '<div class="instr-card__ph">' + placeholderSVG + '</div>' +
      '<div class="instr-card__info">' +
        '<div class="instr-card__name">' + inst.name + '</div>' +
        '<div class="instr-card__role">' + inst.role + '</div>' +
        '<button class="instr-card__more" data-idx="' + i + '">Детальніше</button>' +
      '</div>';
    instrTrack.appendChild(card);
  });

  instrTrack.querySelectorAll('.instr-card__more').forEach(function(btn){
    btn.addEventListener('click', function(){
      var i = +btn.dataset.idx;
      var inst = instructors[i];
      document.getElementById('instrDetailBody').innerHTML =
        '<div class="instr-card__ph" style="border-radius:16px;margin-bottom:20px;aspect-ratio:16/9;">' + placeholderSVG + '</div>' +
        '<h3>' + inst.name + '</h3>' +
        '<p class="hint">' + inst.role + '</p>' +
        '<p style="color:var(--ink-dim);line-height:1.7;font-size:15px;">Фото та повний опис інструктора зʼявляться найближчим часом. Слідкуй за оновленнями в Instagram фестивалю, щоб дізнатись більше про досвід та стиль викладання.</p>';
      openModal('instrOverlay');
    });
  });

  /* re-run reveal for injected cards */
  if(hasGSAP){
    gsap.utils.toArray('.instr-card.reveal').forEach(function(el, i){
      gsap.fromTo(el, { opacity:0, y:40 }, {
        opacity:1, y:0, duration:.7, delay:i*.06, ease:'power3.out',
        scrollTrigger: { trigger: el, start:'top 90%', containerAnimation:false }
      });
    });
  }

  /* drag-to-scroll + arrows */
  (function(){
    var isDown=false, startX, scrollLeft;
    instrTrack.addEventListener('mousedown', function(e){
      isDown=true; instrTrack.classList.add('dragging');
      startX = e.pageX - instrTrack.offsetLeft; scrollLeft = instrTrack.scrollLeft;
    });
    ['mouseleave','mouseup'].forEach(function(evt){
      instrTrack.addEventListener(evt, function(){ isDown=false; instrTrack.classList.remove('dragging'); });
    });
    instrTrack.addEventListener('mousemove', function(e){
      if(!isDown) return;
      e.preventDefault();
      var x = e.pageX - instrTrack.offsetLeft;
      instrTrack.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
    document.getElementById('instrPrev').addEventListener('click', function(){
      instrTrack.scrollBy({ left:-280, behavior:'smooth' });
    });
    document.getElementById('instrNext').addEventListener('click', function(){
      instrTrack.scrollBy({ left:280, behavior:'smooth' });
    });
  })();

  /* ================= CURTAIN TRANSITION ================= */
  if(hasGSAP){
    if(!reduceMotion){
      gsap.timeline({
        scrollTrigger: { trigger:'.curtain-section', start:'top 78%', toggleActions:'play none none reverse' }
      })
      .fromTo('.curtain-panel.left', { xPercent:0 }, { xPercent:-100, ease:'power2.inOut', duration:1.1 }, 0)
      .fromTo('.curtain-panel.right', { xPercent:0 }, { xPercent:100, ease:'power2.inOut', duration:1.1 }, 0)
      .fromTo('.curtain-content .tag', { opacity:0, y:12 }, { opacity:1, y:0, ease:'power2.out', duration:.5 }, .25)
      .fromTo('.curtain-content h2', { opacity:0, scale:.9 }, { opacity:1, scale:1, ease:'power2.out', duration:.6 }, .35);
    } else {
      gsap.set('.curtain-panel.left', { xPercent:-100 });
      gsap.set('.curtain-panel.right', { xPercent:100 });
    }
  } else {
    /* fallback: no animation library available, keep curtain simply
       open (static) so the heading stays visible and readable */
    document.querySelectorAll('.curtain-panel').forEach(function(p){ p.style.transition = 'none'; });
    document.querySelector('.curtain-panel.left') && (document.querySelector('.curtain-panel.left').style.transform = 'translateX(-100%)');
    document.querySelector('.curtain-panel.right') && (document.querySelector('.curtain-panel.right').style.transform = 'translateX(100%)');
  }

  /* stars scattered on curtain */
  (function(){
    var content = document.querySelector('.curtain-content');
    for(var i=0;i<10;i++){
      var s = document.createElement('div');
      s.className = 'curtain-star';
      s.style.left = (Math.random()*90+5) + '%';
      s.style.top = (Math.random()*90+5) + '%';
      s.style.fontSize = (10 + Math.random()*18) + 'px';
      s.textContent = '★';
      content.appendChild(s);
    }
  })();

  /* ================= GALA CONFETTI ================= */
  (function(){
    var canvas = document.getElementById('confetti-canvas');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var galaSection = document.getElementById('gala');
    var running = false;

    function resize(){
      canvas.width = galaSection.offsetWidth;
      canvas.height = galaSection.offsetHeight;
    }
    function makeParticles(){
      particles = [];
      var colors = ['#d4af37','#f3dfa0','#efe3cc','#8a6d1f'];
      for(var i=0;i<70;i++){
        particles.push({
          x: Math.random()*canvas.width,
          y: Math.random()*canvas.height,
          r: 1.5 + Math.random()*2.5,
          c: colors[Math.floor(Math.random()*colors.length)],
          vy: .2 + Math.random()*.5,
          vx: (Math.random()-.5)*.3,
          o: .3 + Math.random()*.5
        });
      }
    }
    function draw(){
      if(!running) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(function(p){
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        p.y += p.vy; p.x += p.vx;
        if(p.y > canvas.height){ p.y = -5; p.x = Math.random()*canvas.width; }
      });
      requestAnimationFrame(draw);
    }
    /* uses native IntersectionObserver so this effect never depends on GSAP */
    if(!reduceMotion && 'IntersectionObserver' in window){
      window.addEventListener('resize', resize);
      var confettiObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ resize(); makeParticles(); running = true; draw(); }
          else{ running = false; }
        });
      }, { threshold:.1 });
      confettiObserver.observe(galaSection);
    }
  })();

  /* ================= GALLERY LIGHTBOX ================= */
  (function(){
    var figures = Array.from(document.querySelectorAll('#galleryGrid figure'));
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var idx = 0;
    function show(i){
      idx = (i + figures.length) % figures.length;
      lbImg.src = figures[idx].dataset.full;
      lbImg.alt = figures[idx].querySelector('img').alt;
    }
    figures.forEach(function(fig, i){
      fig.addEventListener('click', function(){
        show(i);
        lightbox.classList.add('open');
      });
    });
    document.getElementById('lbClose').addEventListener('click', function(){ lightbox.classList.remove('open'); });
    document.getElementById('lbPrev').addEventListener('click', function(){ show(idx-1); });
    document.getElementById('lbNext').addEventListener('click', function(){ show(idx+1); });
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', function(e){
      if(!lightbox.classList.contains('open')) return;
      if(e.key === 'Escape') lightbox.classList.remove('open');
      if(e.key === 'ArrowLeft') show(idx-1);
      if(e.key === 'ArrowRight') show(idx+1);
    });
  })();

  /* ================= MODALS ================= */
  function openModal(id){ document.getElementById(id).classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(id){ document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }

  document.querySelectorAll('[data-open-reg]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var pkg = btn.dataset.package;
      if(pkg) document.getElementById('r-package').value = pkg;
      resetRegModal();
      openModal('regOverlay');
    });
  });
  document.getElementById('regClose').addEventListener('click', function(){ closeModal('regOverlay'); });
  document.getElementById('regOverlay').addEventListener('click', function(e){ if(e.target === this) closeModal('regOverlay'); });
  document.getElementById('regDone').addEventListener('click', function(){ closeModal('regOverlay'); });

  document.querySelectorAll('[data-open-team]').forEach(function(btn){
    btn.addEventListener('click', function(){ openModal('teamOverlay'); });
  });
  document.getElementById('teamClose').addEventListener('click', function(){ closeModal('teamOverlay'); });
  document.getElementById('teamOverlay').addEventListener('click', function(e){ if(e.target === this) closeModal('teamOverlay'); });

  document.getElementById('instrClose').addEventListener('click', function(){ closeModal('instrOverlay'); });
  document.getElementById('instrOverlay').addEventListener('click', function(e){ if(e.target === this) closeModal('instrOverlay'); });

  document.getElementById('wantInstallment').addEventListener('click', function(){
    closeModal('regOverlay');
    document.getElementById('teamTitle').textContent = 'Заявка на розтермінування';
    document.getElementById('teamHint').textContent = 'Залиште контакти — ми звʼяжемось і розкажемо про розтермінування на 3 платежі без переплат.';
    openModal('teamOverlay');
  });

  /* ---- payment option toggle ---- */
  var selectedPay = 'monopay';
  document.querySelectorAll('.pay-opt').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.pay-opt').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      selectedPay = btn.dataset.pay;
    });
  });

  function resetRegModal(){
    document.getElementById('regFormWrap').style.display = '';
    document.getElementById('regSuccessWrap').style.display = 'none';
    document.getElementById('regForm').reset();
    document.querySelectorAll('.field').forEach(function(f){ f.classList.remove('error'); });
  }

  /* ---- validation helpers ---- */
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v){ return /^[\d\s()+-]{7,}$/.test(v); }
  function setFieldError(input, isError){
    var field = input.closest('.field');
    field.classList.toggle('error', isError);
  }

  /* ================= REGISTRATION FORM SUBMIT ================= */
  document.getElementById('regForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('r-name');
    var phone = document.getElementById('r-phone');
    var email = document.getElementById('r-email');
    var team = document.getElementById('r-team').value.trim();
    var pkgKey = document.getElementById('r-package').value;

    var valid = true;
    if(name.value.trim().length < 4){ setFieldError(name, true); valid = false; } else setFieldError(name, false);
    if(!validPhone(phone.value)){ setFieldError(phone, true); valid = false; } else setFieldError(phone, false);
    if(!validEmail(email.value)){ setFieldError(email, true); valid = false; } else setFieldError(email, false);
    if(!valid) return;

    var pkg = PACKAGES[pkgKey];
    var reg = {
      id: uid(),
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      team: team,
      package: pkgKey,
      packageLabel: pkg.label,
      amount: pkg.price,
      paymentMethod: selectedPay,
      status: 'paid', /* demo: simulate successful payment */
      checkedInFest: false,
      checkedInGala: false,
      createdAt: new Date().toISOString(),
      comment: ''
    };
    var all = loadArr(LS_REG);
    all.push(reg);
    saveArr(LS_REG, all);

    document.getElementById('regFormWrap').style.display = 'none';
    document.getElementById('regSuccessWrap').style.display = 'block';
    document.getElementById('regSuccessText').textContent =
      'Пакет «' + pkg.label + '» (' + pkg.price + ' грн) оплачено через ' +
      (selectedPay === 'monopay' ? 'MonoPay' : 'LiqPay') + '. Деталі надіслано на ' + reg.email + '.';

    showToast('Реєстрацію підтверджено 🎉');
  });

  /* ================= TEAM / INSTALLMENT FORM ================= */
  document.getElementById('teamForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('t-name').value.trim();
    var phone = document.getElementById('t-phone').value.trim();
    var comment = document.getElementById('t-comment').value.trim();
    if(name.length < 2 || !validPhone(phone)) { showToast('Перевірте, будь ласка, дані форми'); return; }

    var lead = { id: uid(), name:name, phone:phone, comment:comment, type: document.getElementById('teamTitle').textContent,
      status:'new', createdAt: new Date().toISOString() };
    var leads = loadArr(LS_LEADS);
    leads.push(lead);
    saveArr(LS_LEADS, leads);

    closeModal('teamOverlay');
    document.getElementById('teamForm').reset();
    showToast('Заявку надіслано! Ми звʼяжемось найближчим часом 🙌');
  });

  /* ================= CONTACT FORM ================= */
  document.getElementById('contactForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('cf-name').value.trim();
    var phone = document.getElementById('cf-phone').value.trim();
    var topic = document.getElementById('cf-topic').value;
    var message = document.getElementById('cf-msg').value.trim();
    if(name.length < 2 || !validPhone(phone)){ showToast('Перевірте, будь ласка, імʼя та телефон'); return; }

    var msgs = loadArr(LS_CONTACTS);
    msgs.push({ id: uid(), name:name, phone:phone, topic:topic, message:message, status:'new', createdAt: new Date().toISOString() });
    saveArr(LS_CONTACTS, msgs);

    this.reset();
    showToast('Дякуємо! Ми отримали ваше звернення 💌');
  });

  /* ================= TOAST ================= */
  var toastTimer;
  function showToast(text){
    var t = document.getElementById('toast');
    t.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><span>' + text + '</span>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 3600);
  }

  /* ESC closes any open overlay */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    ['regOverlay','teamOverlay','instrOverlay'].forEach(function(id){ closeModal(id); });
  });

})();
