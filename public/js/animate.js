function animateIcon() {

    $('#love').fadeOut().fadeIn();
    animateIcon();
}

animateIcon();


function myFunction(x) {
  x.classList.toggle("change");
  x.classList.toggle("shown");
  x.classList.toggle("nav");
   var element = document.getElementById("two");
  element.classList.toggle("hid");
  element.classList.toggle("nav");
  element.classList.toggle("rout");
  element.classList.toggle("shown");
}
