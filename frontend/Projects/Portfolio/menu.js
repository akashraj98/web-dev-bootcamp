
function showMenu(){
    const menu = document.querySelector("section.menu");
    menu.style.height = "100%";
}

function hideMenu(){
    const menu = document.querySelector("section.menu");
    menu.style.height = "0";
}

function addClickToMenuItem(){
    const menuItems = document.querySelectorAll("section.menu nav ul>li");
    for (let menuItem of menuItems){
        menuItem.addEventListener("click",hideMenu);
    }
}
document.getElementById("menu-button").addEventListener("click",showMenu)
document.getElementById("close-menu").addEventListener("click",hideMenu)
addClickToMenuItem();