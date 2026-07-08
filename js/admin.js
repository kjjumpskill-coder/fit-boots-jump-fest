/* =========================================================
   FIT-BOOTS ADMIN PANEL — admin.js
   NOTE: This is a client-side demo. All data lives in this
   browser's localStorage only. For production, replace the
   storage + auth layer with a real backend (see README.md).
   ========================================================= */
(function(){
  "use strict";

  var LS_REG = 'jf_registrations';
  var LS_LEADS = 'jf_leads';
  var LS_CONTACTS = 'jf_contact_messages';
  var LS_CMS = 'jf_cms';
  var LS_AUTH = 'jf_admin_auth';

  var DEMO_USER = 'admin';
  var DEMO_PASS = 'festival2026';

  var PACKAGES = {
    'fest':      { label: "Jump Fest & Zumba", price: 1850, event:'fest' },
    'gala-only': { label: "Gala Event", price: 2500, event:'gala' },
    'combo':     { label: "Комбо", price: 4350, event:'both' }
  };

  function loadArr(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
  function saveArr(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
  function uid(){ return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function fmtDate(iso){ var d = new Date(iso); return d.toLocaleDateString('uk-UA') + ' ' + d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'}); }

  /* ================= AUTH ================= */
  var loginScreen = document.getElementById('loginScreen');
  var adminShell = document.getElementById('adminShell');

  function checkAuth(){
    if(sessionStorage.getItem(LS_AUTH) === '1'){
      loginScreen.style.display = 'none';
      adminShell.classList.add('active');
      renderAll();
    } else {
      loginScreen.style.display = 'flex';
      adminShell.classList.remove('active');
    }
  }

  document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    var u = document.getElementById('loginUser').value.trim();
    var p = document.getElementById('loginPass').value;
    if(u === DEMO_USER && p === DEMO_PASS){
      sessionStorage.setItem(LS_AUTH, '1');
      document.getElementById('loginError').style.display = 'none';
      checkAuth();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', function(){
    sessionStorage.removeItem(LS_AUTH);
    checkAuth();
  });

  /* ================= NAV ================= */
  var views = document.querySelectorAll('.admin-view');
  var navBtns = document.querySelectorAll('.admin-nav-btn[data-view]');
  navBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      navBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      views.forEach(function(v){ v.classList.remove('active'); });
      document.getElementById('view-' + btn.dataset.view).classList.add('active');
      document.getElementById('sidebar').classList.remove('open');
    });
  });
  document.getElementById('sidebarToggle').addEventListener('click', function(){
    document.getElementById('sidebar').classList.toggle('open');
  });

  /* ================= TOAST ================= */
  var toastTimer;
  function showToast(text){
    var t = document.getElementById('adminToast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 3000);
  }

  /* ================= RENDER ALL ================= */
  function renderAll(){
    renderDashboard();
    renderRegistrations();
    renderCheckin();
    renderLeads();
    renderMessages();
    renderCms();
  }

  /* ================= DASHBOARD ================= */
  function renderDashboard(){
    var regs = loadArr(LS_REG);
    var totalCount = regs.length;
    var totalSum = regs.reduce(function(s,r){ return s + (r.status === 'paid' ? r.amount : 0); }, 0);
    var pendingSum = regs.reduce(function(s,r){ return s + (r.status !== 'paid' ? r.amount : 0); }, 0);
    var arrivedFest = regs.filter(function(r){ return r.checkedInFest; }).length;

    var statGrid = document.getElementById('statGrid');
    statGrid.innerHTML = [
      statCard('Усього реєстрацій', totalCount, true),
      statCard('Зібрано коштів', totalSum.toLocaleString('uk-UA') + ' грн', true),
      statCard('Очікує оплати', pendingSum.toLocaleString('uk-UA') + ' грн', false),
      statCard('Прийшло на фестиваль', arrivedFest, false)
    ].join('');

    /* packages chart */
    var counts = { fest:0, 'gala-only':0, combo:0 };
    regs.forEach(function(r){ if(counts[r.package] !== undefined) counts[r.package]++; });
    var max = Math.max(1, counts.fest, counts['gala-only'], counts.combo);
    var chartPackages = document.getElementById('chartPackages');
    chartPackages.innerHTML = [
      chartBar('Jump Fest', counts.fest, max),
      chartBar('Gala Event', counts['gala-only'], max),
      chartBar('Комбо', counts.combo, max)
    ].join('');

    /* time chart: last 14 days */
    var days = [];
    for(var i=13;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      days.push(d.toISOString().slice(0,10));
    }
    var byDay = {};
    days.forEach(function(d){ byDay[d]=0; });
    regs.forEach(function(r){
      var d = (r.createdAt||'').slice(0,10);
      if(byDay[d] !== undefined) byDay[d]++;
    });
    var maxDay = Math.max(1, Math.max.apply(null, days.map(function(d){ return byDay[d]; })));
    var chartTime = document.getElementById('chartTime');
    chartTime.innerHTML = days.map(function(d){
      var label = d.slice(8,10)+'.'+d.slice(5,7);
      return chartBar(label, byDay[d], maxDay);
    }).join('');
  }
  function statCard(label, value, gradient){
    return '<div class="stat-card"><div class="label">'+label+'</div><div class="value'+(gradient?' gradient':'')+'">'+value+'</div></div>';
  }
  function chartBar(label, value, max){
    var h = Math.max(4, Math.round((value/max)*160));
    return '<div class="chart-bar"><div class="bar-value">'+value+'</div><div class="bar" style="height:'+h+'px;"></div><div class="bar-label">'+label+'</div></div>';
  }

  document.getElementById('seedDemoBtn').addEventListener('click', function(){
    seedDemoData();
    renderAll();
    showToast('Демо-дані додано ✨');
  });

  function seedDemoData(){
    var names = ['Олена Ковальчук','Марія Ткаченко','Софія Бондаренко','Анна Мельник','Вікторія Шевченко','Ірина Бойко','Дарʼя Кравченко','Юлія Савченко','Катерина Поліщук','Наталія Романюк'];
    var teams = ['','Kangoo Dnipro','','Jump Team Kyiv','','','Fit Boots Odesa','','Dance Republic','' ];
    var pkgs = ['fest','gala-only','combo'];
    var regs = loadArr(LS_REG);
    for(var i=0;i<10;i++){
      var pkgKey = pkgs[Math.floor(Math.random()*pkgs.length)];
      var pkg = PACKAGES[pkgKey];
      var daysAgo = Math.floor(Math.random()*13);
      var d = new Date(); d.setDate(d.getDate()-daysAgo);
      regs.push({
        id: uid(), name: names[i], phone: '+380'+(50+Math.floor(Math.random()*10))+Math.floor(1000000+Math.random()*8999999),
        email: names[i].toLowerCase().replace(/[^a-zа-яіїєʼ ]/gi,'').replace(/\s+/g,'.') + '@mail.com',
        team: teams[i], package: pkgKey, packageLabel: pkg.label, amount: pkg.price,
        paymentMethod: Math.random()>.5?'monopay':'liqpay',
        status: Math.random()>.15?'paid':'pending',
        checkedInFest:false, checkedInGala:false,
        createdAt: d.toISOString(), comment:''
      });
    }
    saveArr(LS_REG, regs);
  }

  /* ================= REGISTRATIONS ================= */
  function renderRegistrations(){
    var regs = loadArr(LS_REG);
    var search = (document.getElementById('regSearch').value || '').toLowerCase();
    var fPkg = document.getElementById('regFilterPackage').value;
    var fStatus = document.getElementById('regFilterStatus').value;

    var filtered = regs.filter(function(r){
      var matchSearch = !search || (r.name+r.phone+r.team+r.email).toLowerCase().indexOf(search) > -1;
      var matchPkg = !fPkg || r.package === fPkg;
      var matchStatus = !fStatus || r.status === fStatus;
      return matchSearch && matchPkg && matchStatus;
    }).sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });

    var tbody = document.getElementById('regTableBody');
    if(!filtered.length){
      tbody.innerHTML = '<tr class="empty-row"><td colspan="9">Ще немає реєстрацій. Натисніть «Наповнити демо-даними» на вкладці Статистика або додайте учасницю вручну.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(function(r){
      return '<tr>' +
        '<td>'+esc(r.name)+'</td>' +
        '<td>'+esc(r.phone)+'</td>' +
        '<td>'+esc(r.email||'—')+'</td>' +
        '<td>'+esc(r.team||'—')+'</td>' +
        '<td>'+esc(r.packageLabel)+'</td>' +
        '<td>'+(r.paymentMethod === 'monopay' ? 'MonoPay' : r.paymentMethod === 'liqpay' ? 'LiqPay' : '—')+'</td>' +
        '<td><span class="badge '+r.status+'">'+statusLabel(r.status)+'</span></td>' +
        '<td>'+fmtDate(r.createdAt)+'</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-btn" data-action="cycle-status" data-id="'+r.id+'" title="Змінити статус">'+iconRefresh()+'</button>' +
          '<button class="icon-btn" data-action="delete-reg" data-id="'+r.id+'" title="Видалити">'+iconTrash()+'</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }
  function statusLabel(s){ return s==='paid'?'Оплачено':s==='installment'?'Розтермінування':'Очікує'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function iconTrash(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z"/></svg>'; }
  function iconRefresh(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'; }

  ['regSearch'].forEach(function(id){ document.getElementById(id).addEventListener('input', renderRegistrations); });
  ['regFilterPackage','regFilterStatus'].forEach(function(id){ document.getElementById(id).addEventListener('change', renderRegistrations); });

  document.getElementById('regTableBody').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-action]');
    if(!btn) return;
    var id = btn.dataset.id;
    var regs = loadArr(LS_REG);
    var idx = regs.findIndex(function(r){ return r.id === id; });
    if(idx === -1) return;

    if(btn.dataset.action === 'delete-reg'){
      if(confirm('Видалити цю реєстрацію?')){
        regs.splice(idx,1); saveArr(LS_REG, regs); renderRegistrations(); renderDashboard(); renderCheckin();
        showToast('Реєстрацію видалено');
      }
    } else if(btn.dataset.action === 'cycle-status'){
      var order = ['pending','paid','installment'];
      var cur = order.indexOf(regs[idx].status);
      regs[idx].status = order[(cur+1) % order.length];
      saveArr(LS_REG, regs); renderRegistrations(); renderDashboard();
    }
  });

  document.getElementById('exportCsvBtn').addEventListener('click', function(){
    var regs = loadArr(LS_REG);
    if(!regs.length){ showToast('Немає даних для експорту'); return; }
    var header = ['ПІБ','Телефон','Email','Команда','Пакет','Сума','Оплата','Статус','Дата реєстрації'];
    var rows = regs.map(function(r){
      return [r.name, r.phone, r.email, r.team, r.packageLabel, r.amount, r.paymentMethod, statusLabel(r.status), fmtDate(r.createdAt)]
        .map(function(v){ return '"' + String(v==null?'':v).replace(/"/g,'""') + '"'; }).join(',');
    });
    var csv = '\uFEFF' + header.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'jump-fest-registrations.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  /* offline add */
  var offlineBackdrop = document.getElementById('regModalBackdrop');
  document.getElementById('addRegBtn').addEventListener('click', function(){ offlineBackdrop.classList.add('open'); });
  document.getElementById('cancelOfflineReg').addEventListener('click', function(){ offlineBackdrop.classList.remove('open'); });
  offlineBackdrop.addEventListener('click', function(e){ if(e.target === offlineBackdrop) offlineBackdrop.classList.remove('open'); });

  document.getElementById('offlineRegForm').addEventListener('submit', function(e){
    e.preventDefault();
    var pkgKey = document.getElementById('or-package').value;
    var pkg = PACKAGES[pkgKey];
    var regs = loadArr(LS_REG);
    regs.push({
      id: uid(),
      name: document.getElementById('or-name').value.trim(),
      phone: document.getElementById('or-phone').value.trim(),
      email: document.getElementById('or-email').value.trim(),
      team: document.getElementById('or-team').value.trim(),
      package: pkgKey, packageLabel: pkg.label, amount: pkg.price,
      paymentMethod: 'офлайн',
      status: document.getElementById('or-status').value,
      checkedInFest:false, checkedInGala:false,
      createdAt: new Date().toISOString(),
      comment: document.getElementById('or-comment').value.trim()
    });
    saveArr(LS_REG, regs);
    this.reset();
    offlineBackdrop.classList.remove('open');
    renderRegistrations(); renderDashboard(); renderCheckin();
    showToast('Учасницю додано ✅');
  });

  /* ================= CHECK-IN ================= */
  var checkinMode = 'fest';
  document.querySelectorAll('.checkin-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.checkin-tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      checkinMode = tab.dataset.mode;
      renderCheckin();
    });
  });
  document.getElementById('checkinSearch').addEventListener('input', renderCheckin);

  function renderCheckin(){
    var regs = loadArr(LS_REG);
    var field = checkinMode === 'fest' ? 'checkedInFest' : 'checkedInGala';
    var eligible = regs.filter(function(r){
      var pkg = PACKAGES[r.package];
      if(!pkg) return false;
      if(checkinMode === 'fest') return pkg.event === 'fest' || pkg.event === 'both';
      return pkg.event === 'gala' || pkg.event === 'both';
    });
    var search = (document.getElementById('checkinSearch').value || '').toLowerCase();
    var filtered = eligible.filter(function(r){ return !search || (r.name+r.phone).toLowerCase().indexOf(search) > -1; });

    document.getElementById('checkinTotal').textContent = eligible.length;
    document.getElementById('checkinArrived').textContent = eligible.filter(function(r){ return r[field]; }).length;

    var list = document.getElementById('checkinList');
    if(!filtered.length){
      list.innerHTML = '<div style="color:var(--ink-dim);text-align:center;padding:30px;">Нікого не знайдено.</div>';
      return;
    }
    list.innerHTML = filtered.map(function(r){
      var arrived = r[field];
      return '<div class="checkin-item '+(arrived?'arrived':'')+'">' +
        '<div class="who"><b>'+esc(r.name)+'</b><span>'+esc(r.phone)+' · '+esc(r.packageLabel)+(r.team?' · '+esc(r.team):'')+'</span></div>' +
        '<button class="checkin-btn '+(arrived?'arrived':'')+'" data-id="'+r.id+'">'+(arrived?'✓ Прийшла':'Відмітити прибуття')+'</button>' +
      '</div>';
    }).join('');
  }

  document.getElementById('checkinList').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-id]');
    if(!btn) return;
    var regs = loadArr(LS_REG);
    var idx = regs.findIndex(function(r){ return r.id === btn.dataset.id; });
    if(idx === -1) return;
    var field = checkinMode === 'fest' ? 'checkedInFest' : 'checkedInGala';
    regs[idx][field] = !regs[idx][field];
    if(regs[idx][field]) regs[idx][(checkinMode==='fest'?'festArrivalTime':'galaArrivalTime')] = new Date().toISOString();
    saveArr(LS_REG, regs);
    renderCheckin();
  });

  /* ================= LEADS ================= */
  function renderLeads(){
    var leads = loadArr(LS_LEADS).sort(function(a,b){ return new Date(b.createdAt)-new Date(a.createdAt); });
    var tbody = document.getElementById('leadsTableBody');
    if(!leads.length){
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Заявок ще немає.</td></tr>';
      return;
    }
    tbody.innerHTML = leads.map(function(l){
      return '<tr>' +
        '<td>'+esc(l.name)+'</td><td>'+esc(l.phone)+'</td><td>'+esc(l.type)+'</td>' +
        '<td style="white-space:normal;max-width:260px;">'+esc(l.comment||'—')+'</td>' +
        '<td><span class="badge '+l.status+'">'+leadStatusLabel(l.status)+'</span></td>' +
        '<td>'+fmtDate(l.createdAt)+'</td>' +
        '<td><button class="icon-btn" data-action="cycle-lead" data-id="'+l.id+'">'+iconRefresh()+'</button></td>' +
      '</tr>';
    }).join('');
  }
  function leadStatusLabel(s){ return s==='new'?'Нова':s==='progress'?'В роботі':'Оброблено'; }
  document.getElementById('leadsTableBody').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-action="cycle-lead"]');
    if(!btn) return;
    var leads = loadArr(LS_LEADS);
    var idx = leads.findIndex(function(l){ return l.id === btn.dataset.id; });
    if(idx === -1) return;
    var order = ['new','progress','done'];
    leads[idx].status = order[(order.indexOf(leads[idx].status)+1) % order.length];
    saveArr(LS_LEADS, leads); renderLeads();
  });

  /* ================= MESSAGES ================= */
  function renderMessages(){
    var msgs = loadArr(LS_CONTACTS).sort(function(a,b){ return new Date(b.createdAt)-new Date(a.createdAt); });
    var tbody = document.getElementById('msgTableBody');
    if(!msgs.length){
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Звернень ще немає.</td></tr>';
      return;
    }
    tbody.innerHTML = msgs.map(function(m){
      return '<tr>' +
        '<td>'+esc(m.name)+'</td><td>'+esc(m.phone)+'</td><td>'+esc(m.topic)+'</td>' +
        '<td style="white-space:normal;max-width:300px;">'+esc(m.message||'—')+'</td>' +
        '<td>'+fmtDate(m.createdAt)+'</td>' +
        '<td><button class="icon-btn" data-action="delete-msg" data-id="'+m.id+'">'+iconTrash()+'</button></td>' +
      '</tr>';
    }).join('');
  }
  document.getElementById('msgTableBody').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-action="delete-msg"]');
    if(!btn) return;
    var msgs = loadArr(LS_CONTACTS).filter(function(m){ return m.id !== btn.dataset.id; });
    saveArr(LS_CONTACTS, msgs); renderMessages();
  });

  /* ================= CMS ================= */
  function defaultCms(){
    return {
      instructors: [1,2,3,4,5,6].map(function(i){ return { name:'Інструктор '+i, role:'Напрямок', photo:'' }; }),
      galleryCaption: 'Так це було раніше. Цього року буде ще крутіше 🔥'
    };
  }
  function loadCms(){
    try{ return Object.assign(defaultCms(), JSON.parse(localStorage.getItem(LS_CMS))||{}); } catch(e){ return defaultCms(); }
  }
  function saveCms(cms){ localStorage.setItem(LS_CMS, JSON.stringify(cms)); }

  function renderCms(){
    var cms = loadCms();
    var grid = document.getElementById('cmsInstructors');
    grid.innerHTML = cms.instructors.map(function(inst, i){
      return '<div class="cms-card">' +
        '<div class="thumb">'+(inst.photo ? '<img src="'+esc(inst.photo)+'" alt="">' : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>')+'</div>' +
        '<input type="text" data-i="'+i+'" data-f="name" value="'+esc(inst.name)+'" placeholder="Імʼя">' +
        '<input type="text" data-i="'+i+'" data-f="role" value="'+esc(inst.role)+'" placeholder="Напрямок">' +
        '<input type="text" data-i="'+i+'" data-f="photo" value="'+esc(inst.photo)+'" placeholder="URL фото">' +
      '</div>';
    }).join('');
    document.getElementById('cmsGalleryCaption').value = cms.galleryCaption;
  }

  document.getElementById('cmsInstructors').addEventListener('change', function(e){
    var input = e.target.closest('input[data-f]');
    if(!input) return;
    var cms = loadCms();
    cms.instructors[+input.dataset.i][input.dataset.f] = input.value;
    saveCms(cms);
    renderCms();
    showToast('Збережено');
  });

  document.getElementById('cmsSaveCaption').addEventListener('click', function(){
    var cms = loadCms();
    cms.galleryCaption = document.getElementById('cmsGalleryCaption').value;
    saveCms(cms);
    showToast('Підпис збережено');
  });

  checkAuth();
})();
