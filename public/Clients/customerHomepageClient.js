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

$(document).ready(function() {
    // Redirect page if search is initiated
    $('#search-bar').keypress(function(event) {
        if(event.which == 13) {
            event.preventDefault();

            //redirect to search page after pressing enter in search bar
            if($('#search-bar').val() != null){
                window.location.href = "/search/" + $('#search-bar').val();
            }
        }
    })

    // Redirect to home when home button is clicked
    $('.home').on('click', function() {
        window.location.href = "/customer-dashboard/" + getCookie("user");;
    })

    // TO-DO: Add logout redirect
    $('.logout').on('click', function() {
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
