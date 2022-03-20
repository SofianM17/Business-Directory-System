let businessData = {
    businessForm: $('#create-business-form'),
    businessName: $('#business-name-field'),
    businessAbout: $('#about-field')
}

businessData.businessForm.on('submit', (e) => {
    e.preventDefault();

    let fd = new FormData();

    let businessName = businessData.businessName.val();
    let about = businessData.businessAbout.val();

})

function checkPriceRange() {}