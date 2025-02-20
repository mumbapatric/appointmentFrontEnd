// funtion() -> token || redirect onto login page
// checkRole() => redirect user to authorized pages

const authdUser = sessionStorage.getItem("logdin-user");
const authdUser1 = localStorage.getItem("token");
console.log("Authenticated user :: ", authdUser);
if (authdUser === null || authdUser1 === null)
  window.location.href = "/index.html";

function logOut() {
  localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/index.html";
}
