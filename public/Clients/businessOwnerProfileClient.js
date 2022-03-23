let businessData;

// request data from the server based on the id in the url
async function fetchProfile() {
    let response = await fetch('/business-profile-owner/generate/' + window.location.href.split('/')[4]);
    let businessData = await response.json();
    console.log(businessData);
}
$(document).ready(function() {
    fetchProfile();



});