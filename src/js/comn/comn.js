function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById("content").innerHTML = data;
            history.pushState(null, "", page); // Updates history without reloading
        });
}

document.getElementById("loadLogin").addEventListener("click", function () {
    loadPage("src/pages/auth/login.html");
});
