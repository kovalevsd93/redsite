/* Радиология РЕД — меню, поиск, тема, оплата, видео, анимация появления */
(function(){
  var rm=document.getElementById('rm'); if(!rm) return;
  var scrim=document.getElementById('rm-scrim'), burger=document.getElementById('rm-burger');
  var mq=window.matchMedia('(max-width:1080px)'), cur=null, t=null, hoverAt=0;
  var btns=[].slice.call(rm.querySelectorAll('[data-panel]'));

  function show(id){
    clearTimeout(t); cur=id;
    btns.forEach(function(b){b.setAttribute('aria-expanded',b.dataset.panel===id?'true':'false')});
    rm.querySelectorAll('.rm-panel').forEach(function(p){p.classList.toggle('on',p.id===id)});
    rm.classList.toggle('any-open',!!id);
  }
  function hideLater(){clearTimeout(t);t=setTimeout(function(){if(cur!=='p-search')show(null)},220)}

  btns.forEach(function(b){
    var id=b.dataset.panel;
    b.addEventListener('click',function(){ if(Date.now()-hoverAt<500)return; show(cur===id?null:id); });
    b.addEventListener('mouseenter',function(){if(!mq.matches&&cur!=='p-search'){if(cur!==id)hoverAt=Date.now();show(id)}});
    b.addEventListener('mouseleave',function(){if(!mq.matches)hideLater()});
  });
  rm.querySelectorAll('.rm-panel:not(#p-search)').forEach(function(p){
    p.addEventListener('mouseenter',function(){clearTimeout(t)});
    p.addEventListener('mouseleave',function(){if(!mq.matches)hideLater()});
  });
  scrim.addEventListener('click',function(){show(null)});
  rm.querySelectorAll('.rm-panel a').forEach(function(a){a.addEventListener('click',function(){show(null)})});

  /* тема */
  function syncCalc(light){
    var z=document.getElementById('zband'); if(!z) return;
    z.setAttribute('data-theme',light?'light':'dark');
    try{localStorage.setItem('red-calc-theme',light?'light':'dark')}catch(e){}
  }
  rm.querySelectorAll('.rm-theme').forEach(function(b){
    b.addEventListener('click',function(){
      var light=document.documentElement.getAttribute('data-theme')!=='light';
      if(light)document.documentElement.setAttribute('data-theme','light');else document.documentElement.removeAttribute('data-theme');
      try{localStorage.setItem('red-theme',light?'light':'dark')}catch(e){}
      syncCalc(light);
    });
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){show(null);rm.classList.remove('mob-open');document.body.style.overflow='';closePay()}
    if(e.key==='/redsite/'&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName)){
      e.preventDefault();
      if(mq.matches){rm.classList.add('mob-open');rm.querySelector('.rm-mob .rm-q').focus()}else document.getElementById('rm-find').focus();
    }
  });

  /* мобильное меню */
  burger.addEventListener('click',function(){
    var o=rm.classList.toggle('mob-open');burger.setAttribute('aria-expanded',o?'true':'false');
    document.body.style.overflow=o?'hidden':'';
  });
  rm.querySelectorAll('.body[data-all]').forEach(function(box){
    rm.querySelectorAll('#'+box.dataset.mob+' .rm-course, #'+box.dataset.mob+' .rm-yt a').forEach(function(c){
      var a=document.createElement('a');a.href=c.getAttribute('href');
      var tt=c.querySelector('.t');a.textContent=tt?tt.textContent:c.firstChild.textContent;box.appendChild(a);
    });
    var all=box.dataset.all.split('|');box.insertAdjacentHTML('beforeend','<a href="'+all[0]+'" style="color:var(--acc)">'+all[1]+'</a>');
  });
  var ma=rm.querySelector('[data-mob="articles"]');
  rm.querySelectorAll('#p-articles .rm-sec').forEach(function(s){
    var g=document.createElement('div');g.className='grp';g.textContent=s.querySelector('.rm-st').firstChild.textContent.trim();ma.appendChild(g);
    s.querySelectorAll('li a').forEach(function(a){var x=document.createElement('a');x.href=a.getAttribute('href');x.textContent=a.firstChild.textContent;ma.appendChild(x)});
    if(!s.querySelector('li a'))ma.insertAdjacentHTML('beforeend','<span class="rm-soon">Скоро</span>');
  });
  var art=rm.querySelector('#p-articles .rm-more'); if(art) ma.insertAdjacentHTML('beforeend','<a href="'+art.getAttribute('href')+'" style="color:var(--acc)">Все статьи →</a>');
  rm.querySelectorAll('.acc>button').forEach(function(b){b.addEventListener('click',function(){b.parentNode.classList.toggle('op')})});
  rm.querySelectorAll('.rm-mob a').forEach(function(a){a.addEventListener('click',function(){rm.classList.remove('mob-open');document.body.style.overflow=''})});

  /* поиск по всем разделам меню */
  var idx=[], seen={};
  function add(title,href,type){title=(title||'').trim();var k=href+'|'+type;if(!title||seen[k])return;seen[k]=1;idx.push({t:title,h:href,y:type})}
  rm.querySelectorAll('#p-courses .rm-course').forEach(function(c){add(c.querySelector('.t').textContent,c.getAttribute('href'),'курс')});
  rm.querySelectorAll('#p-calcs .rm-course').forEach(function(c){add(c.querySelector('.t').textContent,c.getAttribute('href'),'калькулятор')});
  rm.querySelectorAll('#p-tutorials .rm-course').forEach(function(c){add(c.querySelector('.t').textContent,c.getAttribute('href'),'урок')});
  rm.querySelectorAll('#p-tutorials .rm-yt a').forEach(function(a){add(a.firstChild.textContent,a.getAttribute('href'),'видео-гайд')});
  rm.querySelectorAll('#p-articles li a').forEach(function(a){add(a.firstChild.textContent,a.getAttribute('href'),a.querySelector('.rm-tag')?'калькулятор':'статья')});
  [['О нас','/redsite/about/'],['Отзывы учеников','/redsite/review/'],['Все курсы','/redsite/course/'],['Все статьи','/redsite/articles/'],['Публичная оферта','/redsite/oferta/'],['Политика конфиденциальности','/redsite/privacy/']].forEach(function(p){add(p[0],p[1],'страница')});
  var popular=['Z-score клапанов и артерий у детей','Рекомендации Флейшнеровского общества по очагам','PI-RADS','Костно-мышечная система в педиатрии','Туториал по коленному суставу','Хронический средний отит на КТ'];
  function esc(s){return s.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function render(list,v){
    list.hidden=false;
    var items=v?idx.filter(function(i){return i.t.toLowerCase().indexOf(v)>-1}):idx.filter(function(i){return popular.indexOf(i.t)>-1});
    if(!items.length){list.innerHTML='<li class="rm-res-empty">Ничего не нашлось. Попробуйте другое слово.</li>';return}
    list.innerHTML=items.slice(0,12).map(function(i){
      var tt=esc(i.t),p=v?i.t.toLowerCase().indexOf(v):-1;
      if(p>-1)tt=esc(i.t.slice(0,p))+'<mark>'+esc(i.t.slice(p,p+v.length))+'</mark>'+esc(i.t.slice(p+v.length));
      return '<li><a href="'+i.h+'"><span>'+tt+'</span><span class="ty">'+i.y+'</span></a></li>';
    }).join('');
  }
  var fq=document.getElementById('rm-find'), fl=rm.querySelector('#p-search .rm-res'), fh=rm.querySelector('#p-search .rm-h');
  render(fl,'');
  fq.addEventListener('focus',function(){show('p-search')});
  fq.addEventListener('input',function(){var v=fq.value.trim().toLowerCase();fh.textContent=v?'Результаты':'Часто ищут';render(fl,v);show('p-search')});
  fq.addEventListener('keydown',function(e){if(e.key==='Enter'){var a=fl.querySelector('a');if(a)location.href=a.getAttribute('href')}if(e.key==='Escape'){fq.blur();show(null)}});
  var mqi=rm.querySelector('.rm-mob .rm-q'), ml=rm.querySelector('.rm-mob .rm-res');
  mqi.addEventListener('input',function(){var v=mqi.value.trim().toLowerCase();if(!v){ml.hidden=true;return}render(ml,v)});

  /* оплата: виджет GetCourse в модальном окне */
  var pay=document.getElementById('pay');
  function closePay(){if(pay){pay.classList.remove('on');pay.querySelector('.modal__body').innerHTML='';document.body.style.overflow=''}}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-widget]'); if(!b||!pay) return;
    e.preventDefault();
    var body=pay.querySelector('.modal__body'); body.innerHTML='';
    var s=document.createElement('script');
    var wid=b.getAttribute('data-widget');
    s.src='https://school.radiologyeducation.ru/pl/lite/widget/script?id='+wid;
    var key=window.RED_WIDGETS&&RED_WIDGETS[wid];
    if(key){ s.id=key; s.onload=function(){ document.dispatchEvent(new Event('StartWidget'+key)); }; }
    body.appendChild(s);
    pay.classList.add('on'); document.body.style.overflow='hidden';
  });
  if(pay){pay.addEventListener('click',function(e){if(e.target===pay||e.target.closest('.modal__x'))closePay()})}

  /* YouTube: превью → плеер по клику */
  document.addEventListener('click',function(e){
    var y=e.target.closest('[data-yt]'); if(!y) return;
    e.preventDefault();
    var f=document.createElement('iframe');
    f.src='https://www.youtube.com/embed/'+y.getAttribute('data-yt')+'?autoplay=1&rel=0&playsinline=1';
    f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
    f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0';
    y.style.backgroundImage='none';y.classList.add('is-playing');[].forEach.call(y.querySelectorAll('[class^="yt__"]'),function(n){n.remove()});y.removeAttribute('href');y.removeAttribute('data-yt');y.appendChild(f);
  });
  if(location.hash.indexOf('#g-')===0){var g=document.getElementById(location.hash.slice(1));if(g){g.style.borderColor='var(--acc)'}}

  /* появление блоков при прокрутке */
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el)});
  }
  setTimeout(function(){rv.forEach(function(el){el.classList.add('in')})},2500);
})();

/* встроенные калькуляторы и HTML-статьи: высота окна по содержимому */
window.addEventListener('message',function(e){
  var d=e.data; if(!d||!d.redEmbed) return;
  var f=document.querySelector('iframe[data-embed="'+d.redEmbed+'"]'); if(f&&d.h) f.style.height=(d.h+4)+'px';
});

/* отзывы: скриншот оригинала сообщения крупно */
(function(){
  var lb=document.createElement('div');lb.className='lb';lb.innerHTML='<img alt="Оригинал отзыва">';document.body.appendChild(lb);
  var img=lb.querySelector('img');
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-shot]');
    if(b&&!document.getElementById('redx-lb')){img.src=b.getAttribute('data-shot');lb.classList.add('on');document.body.style.overflow='hidden'}
  });
  lb.addEventListener('click',function(){lb.classList.remove('on');document.body.style.overflow=''});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('on')){lb.classList.remove('on');document.body.style.overflow=''}});
})();

/* внешние ссылки (каналы, чаты, соцсети, источники) — всегда в новом окне */
(function(){
  function ext(a){return a&&a.hostname&&a.hostname!==location.hostname&&/^https?:/.test(a.protocol)&&!a.hasAttribute('data-yt')}
  document.querySelectorAll('a[href]').forEach(function(a){if(ext(a)){a.target='_blank';a.rel='noopener'}});
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]'); if(!ext(a)||e.defaultPrevented) return;
    e.preventDefault(); window.open(a.href,'_blank','noopener');
  });
})();

/* отзывы: карусель со стрелками влево/вправо и счётчиком */
(function(){
  var arrow=function(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+(d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'"/></svg>'};
  document.querySelectorAll('.quotes').forEach(function(q){
    var items=[].filter.call(q.children,function(c){return c.classList.contains('quote')});
    if(items.length<2) return;
    q.classList.add('slider');
    var box=document.createElement('div');box.className='qs';q.parentNode.insertBefore(box,q);box.appendChild(q);
    var nav=document.createElement('div');nav.className='qs-nav';
    nav.innerHTML='<span class="qs-count"></span><button class="qs-btn" type="button" aria-label="Предыдущий отзыв">'+arrow(-1)+'</button><button class="qs-btn" type="button" aria-label="Следующий отзыв">'+arrow(1)+'</button>';
    box.appendChild(nav);
    var prev=nav.children[1], next=nav.children[2], cnt=nav.children[0];
    function step(){var a=items[0].getBoundingClientRect(),b=items[1].getBoundingClientRect();return b.left-a.left}
    function perView(){return Math.max(1,Math.round(q.clientWidth/step()))}
    function upd(){
      var st=step()||1, i=Math.round(q.scrollLeft/st), pv=perView();
      var last=Math.min(items.length,i+pv);
      cnt.innerHTML='<b>'+String(i+1).padStart(2,'0')+(pv>1?'–'+String(last).padStart(2,'0'):'')+'</b> / '+String(items.length).padStart(2,'0');
      prev.disabled=q.scrollLeft<4; next.disabled=q.scrollLeft+q.clientWidth>=q.scrollWidth-4;
    }
    prev.addEventListener('click',function(){nav.classList.add('used');q.scrollBy({left:-step(),behavior:'smooth'})});
    next.addEventListener('click',function(){nav.classList.add('used');q.scrollBy({left:step(),behavior:'smooth'})});
    q.addEventListener('scroll',function(){window.requestAnimationFrame(upd)},{passive:true});
    window.addEventListener('resize',upd);
    q.setAttribute('tabindex','0');
    q.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();next.click()}if(e.key==='ArrowLeft'){e.preventDefault();prev.click()}});
    upd();
  });
})();

/* «Подробнее» у преподавателей: окно с описанием */
(function(){
  var box;
  function build(){
    box=document.createElement('div');box.id='bio';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
    box.innerHTML='<div class="bio__box"><button type="button" class="bio__x" aria-label="Закрыть">×</button><div class="bio__c"></div></div>';
    document.body.appendChild(box);
    box.addEventListener('click',function(e){if(e.target===box||e.target.closest('.bio__x'))close()});
  }
  function close(){if(box){box.classList.remove('open');document.documentElement.style.overflow=''}}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-bio]');if(!b)return;
    var src=b.parentNode.querySelector('.bio-src');if(!src)return;
    if(!box)build();
    box.querySelector('.bio__c').innerHTML=src.innerHTML;
    box.classList.add('open');document.documentElement.style.overflow='hidden';
    box.querySelector('.bio__x').focus();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();

/* обложка → плеер (VK, Kinescope и др.) */
document.addEventListener('click',function(e){
  var b=e.target.closest('.vc[data-embed]');if(!b)return;
  var u=b.getAttribute('data-embed');u+=(u.indexOf('?')>-1?'&':'?')+'autoplay=1';
  var f=document.createElement('iframe');f.src=u;f.allow='autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write';f.allowFullscreen=true;
  f.title=b.getAttribute('aria-label')||'Видео';
  b.parentNode.replaceChild(f,b);
});
