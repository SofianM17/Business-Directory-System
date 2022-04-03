let accountData = {
  accountForm: $("#account-creation-form"),
  username: $("#username-field"),
  password: $("#password-field"),
  verifyPassword: $("#password-field-verify"),
  accountType: $("#account-type-field"),
};

// Send a post request to the server
// containing form data
async function submitData() {
  //Create the user
  let obj = {
    username: accountData.username.val(),
    password: accountData.password.val(),
    accountType: formatAccountType(),
  };
  fetch("/submit-form-create-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  })
    .then((response) => response.json())
    .then((response) => {
      // Redirect the user to their dashboard
      if (response.accountCreated == "true") {
        if (obj.accountType == "business") {
          window.location.replace("/business-dashboard/" + getCookie("user"));
        }
        if (obj.accountType == "customer") {
          window.location.replace("/customer-dashboard/" + getCookie("user"));
        }
      } else {
        alert("error submitting form");
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

// Check if user exists already on server
async function doesUserExist(username) {
  let response = await fetch("/users/" + username);
  // if we get a bad HTTP status, user does not exist
  if (!response.ok) {
    return PromiseRejectionEvent();
  } else {
    // user exists
    return true;
  }
}

//Format the account type response for the database
function formatAccountType() {
  let accountType = "customer"; // the default of the dropdown
  let dropdownValue = accountData.accountType.text();
  if (dropdownValue == "Business Owner") {
    accountType = "business";
  }
  return accountType;
}

// Allow only certain characters in the username so we can
// route pages accordingly
function isValidUsername(username) {
  if (username.includes("/")) {
    return false;
  }
  return true;
}

// This is async so that we wait for all conditions to resolve
// before continuing
async function checkConditions() {
  // Check conditions to see if we can submit the form
  let criteriaSatisfied = true;

  if (accountData.password.val() != accountData.verifyPassword.val()) {
    // for debug
    alert("Password mismatch. Please enter the same password.");
    criteriaSatisfied = false;
  }

  //Disallow certain characters in username (mainly /) for page routing purposes
  let validUsername = isValidUsername(accountData.username.val());
  if (!validUsername) {
    alert("Username cannot contain the character '/'");
    criteriaSatisfied = false;
  }

  if (!criteriaSatisfied) {
    return PromiseRejectionEvent();
  }

  // Check if the username is unique or not
  // This is at the bottom because it takes
  // some time, so we don't want to wait for it if
  // we already know we won't be successful
  await doesUserExist(accountData.username.val()).then(
    () => {
      // if username already exists
      alert("Username is already taken.");
      criteriaSatisfied = false;
    },
    () => {
      // if username doesn't exist
      // alert("username is unique");
    }
  );

  if (!criteriaSatisfied) {
    return PromiseRejectionEvent();
  } else {
    return true;
  }
}

$(document).ready(() => {
  // Toggle the dropdown for account type
  $(".dropdown-item").on("click", function () {
    $(this).parent().parent().prev().text($(this).text());
  });

  // event handler for form submission
  accountData.accountForm.on("submit", (e) => {
    e.preventDefault();

    checkConditions().then(
      () => {
        // if all conditions are satisfied
        // Submit the data to the server, then redirect to either the customer or
        // business owner page
        let data = submitData().then(() => {
          // alert("submission successful!");
        });
      },
      () => {
        // if there are any errors
        // alert("no success");
        window.scrollTo(0, 0);
      }
    );
  });
});
