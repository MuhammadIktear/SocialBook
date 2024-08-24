var settingsmenu = document.querySelector(".settings-menu");
var editmenu = document.querySelector(".edit-menu");
var darkBtn = document.getElementById("dark-btn");
var message = document.querySelector(".all-comments")

function Comments() {
    if (message.style.display === "block") {
        message.style.display = "none";
    } else {
        message.style.display = "block";
    }
}

function settingsMenuToggle() {
    settingsmenu.classList.toggle("settings-menu-height");
}

function toggleMenu(event, element) {
    event.preventDefault();
    var editMenu = element.querySelector(".edit-menu");
    if (editMenu.style.display === "none" || editMenu.style.display === "") {
        editMenu.style.display = "block";
    } else {
        editMenu.style.display = "none";
    }
}

function toggleCommentMenu(event, element) {
    event.preventDefault();
    var editMenu = element.querySelector(".edit-comment-menu");
    if (editMenu.style.display === "none" || editMenu.style.display === "") {
        editMenu.style.display = "block";
    } else {
        editMenu.style.display = "none";
    }
}


darkBtn.onclick = function() {
    darkBtn.classList.toggle("dark-btn-on");
    document.body.classList.toggle("dark-theme");
    if (localStorage.getItem("theme") === "light") {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

if (localStorage.getItem("theme") === "light") {
    darkBtn.classList.remove("dark-btn-on");
    document.body.classList.remove("dark-theme");
} else if (localStorage.getItem("theme") === "dark") {
    darkBtn.classList.add("dark-btn-on");
    document.body.classList.add("dark-theme");
} else {
    localStorage.setItem("theme", "light");
}
