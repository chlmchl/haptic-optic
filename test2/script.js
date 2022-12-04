var divOverlay = document.getElementById("target1");

/*TOUCH-LISTENERS---------------------------------------------*/
var startX=0, startY=0;
divOverlay.addEventListener('touchstart',function(e) {
  startX = e.changedTouches[0].pageX;
  startY = e.changedTouches[0].pageY;
});

divOverlay.addEventListener('touchmove',function(e) {
  e.preventDefault();
  var deltaX = e.changedTouches[0].pageX - startX;
  var deltaY = e.changedTouches[0].pageY - startY;
  divOverlay.style.left = divOverlay.offsetLeft + deltaX + 'px';
  divOverlay.style.top = divOverlay.offsetTop + deltaY + 'px';
  divOverlay.style.filter = 'blur(0)';
  //reset start-position for next frame/iteration
  startX = e.changedTouches[0].pageX;
  startY = e.changedTouches[0].pageY;
});

divOverlay.addEventListener('touchend',function(e) {
    e.preventDefault(); 
    divOverlay.style.filter = 'blur(5px)';
  });
  