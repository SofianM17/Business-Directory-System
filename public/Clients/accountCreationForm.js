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
  let response = await fetch("/submit-form-create-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  });
  let data = await response.json();
  return data;
}

// Check if user exists already on server
async function doesUserExist(username) {
  let response = await fetch("/users/" + username);
  // if we get a bad HTTP status, user does not exist
  if (!response.ok) {
    return false;
  } else {
    // user exists
    return true;
  }
}

//Format the account type response for the database
function formatAccountType() {
  let accountType = "customer"; // the default of the dropdown
  let dropdownValue = accountData.accountType.val();
  if (dropdownValue == "Business Owner") {
    accountType = "business";
  }
  return accountType;
}

$(document).ready(() => {
  // Toggle the dropdown for account type
  $(".dropdown-item").on("click", function () {
    $(this).parent().parent().prev().text($(this).text());
  });

  // event handler for form submission
  accountData.accountForm.on("submit", (e) => {
    e.preventDefault();

    // Check conditions to see if we can submit the form
    let criteriaSatisfied = true;

    if (accountData.password.val() != accountData.verifyPassword.val()) {
      // for debug
      alert("password mismatch");
      criteriaSatisfied = false;
    }
    //Check if the username is unique or not
    let takenUsername = doesUserExist(accountData.username.val());
    alert(takenUsername);
    if (takenUsername == true) {
      // for debug
      alert("username taken");
      criteriaSatisfied = false;
    }

    if (criteriaSatisfied) {
      // Submit the data to the server, then redirect to either the customer or
      // business owner page (these aren't created yet so I can't write that part)
      let data = submitData(); /*.then(redirect function here)*/
      // for debug only
      alert("submission successful!");
      alert(data);
    } else {
      window.scrollTo(0, 0);
    }
  });
});
