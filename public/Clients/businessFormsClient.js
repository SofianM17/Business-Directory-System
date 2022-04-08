let businessData = {
  businessForm: $("#create-business-form"),
  businessName: $("#business-name-field"),
  priceType: $(".priceCheck"),
  categoryType: $(".catCheck"),
  businessAbout: $("#about-field"),

  businessAddress: $("#address-field"),
  businessPhone: $("#phone-field"),
  businessWebsite: $("#url-field"),

  days: {
    allDays: $(".form-check-input"),
    monday: {
      check: $("#monday-check"),
      timeStart: $("#monday-time-start"),
      timeEnd: $("#monday-time-end"),
      timeStartToggle: $("#monday-time-start-toggle"),
      timeEndToggle: $("#monday-time-end-toggle"),
    },
    tuesday: {
      check: $("#tuesday-check"),
      timeStart: $("#tuesday-time-start"),
      timeEnd: $("#tuesday-time-end"),
      timeStartToggle: $("#tuesday-time-start-toggle"),
      timeEndToggle: $("#tuesday-time-end-toggle"),
    },
    wednesday: {
      check: $("#wednesday-check"),
      timeStart: $("#wednesday-time-start"),
      timeEnd: $("#wednesday-time-end"),
      timeStartToggle: $("#wednesday-time-start-toggle"),
      timeEndToggle: $("#wednesday-time-end-toggle"),
    },
    thursday: {
      check: $("#thursday-check"),
      timeStart: $("#thursday-time-start"),
      timeEnd: $("#thursday-time-end"),
      timeStartToggle: $("#thursday-time-start-toggle"),
      timeEndToggle: $("#thursday-time-end-toggle"),
    },
    friday: {
      check: $("#friday-check"),
      timeStart: $("#friday-time-start"),
      timeEnd: $("#friday-time-end"),
      timeStartToggle: $("#friday-time-start-toggle"),
      timeEndToggle: $("#friday-time-end-toggle"),
    },
    saturday: {
      check: $("#saturday-check"),
      timeStart: $("#saturday-time-start"),
      timeEnd: $("#saturday-time-end"),
      timeStartToggle: $("#saturday-time-start-toggle"),
      timeEndToggle: $("#saturday-time-end-toggle"),
    },
    sunday: {
      check: $("#sunday-check"),
      timeStart: $("#sunday-time-start"),
      timeEnd: $("#sunday-time-end"),
      timeStartToggle: $("#sunday-time-start-toggle"),
      timeEndToggle: $("#sunday-time-end-toggle"),
    },
  },
};

let selectedPrice = "";
let selectedCategories = [];
let editId;

// use the fetch API to validate, format, and estimate (if needed) the requested address
async function validateAddress() {
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    businessData.businessAddress.val()
  )}&apiKey=dd6853e113004f1a83795613f67a78a8`;

  let response = await fetch(url);
  let data = await response.json();

  //console.log(data);

  const address = data.features[0].properties;

  //console.log(address.rank.confidence);

  // formatted address (predicted if not fully provided)
  //console.log(address.formatted);

  return {
    address: address.formatted,
    longitude: address.lon,
    latitude: address.lat,
  };
}

function getTimePeriod(timeField) {
  if (timeField.val() != "") {
    return " " + timeField.next().text();
  } else {
    return "";
  }
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

// send a post request to the server
// containing form data
async function submitData() {
  let geoApResponse = await validateAddress();
  let formattedAddress = geoApResponse.address;
  let latitude = geoApResponse.latitude;
  let longitude = geoApResponse.longitude;

  let obj = {
    businessOwner: getCookie("user"),
    name: businessData.businessName.val(),
    priceRange: selectedPrice,
    categories: selectedCategories,
    about: businessData.businessAbout.val(),
    address: {
      address: formattedAddress,
      latitude: latitude,
      longitude: longitude,
    },
    phoneNum: businessData.businessPhone.val(),
    website: businessData.businessWebsite.val(),
    hours: {
      monday: {
        day: "Monday",
        startTime:
          businessData.days.monday.timeStart.val() +
          getTimePeriod(businessData.days.monday.timeStart),
        endTime:
          businessData.days.monday.timeEnd.val() +
          getTimePeriod(businessData.days.monday.timeEnd),
      },
      tuesday: {
        day: "Tuesday",
        startTime:
          businessData.days.tuesday.timeStart.val() +
          getTimePeriod(businessData.days.tuesday.timeStart),
        endTime:
          businessData.days.tuesday.timeEnd.val() +
          getTimePeriod(businessData.days.tuesday.timeEnd),
      },
      wednesday: {
        day: "Wednesday",
        startTime:
          businessData.days.wednesday.timeStart.val() +
          getTimePeriod(businessData.days.wednesday.timeStart),
        endTime:
          businessData.days.wednesday.timeEnd.val() +
          getTimePeriod(businessData.days.wednesday.timeEnd),
      },
      thursday: {
        day: "Thursday",
        startTime:
          businessData.days.thursday.timeStart.val() +
          getTimePeriod(businessData.days.thursday.timeStart),
        endTime:
          businessData.days.thursday.timeEnd.val() +
          getTimePeriod(businessData.days.thursday.timeEnd),
      },
      friday: {
        day: "Friday",
        startTime:
          businessData.days.friday.timeStart.val() +
          getTimePeriod(businessData.days.friday.timeStart),
        endTime:
          businessData.days.friday.timeEnd.val() +
          getTimePeriod(businessData.days.friday.timeEnd),
      },
      saturday: {
        day: "Saturday",
        startTime:
          businessData.days.saturday.timeStart.val() +
          getTimePeriod(businessData.days.saturday.timeStart),
        endTime:
          businessData.days.saturday.timeEnd.val() +
          getTimePeriod(businessData.days.saturday.timeEnd),
      },
      sunday: {
        day: "Sunday",
        startTime:
          businessData.days.sunday.timeStart.val() +
          getTimePeriod(businessData.days.sunday.timeStart),
        endTime:
          businessData.days.sunday.timeEnd.val() +
          getTimePeriod(businessData.days.sunday.timeEnd),
      },
    },
  };

  // send the appropriate request based on url

  if (window.location.href.indexOf("/edit-business/") > -1) {
    let response = await fetch("/submit-form-edit/" + editId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    let data = await response.json();
    return data;
  }

  if (window.location.href.indexOf("/add-business") > -1) {
    // create new business
    let response = await fetch("/submit-form-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    let data = await response.json();

    return data;
  }
}

// toggles the disabled state of time fields
function toggleTime(
  timeStartField,
  timeEndField,
  timeStartToggle,
  timeEndToggle
) {
  timeStartField.prop("disabled", (i, v) => {
    return !v;
  });
  timeEndField.prop("disabled", (i, v) => {
    return !v;
  });
  timeStartToggle.prop("disabled", (i, v) => {
    return !v;
  });
  timeEndToggle.prop("disabled", (i, v) => {
    return !v;
  });

  // reset the values for the fields if they are disabled
  if (timeStartField.prop("disabled")) {
    timeStartField.val("");
    timeStartToggle.text("AM");
  }
  if (timeEndField.prop("disabled")) {
    timeEndField.val("");
    timeEndToggle.text("AM");
  }
}

$(document).ready(() => {
  // if the current page is the edit business page
  if (window.location.href.indexOf("/edit-business/") > -1) {
    // populate the fields with the business data
    fetch("/business-get/" + window.location.href.split("/")[4])
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        editId = data["_id"];
        // populate fields with data
        businessData.businessName.val(data.name);
        businessData.businessAbout.val(data.about);
        businessData.businessAddress.val(data.address.address);
        businessData.businessPhone.val(data.phoneNum);
        businessData.businessWebsite.val(data.website);

        // list of all elements that correspond to checkboxes besides times
        let checkboxItems = data.categories.concat([data.priceRange]);

        // check category and price range checkboxes
        let counterLimit = $("label").length - 1;
        for (item of checkboxItems) {
          for (let counter = 0; counter < counterLimit; counter++) {
            if (item == $("label")[counter].textContent.trim()) {
              var id = $("label")[counter].getAttribute("for");
              $("input[id=" + id + "]")
                .prop("checked", true)
                .trigger("change");
            }
          }
        }

        // check hours checkboxes and populate hours
        counterLimit = $("label").length - 1;
        for (day in data.hours) {
          if (data.hours[day].startTime !== "") {
            for (let counter = 0; counter < counterLimit; counter++) {
              if (
                data.hours[day].day == $("label")[counter].textContent.trim()
              ) {
                var id = $("label")[counter].getAttribute("for");

                // check the checkbox
                $("input[id=" + id + "]").prop("checked", true);

                // enable the fields
                let startTimeField = $(
                  "input[id=" +
                    data.hours[day].day.toLowerCase() +
                    "-time-start]"
                );
                let endTimeField = $(
                  "input[id=" + data.hours[day].day.toLowerCase() + "-time-end]"
                );
                startTimeField.prop("disabled", false);
                endTimeField.prop("disabled", false);

                // populate the fields with the correct time
                // Only populate the time values, not the period (i.e. AM or PM)
                startTimeField.val(data.hours[day].startTime.split(" ")[0]);
                endTimeField.val(data.hours[day].endTime.split(" ")[0]);

                // dropdown buttons for time periods (AM or PM) - enable them and populate the right time period
                let timeStartDropdown = $(
                  "#" + data.hours[day].day.toLowerCase() + "-time-start-toggle"
                );
                timeStartDropdown.prop("disabled", false);
                timeStartDropdown.text(data.hours[day].startTime.split(" ")[1]);

                let timeEndDropdown = $(
                  "#" + data.hours[day].day.toLowerCase() + "-time-end-toggle"
                );
                timeEndDropdown.prop("disabled", false);
                timeEndDropdown.text(data.hours[day].endTime.split(" ")[1]);
              }
            }
          }
        }
      });
  }

  // hide the check address button's dropdown card
  $("#checkAddress").hide();

  // Detect a change in day checkboxes
  businessData.days.allDays.on("change", function () {
    let monday = businessData.days.monday;
    let tuesday = businessData.days.tuesday;
    let wednesday = businessData.days.wednesday;
    let thursday = businessData.days.thursday;
    let friday = businessData.days.friday;
    let saturday = businessData.days.saturday;
    let sunday = businessData.days.sunday;

    // if this change was on the Monday checkbox
    if ($(this).is(monday.check)) {
      // toggle the disabled status of Monday's times
      toggleTime(
        monday.timeStart,
        monday.timeEnd,
        monday.timeStartToggle,
        monday.timeEndToggle
      );
    }

    // check for remaining days
    if ($(this).is(tuesday.check)) {
      toggleTime(
        tuesday.timeStart,
        tuesday.timeEnd,
        tuesday.timeStartToggle,
        tuesday.timeEndToggle
      );
    }

    if ($(this).is(wednesday.check)) {
      toggleTime(
        wednesday.timeStart,
        wednesday.timeEnd,
        wednesday.timeStartToggle,
        wednesday.timeEndToggle
      );
    }

    if ($(this).is(thursday.check)) {
      toggleTime(
        thursday.timeStart,
        thursday.timeEnd,
        thursday.timeStartToggle,
        thursday.timeEndToggle
      );
    }

    if ($(this).is(friday.check)) {
      toggleTime(
        friday.timeStart,
        friday.timeEnd,
        friday.timeStartToggle,
        friday.timeEndToggle
      );
    }

    if ($(this).is(saturday.check)) {
      toggleTime(
        saturday.timeStart,
        saturday.timeEnd,
        saturday.timeStartToggle,
        saturday.timeEndToggle
      );
    }

    if ($(this).is(sunday.check)) {
      toggleTime(
        sunday.timeStart,
        sunday.timeEnd,
        sunday.timeStartToggle,
        sunday.timeEndToggle
      );
    }
  });

  // toggle text for AM/PM selection on buttons
  $(".dropdown-item").on("click", function () {
    $(this).parent().parent().prev().text($(this).text());
  });

  // display predicted address information if check address clicked
  $("#check-address-btn").on("click", () => {
    let addressCard = document.getElementById("address-card");
    validateAddress().then((params) => {
      while (addressCard.firstChild) {
        addressCard.removeChild(addressCard.firstChild);
      }

      let heading = document.createElement("p");
      let addressText = document.createElement("p");

      heading.textContent =
        "Here is the address we found based on the information you provided:";
      addressText.textContent = params.address;

      addressCard.appendChild(heading);
      addressCard.appendChild(addressText);
    });

    $("#checkAddress").show(400);
    $("#check-address-btn").prop("disabled", true);

    setTimeout(() => {
      $("#checkAddress").hide(400);
    }, 20000);
  });

  // Detect a change in price ranges
  businessData.priceType.change(function () {
    // store the label of the current selection
    selectedPrice = $("label[for=" + $(this).prop("id") + "]")
      .text()
      .trim();

    // change the checked property to false of all price range
    // checkboxes except this checkbox
    businessData.priceType.not(this).prop("checked", false);

    // replace the selectedPrice with an empty price if no price is selected
    if (!$(this).prop("checked")) {
      selectedPrice = "";
    }
  });

  // Detect a change in categories
  businessData.categoryType.change(function () {
    let category = $("label[for=" + $(this).prop("id") + "]")
      .text()
      .trim();
    let index = selectedCategories.indexOf(category);
    // If the current selection is checked
    if ($(this).prop("checked")) {
      // add the category to the list of categories
      selectedCategories.push(category);
    } else {
      // remove the category from the list of categories
      selectedCategories.splice(index, 1);
    }
  });

  // remove invalid alerts when user updates input or textarea field
  $("input, textarea").on("input", function () {
    $(this).removeClass("is-invalid");
  });

  // enable / disable check address button
  businessData.businessAddress.on("input", function () {
    // toggle the dropdown address info div if a change in input is detected
    $("#checkAddress").hide(400);

    if ($(this).val() != "") {
      $("#check-address-btn").removeAttr("disabled");
    } else {
      $("#check-address-btn").prop("disabled", true);
    }
  });

  // event handler for form submission
  businessData.businessForm.on("submit", (e) => {
    e.preventDefault();

    let criteriaSatisfied = true;

    // conditions for preventing the form from submitting
    if (selectedPrice == "") {
      criteriaSatisfied = false;
    }
    if (selectedCategories.length == 0) {
      criteriaSatisfied = false;
    }
    if (businessData.businessName.val() === "") {
      businessData.businessName.addClass("is-invalid");
      criteriaSatisfied = false;
    }
    if (businessData.businessAbout.val() === "") {
      businessData.businessAbout.addClass("is-invalid");
      criteriaSatisfied = false;
    }
    if (businessData.businessAddress.val() === "") {
      businessData.businessAddress.addClass("is-invalid");
      criteriaSatisfied = false;
    }
    if (businessData.businessPhone.val() === "") {
      businessData.businessPhone.addClass("is-invalid");
      criteriaSatisfied = false;
    }

    if (criteriaSatisfied) {
      // post the form data to the server and redirect to profile
      submitData().then((id) => {
        window.location.replace("/business-profile-owner/" + id);
      });
    } else {
      window.scrollTo(0, 0);
    }
  });

  // mask for phone number field
  $("#phone-field").mask("(999) 999-9999");

  // mask for time input
  $(".time-field").mask("99:99");

  // $('.dropdown-toggle')

  // return to the previous page if the edit form is canceled
  $("#submit-btn-cancel").on("click", () => {
    window.history.back();
  });
});
