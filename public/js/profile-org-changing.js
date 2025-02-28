"use strict";

let companycarddivinprofile = document.querySelector('#companycarddivinprofile');
let checkcompanyinfoinprofileicon = document.querySelector('#checkcompanyinfoinprofileicon');
let profilechangingorgtelnuminput = document.querySelector('#inputprofilecahngingorgtelnum');
let profilechangingorgtelnumlogo = document.querySelector('#editorgtelnuminprofile');
let profilechangingorgtelnumdiv = document.querySelector('#profilechangingorgtelnumdiv');
let pElemForOpenIconImg = document.querySelector('#pElemForOpenIconImg');
let pElemForCloseIconImg = document.querySelector('#pElemForCloseIconImg');
let closecheckingcompanyinfoinprofileiconimg = document.querySelector('#closecheckingcompanyinfoinprofileicon');
let profilechangingnamesdiv = document.querySelector('#profilechangingnamesdiv');
let profilechangingnameslogo = document.querySelector('#editnameslogoinprofile');
let nameprofilechangingspan = document.querySelector('#nameprofilechangingspan');
let editorgaddressfieldinprofileinput = document.querySelector('#editorgaddressfieldinprofileinput');
let editorgaddresslogoinprofile = document.querySelector('#editorgaddresslogoinprofile');
let profilechangingorgaddressdiv = document.querySelector('#profilechangingorgaddressdiv');

let nameprofilechanginginput = document.querySelector('#nameprofilechanging');
nameprofilechanginginput.value = nameprofilechangingspan.textContent;

// смотрим кто представитель организации (его телефлн и имейл)
let profilecheckreperesentdiv = document.querySelector('#profilecheckreperesentdiv');
let checkrepresentprofileimg = document.querySelector('#checkrepresentprofileimg');

profilechangingorgtelnumlogo.addEventListener('click', () => {
    profilechangingorgtelnumdiv.style.display == "block" ? profilechangingorgtelnumdiv.style.display = "" : profilechangingorgtelnumdiv.style.display = "block";
});

profilechangingnameslogo.addEventListener('click', () => {
    profilechangingnamesdiv.style.display == "block" ? profilechangingnamesdiv.style.display = "" : profilechangingnamesdiv.style.display = "block";
});

checkcompanyinfoinprofileicon.addEventListener('click', () => {
    companycarddivinprofile.style.display == "block" ? companycarddivinprofile.style.display = "" : companycarddivinprofile.style.display = "block";
    pElemForCloseIconImg.style.display == "block" ? pElemForCloseIconImg.style.display = "" : pElemForCloseIconImg.style.display = "block";
    pElemForOpenIconImg.style.display == "none" ? pElemForOpenIconImg.style.display = "" : pElemForOpenIconImg.style.display = "none";
});

editorgaddresslogoinprofile.addEventListener('click', () => {
    profilechangingorgaddressdiv.style.display == "block" ? profilechangingorgaddressdiv.style.display = "" : profilechangingorgaddressdiv.style.display = "block";
});

checkrepresentprofileimg.addEventListener('click', () => {
    profilecheckreperesentdiv.style.display == "block" ? profilecheckreperesentdiv.style.display = "" : profilecheckreperesentdiv.style.display = "block";
});

closecheckingcompanyinfoinprofileiconimg.addEventListener('click', () => {
    companycarddivinprofile.style.display == "block" ? companycarddivinprofile.style.display = "" : companycarddivinprofile.style.display = "block";
    pElemForCloseIconImg.style.display = "";
    pElemForOpenIconImg.style.display == "none" ? pElemForOpenIconImg.style.display = "" : pElemForOpenIconImg.style.display = "none";
});

