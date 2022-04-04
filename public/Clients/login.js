let loginData = {
  loginForm: $("#login-form"),
  username: $("#username-field"),
  password: $("#password-field"),
};

// Validates the login data
async function validateLogin() {
  // Check conditions to see if we can submit the form
  let criteriaSatisfied = true;
  let obj = {
    username: loginData.username.val(),
    password: loginData.password.val(),
  };

  // verify password
  await fetch("/login-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        alert(response.error);
        return PromiseRejectionEvent();
      }
    });
}

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

$(document).ready(() => {
  // event handler for form submission
  loginData.loginForm.on("submit", (e) => {
    e.preventDefault();

    validateLogin().then(
      () => {
        // if all conditions are satisfied
        // Redirect to either the customer or
        // business owner page
        accountType = getCookie("accountType");

        if (accountType == "business") {
          window.location.replace("/business-dashboard/" + getCookie("user"));
        }
        if (accountType == "customer") {
          window.location.replace("/customer-dashboard/" + getCookie("user"));
        }
      },
      () => {
        // if there are any errors, do not redirect
        window.scrollTo(0, 0);
      }
    );
  });
});
