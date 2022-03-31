// Send a post request to the server
// containing form data
async function submitData() {}

// Check if user exists already on server
async function doesUserExist() {}

$(document).ready(() => {
  // Toggle the dropdown for account type
  $(".dropdown-item").on("click", function () {
    $(this).parent().parent().prev().text($(this).text());
  });
});
