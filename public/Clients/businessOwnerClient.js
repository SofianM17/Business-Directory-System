let businessData = {
    businessForm: $('#create-business-form'),
    businessName: $('#business-name-field'),
    priceType: $('.priceCheck'),
    categoryType: $('.catCheck'),
    businessAbout: $('#about-field'),

    businessAddress: $('#address-field'),
    businessPhone: $('#phone-field'),
    businessWebsite: $('#url-field'),

    days: {
        allDays: $('.form-check-input'),
        monday: {
            check: $('#monday-check'),
            timeStart: $('#monday-time-start'),
            timeEnd: $('#monday-time-end'),
            timeStartToggle: $('#monday-time-start-toggle'),
            timeEndToggle: $('#monday-time-end-toggle'),
        },
        tuesday: {
            check: $('#tuesday-check'),
            timeStart: $('#tuesday-time-start'),
            timeEnd: $('#tuesday-time-end'),
            timeStartToggle: $('#tuesday-time-start-toggle'),
            timeEndToggle: $('#tuesday-time-end-toggle'),
        },
        wednesday: {
            check: $('#wednesday-check'),
            timeStart: $('#wednesday-time-start'),
            timeEnd: $('#wednesday-time-end'),
            timeStartToggle: $('#wednesday-time-start-toggle'),
            timeEndToggle: $('#wednesday-time-end-toggle'),
        },
        thursday: {
            check: $('#thursday-check'),
            timeStart: $('#thursday-time-start'),
            timeEnd: $('#thursday-time-end'),
            timeStartToggle: $('#thursday-time-start-toggle'),
            timeEndToggle: $('#thursday-time-end-toggle'),
        },
        friday: {
            check: $('#friday-check'),
            timeStart: $('#friday-time-start'),
            timeEnd: $('#friday-time-end'),
            timeStartToggle: $('#friday-time-start-toggle'),
            timeEndToggle: $('#friday-time-end-toggle'),
        },
        saturday: {
            check: $('#saturday-check'),
            timeStart: $('#saturday-time-start'),
            timeEnd: $('#saturday-time-end'),
            timeStartToggle: $('#saturday-time-start-toggle'),
            timeEndToggle: $('#saturday-time-end-toggle'),
        },
        sunday: {
            check: $('#sunday-check'),
            timeStart: $('#sunday-time-start'),
            timeEnd: $('#sunday-time-end'),
            timeStartToggle: $('#sunday-time-start-toggle'),
            timeEndToggle: $('#sunday-time-end-toggle'),
        }
    }
}

let selectedPrice = '';
let selectedCategories = [];

// use the fetch API to validate, format, and estimate (if needed) the requested address
async function validateAddress() {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(businessData.businessAddress.val())}&apiKey=dd6853e113004f1a83795613f67a78a8`;

    let response = await fetch(url);
    let data = await response.json();

    console.log(data);

    const address = data.features[0].properties;

    console.log(address.rank.confidence);

    // formatted address (predicted if not fully provided)
    console.log(address.formatted);

    return { address: address.formatted };
}

function getTimePeriod(timeField) {
    if (timeField.val() != '') {
        return ' ' + timeField.next().text();
    } else {
        return ''
    }
}


// send a post request to the server
// containing form data
async function submitData() {

    let geoApResponse = await validateAddress();
    let formattedAddress = geoApResponse.address;

    let obj = {
        name: businessData.businessName.val(),
        priceRange: selectedPrice,
        categories: selectedCategories,
        about: businessData.businessAbout.val(),
        address: formattedAddress,
        phoneNum: businessData.businessPhone.val(),
        website: businessData.businessWebsite.val(),
        hours: {
            monday: {
                startTime: businessData.days.monday.timeStart.val() + getTimePeriod(businessData.days.monday.timeStart),
                endTime: businessData.days.monday.timeEnd.val() + getTimePeriod(businessData.days.monday.timeEnd)
            },
            tuesday: {
                startTime: businessData.days.tuesday.timeStart.val() + getTimePeriod(businessData.days.tuesday.timeStart),
                endTime: businessData.days.tuesday.timeEnd.val() + getTimePeriod(businessData.days.tuesday.timeEnd)
            },
            wednesday: {
                startTime: businessData.days.wednesday.timeStart.val() + getTimePeriod(businessData.days.wednesday.timeStart),
                endTime: businessData.days.wednesday.timeEnd.val() + getTimePeriod(businessData.days.wednesday.timeEnd)
            },
            thursday: {
                startTime: businessData.days.thursday.timeStart.val() + getTimePeriod(businessData.days.thursday.timeStart),
                endTime: businessData.days.thursday.timeEnd.val() + getTimePeriod(businessData.days.thursday.timeEnd)
            },
            friday: {
                startTime: businessData.days.friday.timeStart.val() + getTimePeriod(businessData.days.friday.timeStart),
                endTime: businessData.days.friday.timeEnd.val() + getTimePeriod(businessData.days.friday.timeEnd)
            },
            saturday: {
                startTime: businessData.days.saturday.timeStart.val() + getTimePeriod(businessData.days.saturday.timeStart),
                endTime: businessData.days.saturday.timeEnd.val() + getTimePeriod(businessData.days.saturday.timeEnd)
            },
            sunday: {
                startTime: businessData.days.sunday.timeStart.val() + getTimePeriod(businessData.days.sunday.timeStart),
                endTime: businessData.days.sunday.timeEnd.val() + getTimePeriod(businessData.days.sunday.timeEnd)
            }
        }

    };

    let response = await fetch("/submit-form", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)

    })

    let data = await response.json();

    console.log(data);


}

// toggles the disabled state of time fields
function toggleTime(timeStartField, timeEndField, timeStartToggle, timeEndToggle) {
    timeStartField.prop('disabled', (i, v) => { return !v });
    timeEndField.prop('disabled', (i, v) => { return !v });
    timeStartToggle.prop('disabled', (i, v) => { return !v });
    timeEndToggle.prop('disabled', (i, v) => { return !v });
}

$(document).ready(() => {

    $('#checkAddress').hide();

    // Detect a change in day checkboxes
    businessData.days.allDays.on('change', function() {
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
            toggleTime(monday.timeStart, monday.timeEnd, monday.timeStartToggle, monday.timeEndToggle);
        }

        // check for remaining days
        if ($(this).is(tuesday.check)) {
            toggleTime(tuesday.timeStart, tuesday.timeEnd, tuesday.timeStartToggle, tuesday.timeEndToggle);
        }

        if ($(this).is(wednesday.check)) {
            toggleTime(wednesday.timeStart, wednesday.timeEnd, wednesday.timeStartToggle, wednesday.timeEndToggle);
        }

        if ($(this).is(thursday.check)) {
            toggleTime(thursday.timeStart, thursday.timeEnd, thursday.timeStartToggle, thursday.timeEndToggle);
        }

        if ($(this).is(friday.check)) {
            toggleTime(friday.timeStart, friday.timeEnd, friday.timeStartToggle, friday.timeEndToggle);
        }

        if ($(this).is(saturday.check)) {
            toggleTime(saturday.timeStart, saturday.timeEnd, saturday.timeStartToggle, saturday.timeEndToggle);
        }

        if ($(this).is(sunday.check)) {
            toggleTime(sunday.timeStart, sunday.timeEnd, sunday.timeStartToggle, sunday.timeEndToggle);
        }

    })

    // toggle AM/PM selection on buttons
    $('.dropdown-item').on('click', function() {
        $(this).parent().parent().prev().text($(this).text());
    });

    // display predicted address information if check address clicked
    $('#check-address-btn').on('click', () => {

        let addressCard = document.getElementById('address-card');
        validateAddress().then(params => {

            while (addressCard.firstChild) {
                addressCard.removeChild(addressCard.firstChild);
            }

            let heading = document.createElement('p');
            let addressText = document.createElement('p');

            heading.textContent = 'Here is the address we found based on the information you provided:'
            addressText.textContent = params.address;

            addressCard.appendChild(heading);
            addressCard.appendChild(addressText);
        })

        $('#checkAddress').show(400);
        $('#check-address-btn').prop("disabled", true);

        setTimeout(() => {
            $('#checkAddress').hide(400)
        }, 20000)

    });

    // Detect a change in price ranges
    businessData.priceType.change(function() {
        // store the label of the current selection
        selectedPrice = $("label[for=" + $(this).prop("id") + "]").text().trim();

        // change the checked property to false of all price range
        // checkboxes except this checkbox
        businessData.priceType.not(this).prop('checked', false);

        // replace the selectedPrice with an empty price if no price is selected
        if (!$(this).prop('checked')) {
            selectedPrice = '';
        }
    });

    // Detect a change in categories
    businessData.categoryType.change(function() {
        let category = $("label[for=" + $(this).prop("id") + "]").text().trim();
        let index = selectedCategories.indexOf(category);
        // If the current selection is checked
        if ($(this).prop('checked')) {
            // add the category to the list of categories
            selectedCategories.push(category);
        } else {
            // remove the category from the list of categories
            selectedCategories.splice(index, 1);

        }
    });

    // remove invalid alerts when user updates input or textarea field
    $('input, textarea').on('input', function() {
        $(this).removeClass('is-invalid');
    })

    // enable / disable check address button
    businessData.businessAddress.on('input', function() {

        // toggle the dropdown address info div if a change in input is detected
        $('#checkAddress').hide(400);

        if ($(this).val() != '') {
            $('#check-address-btn').removeAttr('disabled');
        } else {
            $('#check-address-btn').prop('disabled', true);
        }

    })

    // event handler for form submission
    businessData.businessForm.on('submit', (e) => {
        e.preventDefault();

        let criteriaSatisfied = true;

        // if a price range and at least 1 category have been selected
        if (selectedPrice == '' && selectedCategories.length == 0) {
            criteriaSatisfied = false;
        }
        if (businessData.businessName.val() === '') {
            businessData.businessName.addClass('is-invalid');
            criteriaSatisfied = false;
        }
        if (businessData.businessAbout.val() === '') {
            businessData.businessAbout.addClass('is-invalid');
            criteriaSatisfied = false;
        }
        if (businessData.businessAddress.val() === '') {
            businessData.businessAddress.addClass('is-invalid');
        }

        if (criteriaSatisfied) {
            // post the form data to the server
            submitData();
        } else {
            window.scrollTo(0, 0);
        }


    })

    // mask for phone number field
    // mask borrowed from https://stackoverflow.com/questions/17651207/mask-us-phone-number-string-with-javascript
    $('#phone-field').on('input', function(e) {
        var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    $('.time-field').on('input', function(e) {

    })

    $('.dropdown-toggle')


});