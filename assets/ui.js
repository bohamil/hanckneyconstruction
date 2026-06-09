// Hackney UI enhancements: mobile nav, scroll reveal, gallery swipe
(function(){
  // Mobile nav toggle
  document.querySelectorAll('.nav-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var head = btn.closest('header');
      var open = head.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  // Close menu when a link is chosen
  document.querySelectorAll('header .mobile-hide a').forEach(function(a){
    a.addEventListener('click', function(){
      var head = a.closest('header');
      if(head){ head.classList.remove('nav-open'); }
    });
  });
  // Scroll reveal (respects reduced motion)
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window){
    var els = document.querySelectorAll('.card,.section-heading,.feature-photo,.trust-grid>div,.process-cards article,.decision-grid article,.faq-list details');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    }, {rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ el.classList.add('reveal'); io.observe(el); });
  }
  // Gallery swipe
  var stage = document.querySelector('.gallery-stage');
  if(stage){
    var x0 = null;
    stage.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive:true});
    stage.addEventListener('touchend', function(e){
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if(Math.abs(dx) > 40){
        var b = document.getElementById(dx < 0 ? 'gallery-next' : 'gallery-prev');
        if(b) b.click();
      }
    }, {passive:true});
  }
})();
