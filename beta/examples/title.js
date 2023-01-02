var divOverlay = document.getElementById("container");
let title = true;

/*TOUCH-LISTENERS---------------------------------------------*/

function TitleFade() {
  console.log("heeloo")
  if(title) {
    divOverlay.style.display = "none"
    title = false
  }
};



  