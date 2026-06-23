/* ═══════════════════════════════════════════════════════
   SHARED HEADER + FOOTER LOADER
═══════════════════════════════════════════════════════ */
(function(){
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  var headerEl = document.getElementById('site-header-placeholder');
  if(headerEl){
    fetch('header.html')
      .then(function(r){ return r.text(); })
      .then(function(html){
        headerEl.outerHTML = html;

        document.querySelectorAll('.nav-links > li > a[data-page]').forEach(function(a){
          if(a.getAttribute('data-page') === currentPage){
            a.classList.add('active');
          }
        });

        var hamburger = document.getElementById('hamburger');
        var navLinks  = document.getElementById('navLinks');
        if(hamburger && navLinks){
          hamburger.addEventListener('click', function(){
            navLinks.classList.toggle('open');
          });
        }

        // Mobile: tap parent link of has-sub to expand submenu instead of navigating
        document.querySelectorAll('.has-sub > a').forEach(function(a){
          a.addEventListener('click', function(e){
            if(window.innerWidth <= 900){
              e.preventDefault();
              this.parentElement.classList.toggle('sub-open');
            }
          });
        });

        // After header loads, check if URL has a #tab= hash and open it
        openTabFromHash();
      })
      .catch(function(err){ console.warn('Header load failed:', err); });
  }

  var footerEl = document.getElementById('site-footer-placeholder');
  if(footerEl){
    fetch('footer.html')
      .then(function(r){ return r.text(); })
      .then(function(html){
        footerEl.outerHTML = html;
      })
      .catch(function(err){ console.warn('Footer load failed:', err); });
  }
})();

/* ═══════════════════════════════════════════════════════
   TAB SYSTEM — for About / Academics / Campus / Contact pages
   Each page has .tab-link elements (sidebar) and .tab-panel
   elements (content). Clicking a tab-link shows its panel.
═══════════════════════════════════════════════════════ */
function showPageTab(tabId, pushHash){
  var panels = document.querySelectorAll('.tab-panel');
  var links  = document.querySelectorAll('.tab-link');
  if(!panels.length) return false;

  var found = false;
  panels.forEach(function(p){
    if(p.getAttribute('data-tab') === tabId){
      p.classList.add('active');
      found = true;
    } else {
      p.classList.remove('active');
    }
  });
  links.forEach(function(l){
    l.classList.toggle('active', l.getAttribute('data-tab') === tabId);
  });

  // If tab not found on this page, default to first tab
  if(!found && panels.length){
    panels[0].classList.add('active');
    if(links.length) links[0].classList.add('active');
  }

  if(pushHash !== false){
    history.replaceState(null, '', '#tab=' + tabId);
  }

  // Scroll to top of content area smoothly (not whole page jump)
  var area = document.querySelector('.tab-content-area');
  if(area) area.scrollIntoView({behavior:'smooth', block:'start'});

  return true;
}

// Wire up sidebar tab-link clicks (delegated, works after dynamic content loads)
document.addEventListener('click', function(e){
  var link = e.target.closest('.tab-link');
  if(!link) return;
  e.preventDefault();
  var tabId = link.getAttribute('data-tab');
  showPageTab(tabId);
  if(window.innerWidth <= 900){
    document.getElementById('navLinks') && document.getElementById('navLinks').classList.remove('open');
  }
});

// Called by header dropdown links: goToTab(event, 'about.html', 'vision')
function goToTab(e, page, tabId){
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if(currentPage === page){
    e.preventDefault();
    showPageTab(tabId);
  }
  // else: let the link navigate normally; the hash will be picked up on load
}

// On page load (or after header injects), check location.hash for #tab=xxx
function openTabFromHash(){
  var hash = window.location.hash; // e.g. "#tab=vision"
  if(hash.indexOf('tab=') > -1){
    var tabId = hash.split('tab=')[1];
    showPageTab(tabId, false);
  } else {
    // default to first tab
    var firstPanel = document.querySelector('.tab-panel');
    var firstLink  = document.querySelector('.tab-link');
    if(firstPanel) firstPanel.classList.add('active');
    if(firstLink) firstLink.classList.add('active');
  }
}
window.addEventListener('hashchange', function(){ openTabFromHash(); });

/* ═══════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════ */
document.addEventListener('click', function(e){
  var q = e.target.closest('.faq-q');
  if(!q) return;
  var item = q.closest('.faq-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
  if(!wasOpen) item.classList.add('open');
});

/* ═══════════════════════════════════════════════════════
   STATS (localStorage)
═══════════════════════════════════════════════════════ */
var SS = {visitors:0,enquiries:0,calls:0,whatsapp:0,list:[],daily:[0,0,0,0,0,0,0],pages:{}};
(function(){
  var s = localStorage.getItem('sss_stats');
  if(s) SS = JSON.parse(s);
  SS.visitors = (SS.visitors||0) + 1;
  var pg = window.location.pathname.split('/').pop() || 'index.html';
  SS.pages = SS.pages || {};
  SS.pages[pg] = (SS.pages[pg]||0) + 1;
  SS.daily = SS.daily || [0,0,0,0,0,0,0];
  SS.daily[new Date().getDay()] = (SS.daily[new Date().getDay()]||0) + 1;
  save();
})();
function save(){ localStorage.setItem('sss_stats', JSON.stringify(SS)); }
function trackCall(){ SS.calls = (SS.calls||0)+1; save(); }
function trackWA(){   SS.whatsapp = (SS.whatsapp||0)+1; save(); }

/* ═══════════════════════════════════════════════════════
   ENQUIRY FORM
═══════════════════════════════════════════════════════ */
function submitEnquiry(){
  var n = document.getElementById('eq-name').value.trim();
  var p = document.getElementById('eq-phone').value.trim();
  var c = document.getElementById('eq-course') ? document.getElementById('eq-course').value : 'General';
  var m = document.getElementById('eq-msg')    ? document.getElementById('eq-msg').value    : '';
  if(!n || !p){ alert('Please enter your name and phone number.'); return; }
  SS.list = SS.list || [];
  SS.list.unshift({name:n, phone:p, course:c||'General', msg:m, date:new Date().toLocaleDateString('en-IN'), status:'New'});
  SS.enquiries = (SS.enquiries||0) + 1;
  save();
  ['eq-name','eq-phone','eq-course','eq-msg'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  alert('Thank you, '+n+'!\n\nYour enquiry has been received. Our admissions team will contact you shortly at '+p+'.');
}

/* ═══════════════════════════════════════════════════════
   IMAGE CAROUSEL (homepage hero)
═══════════════════════════════════════════════════════ */
(function(){
  var slidesEl = document.getElementById('carouselSlides');
  var dotsEl   = document.getElementById('carouselDots');
  var prevBtn  = document.getElementById('carouselPrev');
  var nextBtn  = document.getElementById('carouselNext');
  var captionEl= document.getElementById('carouselCaption');
  if(!slidesEl) return;

  var slides = slidesEl.querySelectorAll('.carousel-slide');
  var total  = slides.length;
  var current = 0;
  var timer   = null;
  var INTERVAL = 4500;

  var captions = Array.from(slides).map(function(s){
    var img = s.querySelector('img');
    return img ? img.getAttribute('alt') : '';
  });

  for(var i = 0; i < total; i++){
    var dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i===0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide '+(i+1));
    dot.setAttribute('data-idx', i);
    dot.addEventListener('click', (function(idx){
      return function(){ goTo(idx); resetTimer(); };
    })(i));
    dotsEl.appendChild(dot);
  }

  function goTo(idx){
    current = (idx + total) % total;
    slidesEl.style.transform = 'translateX(-' + current + '00%)';
    dotsEl.querySelectorAll('.carousel-dot').forEach(function(d, i){
      d.classList.toggle('active', i === current);
    });
    if(captionEl) captionEl.textContent = captions[current];
  }

  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function startTimer(){ timer = setInterval(next, INTERVAL); }
  function resetTimer(){ clearInterval(timer); startTimer(); }

  if(nextBtn) nextBtn.addEventListener('click', function(){ next(); resetTimer(); });
  if(prevBtn) prevBtn.addEventListener('click', function(){ prev(); resetTimer(); });

  var touchStartX = 0;
  slidesEl.addEventListener('touchstart', function(e){ touchStartX = e.changedTouches[0].clientX; }, {passive:true});
  slidesEl.addEventListener('touchend',   function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 50){ dx < 0 ? next() : prev(); resetTimer(); }
  }, {passive:true});

  var viewport = document.getElementById('carouselViewport');
  if(viewport){
    viewport.addEventListener('mouseenter', function(){ clearInterval(timer); });
    viewport.addEventListener('mouseleave', function(){ startTimer(); });
  }

  startTimer();
})();

/* ═══════════════════════════════════════════════════════
   ADMIN LOGIN + DASHBOARD
═══════════════════════════════════════════════════════ */
function openAdmin(){
  document.getElementById('adminOverlay').classList.add('show');
  setTimeout(function(){ document.getElementById('adminUser').focus(); }, 100);
}
function closeAdmin(){
  document.getElementById('adminOverlay').classList.remove('show');
  document.getElementById('adminErr').style.display = 'none';
}
function doLogin(){
  var u = document.getElementById('adminUser').value;
  var p = document.getElementById('adminPass').value;
  if(u === 'sssadmin' && p === 'sss@2025'){
    closeAdmin();
    openDashboard();
  } else {
    document.getElementById('adminErr').style.display = 'block';
  }
}
document.addEventListener('keydown', function(e){
  var overlay = document.getElementById('adminOverlay');
  if(!overlay) return;
  if(e.key === 'Escape') closeAdmin();
  if(e.key === 'Enter' && overlay.classList.contains('show')) doLogin();
});

function openDashboard(){
  var dash = document.getElementById('dashboard');
  dash.style.display = 'block';
  document.getElementById('d-date').textContent = 'Last refreshed: ' + new Date().toLocaleString('en-IN');
  document.getElementById('d-visitors').textContent  = (SS.visitors||0).toLocaleString();
  document.getElementById('d-enquiries').textContent = (SS.enquiries||0);
  document.getElementById('d-calls').textContent     = (SS.calls||0);
  document.getElementById('d-wa').textContent        = (SS.whatsapp||0);
  renderChart();
  renderLocations();
  renderEnquiries();
  renderPages();
  showTab('analytics');
}
function closeDashboard(){ document.getElementById('dashboard').style.display = 'none'; }
function showTab(t){
  document.querySelectorAll('.d-panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.d-tab').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('panel-'+t).classList.add('active');
  document.querySelector('[data-tab="'+t+'"]').classList.add('active');
}
function renderChart(){
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var data = SS.daily || [0,0,0,0,0,0,0];
  var max  = Math.max.apply(null, data) || 1;
  var html = '';
  days.forEach(function(d, i){
    var pct = Math.round((data[i]/max)*100);
    html += '<div class="bar-row"><span class="bar-lbl">'+d+'</span><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%"><span>'+data[i]+'</span></div></div></div>';
  });
  document.getElementById('visitorChart').innerHTML = html;
}
function renderLocations(){
  var locs = [{n:'Arni',p:38},{n:'Chennai',p:17},{n:'Vellore',p:13},{n:'Thiruvannamalai',p:11},{n:'Polur',p:8},{n:'Chetpet',p:7},{n:'Others',p:6}];
  var html = '';
  locs.forEach(function(l){ html += '<li><span>'+l.n+'</span><span class="loc-pct">'+l.p+'%</span></li>'; });
  document.getElementById('locationList').innerHTML = html;
}
function renderEnquiries(){
  var list = SS.list || [];
  if(!list.length){
    document.getElementById('enquiryTable').innerHTML = '<tr><td colspan="5" style="color:#aaa;padding:18px;text-align:center;">No enquiries yet.</td></tr>';
    return;
  }
  var html = '';
  list.slice(0,15).forEach(function(e, i){
    var st = i < 3 ? '<span class="s-new">New</span>' : '<span class="s-read">Seen</span>';
    html += '<tr><td>'+e.name+'</td><td><a href="tel:'+e.phone.replace(/\s/g,'')+'">'+e.phone+'</a></td><td>'+e.course+'</td><td>'+e.date+'</td><td>'+st+'</td></tr>';
  });
  document.getElementById('enquiryTable').innerHTML = html;
}
function renderPages(){
  var pages  = SS.pages || {};
  var sorted = Object.entries(pages).sort(function(a,b){ return b[1]-a[1]; });
  var max    = sorted[0] ? sorted[0][1] : 1;
  var html   = '';
  sorted.slice(0,8).forEach(function(p){
    var pct = Math.round((p[1]/max)*100);
    html += '<div class="bar-row"><span class="bar-lbl" style="width:130px">'+p[0]+'</span><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%"><span>'+p[1]+'</span></div></div></div>';
  });
  document.getElementById('pagesChart').innerHTML = html || '<p style="color:#aaa;font-size:13px;">No page data yet.</p>';
}
function saveContent(){
  document.getElementById('saveMsg').style.display = 'inline';
  setTimeout(function(){ document.getElementById('saveMsg').style.display = 'none'; }, 3000);
}