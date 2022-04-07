// Find a specific cookie by name
// This code is adapted from https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

$(document).ready(function () {
  // Redirect to correct homepage when home button is clicked
  $(".home").on("click", function () {
    let accountType = getCookie("accountType");
    let user = getCookie("user");
    if (accountType == "") {
      // somehow here but not logged in
      window.location.replace("/login");
    } else if (accountType == "business") {
      window.location.replace("/business-dashboard/" + user);
    } else if (accountType == "customer") {
      window.location.replace("/customer-dashboard/" + user);
    }
  });

  // Logout redirect
  $(".logout").on("click", function () {
    fetch("/logout-request", { method: "POST" })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          // logout failed
          alert(response.error);
        } else {
          // redirect to login page
          alert(response.message);
          window.location.replace("/login");
        }
      });
  });
});
