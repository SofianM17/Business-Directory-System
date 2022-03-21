let businessData = {
    businessForm: $('#create-business-form'),
    businessName: $('#business-name-field'),
    priceType: $('.priceCheck'),
    categoryType: $('.catCheck'),
    businessAbout: $('#about-field'),

    businessLocation: {
        locationWrap: $('.wrapper2'),
        unit: $('#bld-no-field'),
        street: $('#street-field'),
        city: $('#city-field'),
        province: $('#prov-field'),
        country: $('#country-field')
    },

    businessPhone: $('#phone-field'),
    businessWebsite: $('#url-field'),

    // days: $('.day'),
    // businessHours: {
    //     Monday: $('#day1'),
    // }
}

class BusinessDay {
    constructor(day, timeOpen, timeClose) {
        this.day = day;
        this.timeOpen = timeOpen;
        this.timeClose = timeClose;
    }
}

let selectedPrice = '';
let selectedCategories = [];


// send a post request to the server
// containing form data
async function submitData() {

    let obj = {
        name: businessData.businessName.val(),
        priceRange: selectedPrice,
        categories: selectedCategories,
        about: businessData.businessAbout.val(),
        location: {
            unit: businessData.businessLocation.unit.val(),
            street: businessData.businessLocation.street.val(),
            city: businessData.businessLocation.city.val(),
            province: businessData.businessLocation.province.val(),
            country: businessData.businessLocation.country.val()
        },
        phoneNum: businessData.businessPhone.val(),
        website: businessData.businessWebsite.val(),

    };

    let response = await fetch("/validate-form", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)

    })

    let data = await response.json();

    if (data.validation == "NOT_CONFIRMED") {
        businessData.businessLocation.locationWrap.addClass('is-invalid')
    }
    console.log(data);


}

// event handler for form submission
businessData.businessForm.on('submit', (e) => {
    e.preventDefault();

    // post the form data to the server
    submitData();


})

$(document).ready(() => {

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

    $('.dropdown-toggle')


});