"use strict";

/* убираем стрелочку у последней лишки - далее перечисления не будет и стрелочка не нужна: */
let allLiElemsInNavBar = document.querySelectorAll('.nav-bar__ul-li');
let lastLiElemInNavBar = allLiElemsInNavBar[allLiElemsInNavBar.length -2];
lastLiElemInNavBar.style.display = "none";