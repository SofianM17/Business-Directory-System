let reviewForm = $("#review-input-form");
let reviewInput = $("#review-input");

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

// request data from the server based on the id in the url
async function fetchProfile() {
  let response = await fetch(
    "/business-get/" + window.location.href.split("/")[4].replace("?", "")
  );
  let businessData = await response.json();
  return businessData;
}

// Toggle the favoriting for customers
async function changeFavorite() {
  let response = await fetch(
    "/change-favorite/" + window.location.href.split("/")[4].replace("?", ""),
    { method: "POST" }
  );
  let favoriteResponse = await response.json();
  return favoriteResponse.wasFavorite;
}

// Check if this business is a customer's favorite
async function checkFavorite() {
  let response = await fetch(
    "/is-favorite/" + window.location.href.split("/")[4].replace("?", "")
  );
  let favoriteResponse = await response.json();
  return favoriteResponse.wasFavorite;
}

// Used to handle reviews
async function submitReview() {
  let review = {
    review: reviewInput.val(),
  };
  let response = await fetch(
    "/add-review/" + window.location.href.split("/")[4].replace("?", ""),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    }
  );
  let reviewResponse = await response.json();
  return reviewResponse;
}

//Used to handle replies
async function submitReply(reviewID) {
  let elementID = "#text-" + reviewID;
  let replyInput = $(elementID);
  let reply = {
    message: replyInput.val(),
  };
  let response = await fetch(
    "/add-reply/" +
      window.location.href.split("/")[4].replace("?", "") +
      "/" +
      reviewID,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reply),
    }
  );
  let replyResponse = await response.json();
  return replyResponse;
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
    endTime = "closed";
  } else {
    endTime = day.endTime;
  }

  if (startTime != "closed" && endTime != "closed") {
    $(
      "<li>" +
        "<p id='day'>" +
        day.day +
        "</p>" +
        "<p id='open-time'>" +
        startTime +
        " - " +
        endTime +
        "</p>" +
        "</li>"
    ).appendTo("#hours-list");
  } else {
    $(
      "<li>" +
        "<p id='day'>" +
        day.day +
        "</p>" +
        "<p id='closed'>closed</p>" +
        "</li>"
    ).appendTo("#hours-list");
  }
}

// displays a map using leaflet and the geoapify API
// takes longitude and latitude coordinates for the map's positioning and point location
// adapted from https://apidocs.geoapify.com/samples/maps/js-raster-leaflet/
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
    popupAnchor: [0, -45], // point from which the popup should open relative to the iconAnchor
  });
  const marker = L.marker([latitude, longitude], {
    icon: markerIcon,
  }).addTo(map);
}

$(document).ready(async function () {
  let userType = getCookie("accountType");
  if (userType == "customer") {
    // properly show favorite status for customer
    let isFavorite = await checkFavorite();
    favButton = document.getElementById("favorite-button");
    if (isFavorite) {
      // add the favorited class from the element
      favButton.classList.add("favorited");
    }
  }

  let data = await fetchProfile();
  let days = [
    data.hours.monday,
    data.hours.tuesday,
    data.hours.wednesday,
    data.hours.thursday,
    data.hours.friday,
    data.hours.saturday,
    data.hours.sunday,
  ];

  displayMap(data.address.longitude, data.address.latitude);

  // add title to title div
  $("<h1>" + data.name + "</h1>").appendTo("#title");

  let catStr = "";

  // format each category from the categories array
  data.categories.forEach((element) => {
    if (data.categories.indexOf(element) < data.categories.length - 1) {
      catStr += element + ", ";
    } else {
      catStr += element;
    }
  });

  catStr += " • " + data.priceRange;

  // add the generated categories and price range string to the categories div
  $("<p>" + catStr + "</p>").appendTo("#categories");

  // append description to about section
  $("<p>" + data.about + "</p>").appendTo("#description");

  // append address to location section
  $("<p>" + data.address.address + "</p>").appendTo("#location-address");

  // if data contains a website
  if (data.website != "") {
    $(
      "<li id='website' style='border-bottom: 1px solid #A5A5A5'>" +
        "<a href='https://" +
        data.website +
        "'>" +
        data.website +
        "</a>" +
        "<img src='../Resources/icons8-external-link-64.png'>" +
        "</li>"
    ).appendTo("#contact-info-list");
  }

  // append phone number information to list
  $(
    "<li id='phone-num'>" +
      data.phoneNum +
      "<img src='../Resources/icons8-phone-50.png'> </li>"
  ).appendTo("#contact-info-list");

  // append the business hour for each day.
  for (let day of days) {
    appendBusinessHours(day);
  }

  let hasReviews = false;
  // append reviews
  if (data.reviews) {
    for (let review of data.reviews) {
      hasReviews = true;
      // append review to list
      let htmlToAdd =
        "<div class='review-reply-con'><li><p>" +
        review.review +
        "</p><p id='review-name'>~ " +
        review.username +
        "</p></li> ";

      // append replies
      if (review.replies) {
        for (let reply of review.replies) {
          htmlToAdd =
            htmlToAdd +
            "<li class='reply-li'><p>" +
            reply.message +
            "</p><p id='review-name'>~ Owner</p></li>";
        }
      }
      if (userType == "business") {
        // add business reply feature
        htmlToAdd =
          htmlToAdd +
          '<form class="reply-box" id="' +
          review.reviewID +
          '"><textarea class="form-control reply-text" id="text-' +
          review.reviewID +
          '" autocomplete="off" placeholder="Leave a reply..." rows="2"></textarea><button id="review-send-btn"><img src="https://img.icons8.com/small/30/000000/filled-sent.png"/></button></form>';
      }
      htmlToAdd = htmlToAdd + "</div>";
      $(htmlToAdd).appendTo("#reviews-list");
    }
  }

  if (hasReviews == false) {
    $("<p id='placeholder-review'>There are no reviews yet.</p>").appendTo(
      "#review-title"
    );
  }

  // handle review submission
  reviewForm.on("submit", (e) => {
    e.preventDefault();
    // submit review, then add to page
    submitReview().then((review) => {
      if (review.reviewAdded) {
        // add to bottom of list and clear textbox
        $("#placeholder-review").remove();
        $(
          "<li><p>" +
            review.review.review +
            "</p><p id='review-name'>~ " +
            review.review.username +
            "</p></li>"
        ).appendTo("#reviews-list");
        let reviewsList = document.getElementById("reviews-list").lastChild;
        reviewsList.scrollIntoView();
        reviewInput.val("");
        alert("Review submitted successfully!");
      } else {
        alert("Review submission failed.");
      }
    });
  });

  //handle reply submission
  $(".reply-box").on("submit", (e) => {
    e.preventDefault();
    submitReply(e.target.id).then((reply) => {
      if (reply.ok) {
        // add to bottom of list and clear textbox
        let elementID = "#" + e.target.id;
        $(
          "<li class='reply-li'><p>" +
            reply.reply.message +
            "</p><p id='review-name'>~ Owner</p></li>"
        ).insertBefore(elementID);

        let formtextID = "#text-" + e.target.id;
        $(formtextID).val("");
        alert("Reply submitted successfully!");
      } else {
        alert("Reply submission failed.");
      }
    });
  });

  // Redirect to edit page of this business
  $("#edit-btn").on("click", () => {
    window.location.href = "/edit-business/" + data["_id"];
  });

  // request to delete the form if the delete button is clicked
  $("#delete-btn").on("click", () => {
    window.location.href = "/delete-business/" + data["_id"];
  });

  // Handle the favoriting functionality
  $("#favorite-wrapper").on("click", async () => {
    let wasFavorite = await changeFavorite();

    favButton = document.getElementById("favorite-button");
    if (wasFavorite) {
      // remove the favorited class from the element
      favButton.classList.remove("favorited");
      alert("Business was removed from your favorites!");
    } else {
      favButton.classList.add("favorited");
      alert("Business added to your favorites!");
    }
  });
});
