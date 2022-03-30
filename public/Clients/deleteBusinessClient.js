$(document).ready(function() {
    $('#confirm-yes').on('click', () => {
        // fetch request to delete business
        fetch("/submit-form-delete/" + window.location.href.split('/')[4], {
            method: "POST",
            headers: {
                'Content-Length': 0
            },

        });

        // redirect to a new page after deletion
        window.location.href = "/add-business";
    })

    // if cancel is clicked, redirect to the previous page
    $('#confirm-no').on('click', () => {
        window.history.back();
    })
});