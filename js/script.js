/* Plexi gestión — mismos gestos que plexiweb: scroll suave (Lenis), entrada
   con fade + slide al hacer scroll y menú móvil. Más abajo, el carrusel. */
document.addEventListener('DOMContentLoaded', function () {
  initSmoothScroll();
  initMobileNav();
  initRevealAnimations();
});

function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof window.Lenis !== 'function') return;
  new window.Lenis({
    duration: 1.1,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    autoRaf: true,
    syncTouch: false,
    touchMultiplier: 1.6
  });
}

/* data-reveal="up|left|right|fade", data-reveal-delay="0.15" y
   data-reveal-group="up" (anima los [data-reveal] hijos en cascada) */
function initRevealAnimations() {
  var singles = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]:not([data-reveal-group] [data-reveal])'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-group]'));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    return;
  }

  singles.forEach(function (el) {
    el.classList.add('reveal', 'reveal-' + (el.dataset.reveal || 'up'));
    var delay = parseFloat(el.dataset.revealDelay || '0');
    if (delay) el.style.transitionDelay = delay + 's';
  });
  groups.forEach(function (group) {
    var direction = group.dataset.revealGroup || 'up';
    group.querySelectorAll('[data-reveal]').forEach(function (child, i) {
      child.classList.add('reveal', 'reveal-' + direction);
      child.style.transitionDelay = (i * 0.12) + 's';
    });
  });

  var reveal = function (el) {
    el.style.willChange = 'opacity, transform';
    el.classList.add('is-revealed');
    var clear = function () { el.style.willChange = ''; };
    el.addEventListener('transitionend', clear, { once: true });
    window.setTimeout(clear, 1000);
  };

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (entry.target.hasAttribute('data-reveal-group')) {
        entry.target.querySelectorAll('[data-reveal]').forEach(reveal);
      } else {
        reveal(entry.target);
      }
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

  singles.forEach(function (el) { observer.observe(el); });
  groups.forEach(function (g) { observer.observe(g); });

  // Salvaguarda: preferimos perder la animación a dejar contenido invisible
  window.setTimeout(function () {
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(reveal);
  }, 2500);
}

function initMobileNav() {
  var header = document.querySelector('.site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (!header || !toggle || !nav) return;

  var setOpen = function (open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggle.innerHTML = '<i class="bi ' + (open ? 'bi-x-lg' : 'bi-list') + '" aria-hidden="true"></i>';
  };

  toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });
}

(function(){
  var track = document.querySelector('#videos .video-track');
  if(!track) return;

  var speed = 0.4; // píxeles por frame, cuanto más bajo, más lento
  var paused = false;
  var stoppedByUser = false;
  var resumeTimeout = null;

  function step(){
    if(!paused && !stoppedByUser){
      track.scrollLeft += speed;
      var maxScroll = track.scrollWidth - track.clientWidth;
      if(track.scrollLeft >= maxScroll - 1){
        track.scrollLeft = 0;
      }
    }
    requestAnimationFrame(step);
  }

  function pause(){ paused = true; }

  function resumeAfterDelay(){
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(function(){ paused = false; }, 2500);
  }

  // Mouse (desktop): pausa mientras el cursor está encima
  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', function(){ paused = false; });

  // Touch (móvil): al tocar/arrastrar se detiene el auto-scroll para no pelear
  // contra el gesto del usuario, y se reanuda solo tras un momento de inactividad.
  track.addEventListener('touchstart', function(){
    pause();
    clearTimeout(resumeTimeout);
  }, {passive: true});
  track.addEventListener('touchmove', pause, {passive: true});
  track.addEventListener('touchend', resumeAfterDelay);
  track.addEventListener('touchcancel', resumeAfterDelay);
  track.addEventListener('scroll', function(){
    if(!paused) return;
    resumeAfterDelay();
  }, {passive: true});

  requestAnimationFrame(step);
})();
