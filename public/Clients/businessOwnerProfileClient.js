// arcGIS API


// request data from the server based on the id in the url
async function fetchProfile() {
    let response = await fetch('/business-profile-owner/generate/' + window.location.href.split('/')[4]);
    let businessData = await response.json();
    return businessData;
}

// Displays a formatted list of business hour data
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
        $("<li>" + "<p id='day'>" + day.day + "</p>" + "<p id='open-time'>" + startTime + ' - ' + endTime + "</p>" + "</li>").appendTo('#hours-list');
    } else {
        $("<li>" + "<p id='day'>" + day.day + "</p>" + "<p id='closed'>closed</p>" + "</li>").appendTo('#hours-list');
    }
}

// displays a map using leaflet and the geoapify API
// takes longitude and latitude coordinates for the map's positioning and point location
function displayMap(longitude, latitude) {

    // create map
    var map = L.map("map").setView([latitude, longitude], 15.5);

    const apiKey = "dd6853e113004f1a83795613f67a78a8";

    // Retina displays require different mat tiles quality
    var isRetina = L.Browser.retina;

    var baseUrl =
        "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
    var retinaUrl =
        "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

    // Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        //attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap <a href="https://www.openstreetmap.org/copyright" target="_blank">contributors</a>',
        apiKey: apiKey,
        maxZoom: 20,
        id: "osm-bright",
    }).addTo(map);

    // create point
    const markerIcon = L.icon({
        iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=red&size=small&scaleFactor=2&apiKey=${apiKey}`,
        iconSize: [31, 46], // size of the icon
        iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
    });
    const marker = L.marker([latitude, longitude], {
        icon: markerIcon
    }).addTo(map);
}

$(document).ready(async function() {

    let data = await fetchProfile();
    let days = [data.hours.monday, data.hours.tuesday, data.hours.wednesday,
        data.hours.thursday, data.hours.friday, data.hours.saturday, data.hours.sunday
    ];

    displayMap(data.address.longitude, data.address.latitude);

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
    $("<p>" + data.address.address + "</p>").appendTo('#location-address');


    // if data contains a website
    if (data.website != '') {
        $("<li id='website' style='border-bottom: 1px solid #A5A5A5'>" + "<a href='https://" + data.website + "'>" + data.website + "</a>" + "<img src='../Resources/icons8-external-link-64.png'>" + "</li>").appendTo('#contact-info-list')
    }

    // append phone number information to list
    $("<li id='phone-num'>" + data.phoneNum + "<img src='../Resources/icons8-phone-50.png'> </li>").appendTo('#contact-info-list')

    // append the business hour for each day.
    for (let day of days) {
        appendBusinessHours(day);
    }



});