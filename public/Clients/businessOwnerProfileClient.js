// request data from the server based on the id in the url
async function fetchProfile() {
    let response = await fetch('/business-profile-owner/generate/' + window.location.href.split('/')[4]);
    let businessData = await response.json();
    return businessData;
}

function appendBusinessHours(day) {
    let startTime;
    let endTime;
    if (day.startTime === "") {
        startTime = "closed";
    } else {
        startTime = day.startTime;
    }
    if (day.endTime === "") {
        endTime = "closed"
    } else {
        endTime = day.endTime;
    }

    if (startTime != "closed" && endTime != "closed") {
        $("<li>" + "<p>" + day.day + "</p>" + "<p>" + startTime + ' - ' + endTime + "</p>" + "</li>").appendTo('#hours-list');
    } else {
        $("<li>" + "<p>" + day.day + "</p>" + "<p>closed</p>" + "</li>").appendTo('#hours-list');
    }
}

$(document).ready(async function() {

    let data = await fetchProfile();
    let days = [data.hours.monday, data.hours.tuesday, data.hours.wednesday,
        data.hours.thursday, data.hours.friday, data.hours.saturday, data.hours.sunday
    ];

    // add title to title div
    $("<h1>" + data.name + "</h1>").appendTo('#title');

    let catStr = '';

    // format each category from the categories array
    data.categories.forEach(element => {
        if (data.categories.indexOf(element) < data.categories.length - 1) {
            catStr += element + ', ';
        } else {
            catStr += element;
        }
    });

    catStr += ' • ' + data.priceRange;

    // add the generated categories and price range string to the categories div
    $("<p>" + catStr + "</p>").appendTo('#categories');

    // append description to about section
    $("<p>" + data.about + "</p>").appendTo('#description');

    // append address to location section
    $("<p>" + data.address + "</p>").appendTo('#location-address');

    // if data contains a phone number
    if (data.phoneNum != '') {
        // append contact information
        $("<li>" + data.phoneNum + "</li>").appendTo('#contact-info-list')
    }

    // if data contains a website
    if (data.website != '') {
        // append website
        $("<li>" + data.website + "</li>").appendTo('#contact-info-list')
    }

    // append the business hour for each day.
    for (let day of days) {
        appendBusinessHours(day);
    }



});