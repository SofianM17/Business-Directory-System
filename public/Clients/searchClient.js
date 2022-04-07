// request data from server based on the search query in the url
async function fetchResults(){
    let response = await fetch('/search/generate/' + window.location.href.split('/')[4]);
    let results = await response.json();
    return results;
}

// function for page redirects
async function redirects(){
    // Redirect page if new search is initiated
    $('#search-bar').keypress(function(event) {
        if(event.which == 13) {
            event.preventDefault();
            //redirect to search page after pressing enter in search bar
            if($('#search-bar').val() != null){
                window.location.href = "/search/" + $('#search-bar').val();
            }
        }
    });

    // Redirect to home when home is clicked
    $('.home').on('click', function() {
        window.location.href = "/customer-dashboard/" + getCookie("user");
    })

    //TO-DO: add logout
    $('.logout').on('click', function() {
        //window.location.href = "";
    })
}

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

$(document).ready(async function() {
    let results = await fetchResults();

    // create div to contain the results
    let resultsContainerDiv = document.createElement('div');
    resultsContainerDiv.classList.add('result', 'container');

    let resultsString = document.createElement('h2');
    let string = "Showing results for \"" + window.location.href.split('/')[4] + "\"";
    let node = document.createTextNode(string);
    resultsString.appendChild(node);
    resultsContainerDiv.appendChild(resultsString);

    // loop through data containing the search results
    for (let i = 0; i < results.length; i++) {
        let hLine = document. createElement("hr");
        resultsContainerDiv.appendChild(hLine);

        // create wrapper div to contain the respective information of 1 search result
        let wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('row', 'row-cols-2');

        // Add image/icon for the search result 
        let imgDiv = document.createElement('div');
        imgDiv.classList.add('image', 'col-2');
        let shopImg = document.createElement('img');
        shopImg.classList.add('shop-img');
        shopImg.src = "../Resources/shop-pngrepo-com.png";
        imgDiv.appendChild(shopImg);
        wrapperDiv.appendChild(imgDiv);

        // create infoWrapper div that holds information about the business
        let infoWrappeerDiv = document.createElement('div');
        infoWrappeerDiv.classList.add('col-10');

        // add business name
        let name = document.createElement('h4');
        let elem = document.createTextNode(results[i].name);
        name.appendChild(elem)

        // add business address
        let address = document.createElement('h5');
        elem = document.createTextNode(results[i].address.address);
        address.appendChild(elem)

        // add business categories and price
        let categories = document.createElement('p');
        categories.classList.add('categories');
        let catString = results[i].priceRange + " • " + results[i].categories.join(", ");;
        elem = document.createTextNode(catString);
        categories.appendChild(elem)

        // add description about business
        let about = document.createElement('p');
        about.classList.add('about');
        elem = document.createTextNode(results[i].about);
        about.appendChild(elem);

        // append info to inforwrapper div
        infoWrappeerDiv.appendChild(name);
        infoWrappeerDiv.appendChild(address);
        infoWrappeerDiv.appendChild(categories);
        infoWrappeerDiv.appendChild(about);

        // append infowrapper div to wrapperdiv
        wrapperDiv.appendChild(infoWrappeerDiv);

        // append wrapper div to the results container div
        resultsContainerDiv.appendChild(wrapperDiv);

        // add button for redirect to business profile
        let btnDiv = document.createElement('div');
        btnDiv.classList.add('row', 'justify-content-end');
        let detailBtn = document.createElement('button');
        detailBtn.classList.add('details', 'btn', 'col-4', 'col-sm-3', 'col-md-2');
        detailBtn.innerHTML = "Details";

        // Button to redirect to respective business profile page
        detailBtn.onclick = function() {
            window.location.href = "/business-profile-user/" + results[i]._id
        };

        // append button to results container div
        btnDiv.appendChild(detailBtn);
        resultsContainerDiv.appendChild(btnDiv);
        
        document.body.appendChild(resultsContainerDiv);
    }

    redirects();

});
