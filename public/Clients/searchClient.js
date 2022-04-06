async function fetchResults(){
    
    let response = await fetch('/search/generate/' + window.location.href.split('/')[4]);
    let results = await response.json();
    return results;
}

async function searchRedirect(){
    $('#search-bar').keypress(function(event) {
        if(event.which == 13) {
            event.preventDefault();
            //redirect to search page after pressing enter in search bar
            if($('#search-bar').val() != null){
                window.location.href = "/search/" + $('#search-bar').val();
            }
        }
    });
}

$(document).ready(async function() {
    let results = await fetchResults();
    
    let resultsContainerDiv = document.createElement('div');
    resultsContainerDiv.classList.add('result', 'container');
    
    for (i = 0; i < results.length; i++){
        let hLine = document. createElement("hr");
        resultsContainerDiv.appendChild(hLine);

        let wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('row', 'row-cols-2');

        let imgDiv = document.createElement('div');
        imgDiv.classList.add('image', 'col-2');
        let shopImg = document.createElement('img');
        shopImg.classList.add('shop-img');
        shopImg.src = "../Resources/shop-pngrepo-com.png";
        imgDiv.appendChild(shopImg);
        wrapperDiv.appendChild(imgDiv);

        let infoWrappeerDiv = document.createElement('div');
        infoWrappeerDiv.classList.add('col-10');
        let name = document.createElement('h4');
        let elem = document.createTextNode(results[i].name);
        name.appendChild(elem)
        let address = document.createElement('h5');
        elem = document.createTextNode(results[i].address.address);
        address.appendChild(elem)

        let categories = document.createElement('p');
        categories.classList.add('categories');
        let catString = results[i].priceRange + " • " + results[i].categories.join(", ");;
        elem = document.createTextNode(catString);
        categories.appendChild(elem)

        let about = document.createElement('p');
        about.classList.add('about');
        elem = document.createTextNode(results[i].about);
        about.appendChild(elem);

        infoWrappeerDiv.appendChild(name);
        infoWrappeerDiv.appendChild(address);
        infoWrappeerDiv.appendChild(categories);
        infoWrappeerDiv.appendChild(about);
        wrapperDiv.appendChild(infoWrappeerDiv);
        resultsContainerDiv.appendChild(wrapperDiv);

        let btnDiv = document.createElement('div');
        btnDiv.classList.add('row', 'justify-content-end');
        let detailBtn = document.createElement("button");
        detailBtn.classList.add('details', 'btn', 'col-4', 'col-sm-3', 'col-md-2');
        detailBtn.innerHTML = "Details";
        
        // TO-DO redirect to profile page
        //detailBtn.onclick = 

        btnDiv.appendChild(detailBtn);
        resultsContainerDiv.appendChild(btnDiv);
        document.body.appendChild(resultsContainerDiv);
    }

    searchRedirect();

    // fix redirect
    // Redirect to home when home is clicked
    $('#home').on('click', function() {
        window.location.href = "/customer-dashboard";
    })

    //TO-DO: add logout
    $('#logout').on('click', function() {
        //window.location.href = "";
    })
});
