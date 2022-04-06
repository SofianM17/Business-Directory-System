$(document).ready(function() {
    $('#search-bar').keypress(function(event) {
        if(event.which == 13) {
            event.preventDefault();
           
            //redirect to search page after pressing enter in search bar
            if($('#search-bar').val() != null){
                window.location.href = "/search/" + $('#search-bar').val();
            }
        }
    })

    // TO-DO: fix redirect
    // Redirect to home when home is clicked
    $('#home').on('click', function() {
        window.location.href = "/customer-dashboard";
    })

    // TO-DO: Add logout redirect
    $('#logout').on('click', function() {
        //window.location.href = "";
    })

    // search by category
    // redirects to search page for when buttons are pressed
    $('#dining').on('click', function() {
        window.location.href = "/search/dining";
    })

    $('#shopping').on('click', function() {
        window.location.href = "/search/shopping";
    })

    $('#groceries').on('click', function() {
        window.location.href = "/search/groceries";
    })

    $('#automotive').on('click', function() {
        window.location.href = "/search/automotive";
    })

    $('#health').on('click', function() {
        window.location.href = "/search/health";
    })

    $('#beauty').on('click', function() {
        window.location.href = "/search/beauty";
    })
});
