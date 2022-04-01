async function fetchResults(){
    let response = await fetch('/search/generate/' + window.location.href.split('/')[4]);
    let results = await response.json();
    return results;
}
 
$(document).ready(async function() {
    let results = await fetchResults();
   
    // TODO: add other relevant information to the result
    for (i=0; i<results.length; i++){
        $("<h3>" + results[i].name + "</h3>").appendTo('#name');
    }
 
});
 