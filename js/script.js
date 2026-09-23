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
