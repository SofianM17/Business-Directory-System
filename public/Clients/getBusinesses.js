$(document).ready(async function () {
    let results = await fetchResults();

    for(i =0; i<results.length; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        var img = document.createElement('img');
        var businessID = results[i]._id;
        console.log(businessID);
        a.setAttribute('href', "/business-profile-owner/" + businessID);
        a.setAttribute('class', "btn");
        a.innerHTML = results[i].name;
        img.setAttribute('src', "../Resources/store.jpg");
        img.setAttribute('width', "40px");
        a.appendChild(img);
        li.appendChild(a);
        console.log(a.href);
        document.getElementById('businesses_list').appendChild(li);
    }
});


async function fetchResults(){
    let response = await fetch("/businesses/" + window.location.href.split("/")[4]);
    let results = await response.json();
    return results;
}
