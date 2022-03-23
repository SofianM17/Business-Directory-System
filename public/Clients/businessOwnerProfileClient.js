let businessData;

async function fetchProfile() {
    let response = await fetch('/business-profile/generate/' + window.location.href.split('/')[4]);
    let businessData = await response.json();
    console.log(data);
}
$(document).ready(function() {
    fetchProfile();
});