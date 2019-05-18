"use strict";


var hamburger = document.querySelector(".hamburger");
// var navMain = document.querySelector('.header-nav__list');


hamburger.addEventListener('click', function() {
  if (hamburger.classList.contains('open')) {
    hamburger.classList.remove('open');
    // navMain.classList.remove('header-nav__list--active');
  } else {
    hamburger.classList.add('open');
    // navMain.classList.add('header-nav__list--active');
  }
});
