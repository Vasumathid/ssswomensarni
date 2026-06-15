// ── MOBILE NAV ──
document.getElementById('hamburger').addEventListener('click',function(){
  document.getElementById('navLinks').classList.toggle('open');
});

// ── FAQ ──
document.querySelectorAll('.faq-q').forEach(function(q){
  q.addEventListener('click',function(){
    var item=this.closest('.faq-item');
    var wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('open');});
    if(!wasOpen) item.classList.add('open');
  });
});

// ── STATS (localStorage) ──
var SS={visitors:0,enquiries:0,calls:0,whatsapp:0,list:[],daily:[0,0,0,0,0,0,0],pages:{}};
(function(){
  var s=localStorage.getItem('sss_stats');
  if(s) SS=JSON.parse(s);
  SS.visitors=(SS.visitors||0)+1;
  var pg=window.location.pathname.split('/').pop()||'index.html';
  SS.pages=SS.pages||{};
  SS.pages[pg]=(SS.pages[pg]||0)+1;
  SS.daily=SS.daily||[0,0,0,0,0,0,0];
  SS.daily[new Date().getDay()]=(SS.daily[new Date().getDay()]||0)+1;
  save();
  var hv=document.getElementById('heroVisitors');
  if(hv) hv.textContent=SS.visitors.toLocaleString();
})();
function save(){localStorage.setItem('sss_stats',JSON.stringify(SS));}
function trackCall(){SS.calls=(SS.calls||0)+1;save();}
function trackWA(){SS.whatsapp=(SS.whatsapp||0)+1;save();}

// ── ENQUIRY FORM ──
function submitEnquiry(){
  var n=document.getElementById('eq-name').value.trim();
  var p=document.getElementById('eq-phone').value.trim();
  var c=document.getElementById('eq-course')?document.getElementById('eq-course').value:'General';
  var m=document.getElementById('eq-msg')?document.getElementById('eq-msg').value:'';
  if(!n||!p){alert('Please enter your name and phone number.');return;}
  SS.list=SS.list||[];
  SS.list.unshift({name:n,phone:p,course:c||'General',msg:m,date:new Date().toLocaleDateString('en-IN'),status:'New'});
  SS.enquiries=(SS.enquiries||0)+1;
  save();
  ['eq-name','eq-phone','eq-course','eq-msg'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });
  alert('Thank you, '+n+'!\n\nYour enquiry has been received. Our admissions team will contact you shortly at '+p+'.');
}

// ── ADMIN ──
function openAdmin(){document.getElementById('adminOverlay').classList.add('show');setTimeout(function(){document.getElementById('adminUser').focus();},100);}
function closeAdmin(){document.getElementById('adminOverlay').classList.remove('show');document.getElementById('adminErr').style.display='none';}
function doLogin(){
  var u=document.getElementById('adminUser').value;
  var p=document.getElementById('adminPass').value;
  if(u==='sssadmin'&&p==='sss@2025'){
    closeAdmin();
    openDashboard();
  } else {
    document.getElementById('adminErr').style.display='block';
  }
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeAdmin();}
  if(e.key==='Enter'&&document.getElementById('adminOverlay').classList.contains('show'))doLogin();
});

// ── DASHBOARD ──
function openDashboard(){
  var dash=document.getElementById('dashboard');
  dash.style.display='block';
  document.getElementById('d-date').textContent='Last refreshed: '+new Date().toLocaleString('en-IN');
  document.getElementById('d-visitors').textContent=(SS.visitors||0).toLocaleString();
  document.getElementById('d-enquiries').textContent=(SS.enquiries||0);
  document.getElementById('d-calls').textContent=(SS.calls||0);
  document.getElementById('d-wa').textContent=(SS.whatsapp||0);
  renderChart();
  renderLocations();
  renderEnquiries();
  renderPages();
  showTab('analytics');
}
function closeDashboard(){document.getElementById('dashboard').style.display='none';}
function showTab(t){
  document.querySelectorAll('.d-panel').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.d-tab').forEach(function(b){b.classList.remove('active');});
  document.getElementById('panel-'+t).classList.add('active');
  document.querySelector('[data-tab="'+t+'"]').classList.add('active');
}
function renderChart(){
  var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var data=SS.daily||[0,0,0,0,0,0,0];
  var max=Math.max.apply(null,data)||1;
  var html='';
  days.forEach(function(d,i){
    var pct=Math.round((data[i]/max)*100);
    html+='<div class="bar-row"><span class="bar-lbl">'+d+'</span><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%"><span>'+data[i]+'</span></div></div></div>';
  });
  document.getElementById('visitorChart').innerHTML=html;
}
function renderLocations(){
  var locs=[{n:'Arni',p:38},{n:'Chennai',p:17},{n:'Vellore',p:13},{n:'Thiruvannamalai',p:11},{n:'Polur',p:8},{n:'Chetpet',p:7},{n:'Others',p:6}];
  var html='';
  locs.forEach(function(l){html+='<li><span>'+l.n+'</span><span class="loc-pct">'+l.p+'%</span></li>';});
  document.getElementById('locationList').innerHTML=html;
}
function renderEnquiries(){
  var list=SS.list||[];
  if(!list.length){
    document.getElementById('enquiryTable').innerHTML='<tr><td colspan="5" style="color:#aaa;padding:18px;text-align:center;">No enquiries yet. They will appear here when students submit the form.</td></tr>';
    return;
  }
  var html='';
  list.slice(0,15).forEach(function(e,i){
    var st=i<3?'<span class="s-new">New</span>':'<span class="s-read">Seen</span>';
    html+='<tr><td>'+e.name+'</td><td><a href="tel:'+e.phone.replace(/\s/g,'')+'">'+e.phone+'</a></td><td>'+e.course+'</td><td>'+e.date+'</td><td>'+st+'</td></tr>';
  });
  document.getElementById('enquiryTable').innerHTML=html;
}
function renderPages(){
  var pages=SS.pages||{};
  var sorted=Object.entries(pages).sort(function(a,b){return b[1]-a[1];});
  var max=sorted[0]?sorted[0][1]:1;
  var html='';
  sorted.slice(0,8).forEach(function(p){
    var pct=Math.round((p[1]/max)*100);
    html+='<div class="bar-row"><span class="bar-lbl" style="width:130px">'+p[0]+'</span><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%"><span>'+p[1]+'</span></div></div></div>';
  });
  document.getElementById('pagesChart').innerHTML=html||'<p style="color:#aaa;font-size:13px;">No page data yet.</p>';
}
function saveContent(){
  document.getElementById('saveMsg').style.display='inline';
  setTimeout(function(){document.getElementById('saveMsg').style.display='none';},3000);
}
