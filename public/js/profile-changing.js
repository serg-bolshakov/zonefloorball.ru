"use strict";

let profilechangingperstelnuminput = document.querySelector('#inputprofilecahngingtelnum');
let profilechangingperstelnumlogo = document.querySelector('#edittelnumlogoinprofile');
let profilechangingperstelnumdiv = document.querySelector('#profilechangingperstelnumdiv');

profilechangingperstelnumlogo.addEventListener('click', () => {
    profilechangingperstelnumdiv.style.display == "block" ? profilechangingperstelnumdiv.style.display = "" : profilechangingperstelnumdiv.style.display = "block";
});

let profilechangingnamesdiv = document.querySelector('#profilechangingnamesdiv');
let profilechangingnameslogo = document.querySelector('#editnameslogoinprofile');

let nameprofilechangingspan = document.querySelector('#nameprofilechangingspan');
let surnameprofilechangingspan = document.querySelector('#surnameprofilechangingspan');

let nameprofilechanginginput = document.querySelector('#nameprofilechanging');
nameprofilechanginginput.value = nameprofilechangingspan.textContent;

let surnameprofilechanginginput = document.querySelector('#surnameprofilechanging');
surnameprofilechanginginput.value = surnameprofilechangingspan.textContent;

profilechangingnameslogo.addEventListener('click', () => {
    profilechangingnamesdiv.style.display == "block" ? profilechangingnamesdiv.style.display = "" : profilechangingnamesdiv.style.display = "block";
});

let profilechangingbirthdayinput = document.querySelector('#inputbirthdayinprofilechanging');
let profilechangingbirthdaylogo = document.querySelector('#editbirthdaylogoinprofile');
let profilechangingbirthdaydiv = document.querySelector('#profilechangingbirthdaydiv');

profilechangingbirthdaylogo.addEventListener('click', () => {
    profilechangingbirthdaydiv.style.display == "block" ? profilechangingbirthdaydiv.style.display = "" : profilechangingbirthdaydiv.style.display = "block";
});

let editdeliveryaddressfieldinprofileinput = document.querySelector('#editdeliveryaddressfieldinprofileinput');
let editdeliveryaddresslogoinprofile = document.querySelector('#editdeliveryaddresslogoinprofile');
let profilechangingdeliveryaddressdiv = document.querySelector('#profilechangingdeliveryaddressdiv');

editdeliveryaddresslogoinprofile.addEventListener('click', () => {
    profilechangingdeliveryaddressdiv.style.display == "block" ? profilechangingdeliveryaddressdiv.style.display = "" : profilechangingdeliveryaddressdiv.style.display = "block";
});

