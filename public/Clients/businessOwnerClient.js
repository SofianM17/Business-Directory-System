let businessData = {
    businessForm: $('#create-business-form'),
    businessName: $('#business-name-field'),
    priceType: $('.priceCheck'),
    categoryType: $('.catCheck'),
    businessAbout: $('#about-field'),
    businessLocation: $('#location-field'),
    businessPhone: $('#phone-field'),

}

let selectedPrice;
let selectedCategories = [];

// send a post request to the server
// containing form data
function submitData() {

    fetch("/add-business", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: businessData.businessName.val(),
            priceRange: selectedPrice,
            categories: selectedCategories,
            about: businessData.businessAbout.val(),
            location: businessData.businessLocation.val(),
            phoneNum: businessData.businessPhone.val(),

        })

    });


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

        console.log(selectedCategories);

        // change the checked property to false of all price range
        // checkboxes except this checkbox
        businessData.priceType.not(this).prop('checked', false);
    });
});