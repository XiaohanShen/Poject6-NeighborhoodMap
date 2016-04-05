var burgerIcon = document.getElementsByClassName("titleBar-burgerIcon")[0];
var mainTag = document.getElementsByTagName("main")[0];
var navBar = document.getElementById("navBar");
var ulTag = document.getElementsByTagName("ul")[0];

burgerIcon.addEventListener("click",function(){
	navBar.classList.toggle('open');
});

mainTag.addEventListener('click',function(){
	navBar.classList.remove('open');
});

ulTag.addEventListener('click',function(){
	navBar.classList.remove('open');
});