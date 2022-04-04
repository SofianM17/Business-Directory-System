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
  $("#confirm-yes").on("click", () => {
    // fetch request to delete business
    fetch("/submit-form-delete/" + window.location.href.split("/")[4], {
      method: "POST",
      headers: {
        "Content-Length": 0,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          alert(response.error);
        } else {
          window.location.href = "/business-dashboard/" + getCookie("user");
        }
      });
  });

  // if cancel is clicked, redirect to the previous page
  $("#confirm-no").on("click", () => {
    window.history.back();
  });
});
