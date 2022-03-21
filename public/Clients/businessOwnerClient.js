let businessData = {
    businessForm: $('#create-business-form'),
    businessName: $('#business-name-field'),
    priceType: $('.priceCheck'),
    categoryType: $('.catCheck'),
    businessAbout: $('#about-field'),

    // businessLocation: {
    //     locationWrap: $('.wrapper2'),
    //     unit: $('#bld-no-field'),
    //     street: $('#street-field'),
    //     city: $('#city-field'),
    //     province: $('#prov-field'),
    //     country: $('#country-field')
    // },

    businessAddress: $('#address-field'),
    businessPhone: $('#phone-field'),
    businessWebsite: $('#url-field'),

    // days: $('.day'),
    // businessHours: {
    //     Monday: $('#day1'),
    // }
}

let expandClosedFlag = false;

// constants for location validation
const ADDRESS_HIGH_CONFIDENCE = 0.8;
const ADDRESS_LOW_CONFIDENCE = 0.2;
const validationResult = {}

class BusinessDay {
    constructor(day, timeOpen, timeClose) {
        this.day = day;
        this.timeOpen = timeOpen;
        this.timeClose = timeClose;
    }
}

let selectedPrice = '';
let selectedCategories = [];

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

// display predicted address information if check address clicked
$('#check-address-btn').on('click', () => {
    //expandClosedFlag = !expandClosedFlag;

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

})

// send a post request to the server
// containing form data
async function submitData() {

    let obj = {
        name: businessData.businessName.val(),
        priceRange: selectedPrice,
        categories: selectedCategories,
        about: businessData.businessAbout.val(),
        address: businessData.businessAddress.val(),
        phoneNum: businessData.businessPhone.val(),
        website: businessData.businessWebsite.val(),

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

$(document).ready(() => {

    $('#checkAddress').hide();

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
            console.log('invalid');
            criteriaSatisfied = false;
        }
        if (businessData.businessName.val() === '') {
            businessData.businessName.addClass('is-invalid');
            criteriaSatisfied = false;
        }

        if (criteriaSatisfied) {
            // post the form data to the server
            submitData();
        }


    })

    // mask for phone number field
    // mask borrowed from https://stackoverflow.com/questions/17651207/mask-us-phone-number-string-with-javascript
    $('#phone-field').on('input', function(e) {
        var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    $('.dropdown-toggle')


});