let createBusinessForm = document.getElementById('create-business-form');
let businessNameField = document.getElementById('business-name-field');
let aboutField = document.getElementById('about-field')

createBusinessForm.addEventListener('submit', () => {
    let businessName = businessNameField.value;
    let about = aboutField.value;
})