$(document).ready(function() {
    $('#search-bar').keypress(function(event) {
        if(event.which == 13) {
            event.preventDefault();
           
            //redirect to search page after pressing enter in search bar
            if($('#search-bar').val()!= null){
                window.location.href = "/search/" + $('#search-bar').val();
            }
        }
    })
 
    //TODO: add redirects for when buttons are pressed
 
});
