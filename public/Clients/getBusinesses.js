$(document).ready(async function () {
  let results = await fetchResults();

  for (i = 0; i < results.length; i++) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    var img = document.createElement("img");
    var businessID = results[i]._id;

    a.setAttribute("href", "/business-profile-owner/" + businessID);
    a.setAttribute("class", "btn btn-outline-dark");
    a.innerHTML = "<h6>" + results[i].name + "</h6>";
    img.setAttribute("src", "../Resources/store.png");
    a.appendChild(img);
    li.appendChild(a);

    document.getElementsByClassName("business_list")[0].appendChild(li);
  }

  // redirect to the add business page
  $(".addNew").on("click", function () {
    window.location.replace("/add-business");
  });
});

async function fetchResults() {
  let response = await fetch(
    "/businesses/" + window.location.href.split("/")[4]
  );
  let results = await response.json();
  return results;
}
