const path = require("path");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const fetch = require("node-fetch");
const express = require("express");
const http = require("http");
const { response } = require("express");
const { del } = require("express/lib/application");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { ObjectID } = require("bson");

const app = express();
const server = http.createServer(app);

// set up a static directory and json data parsing
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));

//set up cors to prevent some fail to load errors
app.use(cors());

// set up cookie parsing to handle logins
app.use(cookieParser());

// display favicon
app.use("/favicon.ico", express.static("public/Resources/favicon.ico"));

// set up the port to run on
const PORT = 3000 || process.env.PORT;
server.listen(PORT, console.log(`server running on port ${PORT}`));

let curId;

// Set up JSON Web Token Authentication
// get the access token from the cookie
function getAccessToken(req) {
  var token = req.cookies.access_token;
  if (token) {
    return token;
  }
  return null;
}

// Used to make requests for the correct page
async function makeSecret(req, accountType) {
  if (req.params.user) {
    // for user base pages
    secret = accountType + "/" + req.params.user;
  } else if (req.params.id) {
    // for id based checks (business id) to see if business is associated with
    // this user or not
    let isAuthorized = await doesUserOwnBusiness(req);
    if (isAuthorized == true) {
      secret = accountType + "/" + req.cookies.user;
    } else {
      secret = ""; // will error out on auth fail
    }
  } else {
    secret = accountType + "/" + req.cookies.user;
  }
  return secret;
}

// Verify that the customer has access to this page
const customerLoggedIn = async function (req, res, next) {
  const token = getAccessToken(req);
  const secret = await makeSecret(req, "customer");
  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res
      .status(403)
      .send("<h2>Error: You are not authorized to view this page.</h2>");
    //.send({ error: "You are not authorized to view this page." });
  }
};

// Verify that the business user has access to this page
const businessLoggedIn = async function (req, res, next) {
  const token = getAccessToken(req);
  const secret = await makeSecret(req, "business");
  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res
      .status(403)
      //   .send({ error: "You are not authorized to view this page." });
      .send("<h2>Error: You are not authorized to view this page.</h2>");
  }
};

// make the default location the login page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/Views/login.html");
});

// display a page for confirming deletion of business
app.get("/delete-business/:id", businessLoggedIn, (req, res) => {
  res.sendFile(__dirname + "/public/Views/deleteBusinessConfirmation.html");
});

// display the add business page on a get request of this url
app.get("/add-business", businessLoggedIn, (req, res) => {
  res.sendFile(__dirname + "/public/Views/addBusiness.html");
});

// display the edit business page on a get request of this url
app.get("/edit-business/:id", businessLoggedIn, (req, res) => {
  res.sendFile(__dirname + "/public/Views/editBusiness.html");
});

// display the business profile page on a get request of this url
app.get("/business-profile-owner/:id", businessLoggedIn, async (req, res) => {
  res.sendFile(__dirname + "/public/Views/businessProfileOwner.html");
});

// display the business owner dashboard page on a get request of this url
app.get("/business-dashboard/:user", businessLoggedIn, async (req, res) => {
  res.sendFile(__dirname + "/public/Views/businessDashboard.html");
});

// display the customer dashboard page on a get request of this url
app.get("/customer-dashboard/:user", customerLoggedIn, async (req, res) => {
  res.sendFile(__dirname + "/public/Views/customerHomepage.html");
});

// display the business profile page on a get request of this url
app.get("/business-profile-user/:id", async (req, res) => {
  res.sendFile(__dirname + "/public/Views/businessProfileUser.html");
});

// This request returns the business found in the database by id
app.get("/business-get/:id", async (req, res) => {
  let client = await connectDatabase();
  let oId = new ObjectId(req.params.id);
  let businessData = await getBusinessById(client, oId);
  res.send(businessData[0]);
  // console.log(businessData[0]);
  client.close();
});

// display the create account page on a get request of this url
app.get("/create-account", (req, res) => {
  res.sendFile(__dirname + "/public/Views/createAccount.html");
});

// display the login page on a get request of this url
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/Views/login.html");
});

app.get("/businesses/:id", async (req, res) => {
  let client = await connectDatabase();
  let result = await getBusinessesByBusinessOwner(client, req.params.id);
  res.send(result);
  client.close();
});

//This verifies if a user with this username already exists.
app.get("/users/:id", async (req, res) => {
  let client = await connectDatabase();
  let result = await findUserByUsername(client, req.params.id);
  if (result != null) {
    res.status(200).send("user exists");
  } else {
    res.status(404).send("user does not exist");
  }
  client.close();
});

// Handle post request for create account page
app.post("/submit-form-create-account", async (req, res) => {
  let formRequest = req.body;
  formRequest["_id"] = new ObjectId();
  curId = formRequest["_id"];
  formRequest["favorites"] = new Array();

  let client = await connectDatabase();
  createAccount(client, formRequest).then(
    () => {
      // if created
      let token = createLoginToken(formRequest);

      // Set cookies with 3 hour expiry and send
      res.cookie("access_token", token, { maxAge: 10800000 }); // 3 hours
      res.cookie("accountType", formRequest.accountType, { maxAge: 10800000 });
      res.cookie("user", "" + formRequest["_id"], { maxAge: 10800000 });
      res.status(201).send({ accountCreated: "true" });
      client.close();
    },
    () => {
      // if not created
      res.status(400).send({ accountCreated: "false" });
      client.close();
    }
  );
});

// Handle post request for login page
app.post("/login-request", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({ error: "A username or password was not entered." });
    return;
  }
  // else look for the user
  let client = await connectDatabase();
  let user = await findUserByUsername(client, req.body.username);
  if (user == null) {
    // user does not exist
    res.status(404).send({ error: `User ${req.body.username} does not exist` });
    client.close();
    return;
  }
  //Check if password matches
  if (user.password != req.body.password) {
    res.status(403).send({ error: "Password is incorrect. Please try again." });
    client.close();
    return;
  }
  // Issue a JSON web token to sign in otherwise
  const token = createLoginToken(user);
  // Set cookies with 3 hour expiry and send
  res.cookie("access_token", token, { maxAge: 10800000 }); // 3 hours
  res.cookie("accountType", user.accountType, { maxAge: 10800000 });
  res.cookie("user", "" + user._id, { maxAge: 10800000 });
  res.status(200).send({ login_success: "true" });
  client.close();
});

// Handle logout requests
app.post("/logout-request", async (req, res) => {
  if (req.cookies.access_token && req.cookies.user && req.cookies.accountType) {
    // if user is logged in, send cleared cookie with very short timeout to "revoke" access
    res.cookie("access_token", "", { maxAge: 5000 }); // 5 seconds
    res.cookie("accountType", "", { maxAge: 5000 });
    res.cookie("user", "", { maxAge: 5000 });
    res
      .status(200)
      .send({ logout_success: "true", message: "Succesfully logged out." });
  } else {
    // not logged in
    res.status(400).send({ error: "Could not logout user." });
  }
});

/* Login token creation */
function createLoginToken(user) {
  let token = jwt.sign(
    {
      sub: user._id,
      username: user.username,
      accountType: user.accountType,
    },
    user.accountType + "/" + user._id,
    { expiresIn: "3 hours" }
  );
  return token;
}

// display customer search results on a get request of this url
app.get("/search/:query", async (req, res) => {
  res.sendFile(__dirname + "/public/Views/searchResults.html");
});

// display customer search results on a get request of this url
app.get("/search/generate/:query", async (req, res) => {
  let client = await connectDatabase();
  let searchQuery = req.params.query;
  let regex = new RegExp(searchQuery, "i");

  switch (regex) {
    // search by category
    case "dining":
    case "shopping":
    case "groceries":
    case "automotive":
    case "health":
    case "beauty":
      let categoryResults = await getBusinessByCategory(client, regex);
      res.send(categoryResults);
      break;
    // search by name
    default:
      let searchResults = await getBusinessName(client, regex);
      res.send(searchResults);
      break;
  }
  client.close();
});

app.get("/favorites", async (req, res) => {
  res.sendFile(__dirname + "/public/Views/favorites.html");
});
// Favorites endpoint, gets the favorites for a customer
app.get("/favorites/find", customerLoggedIn, async (req, res) => {
  let client = await connectDatabase();
  let businesses = await getFavorites(client, req.cookies.user);
  res.status(200).send(businesses);
  client.close();
});

// Handle post request for add business page
app.post("/submit-form-create", async (req, res) => {
  let formRequest = req.body;
  formRequest["_id"] = new ObjectId();
  formRequest["businessOwner"] = new ObjectId(formRequest["businessOwner"]);
  curId = formRequest["_id"];
  //   console.log(formRequest);

  let client = await connectDatabase();
  await addBusiness(client, formRequest);
  res.send(curId);
  client.close();
});

// Handle post request for edit business page
app.post("/submit-form-edit/:id", async (req, res) => {
  let formRequest = req.body;
  formRequest["businessOwner"] = new ObjectId(formRequest["businessOwner"]);
  let objId = new ObjectId(req.params.id);
  //console.log(formRequest);

  let client = await connectDatabase();
  await updateBusiness(client, objId, formRequest);
  res.send(objId);
  client.close();
});

// Handle request to delete the business from the database
app.post("/submit-form-delete/:id", async (req, res) => {
  let objId = new ObjectId(req.params.id);
  let client = await connectDatabase();
  await deleteBusiness(client, objId);
  res.status(200).send({ deletionSuccess: "true" });
  client.close();
});

async function connectDatabase() {
  const uri =
    "mongodb+srv://businessDirSysAdmin:cYmACq0vr704SLbN@cluster0.4kjcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    return client;
  } catch (e) {
    console.error(e);
  }

  // finally {
  //     await client.close();
  // }
}

// deals with case of rejected promise
//connectDatabase().catch(console.error);

// adds a single new account as a new document into the database
async function createAccount(client, newAccount) {
  const result = await client
    .db("businessesDB")
    .collection("users")
    .insertOne(newAccount);
}

// Find a user by their username
async function findUserByUsername(client, username) {
  const user = await client
    .db("businessesDB")
    .collection("users")
    .findOne({ username: username });
  return user;
}

// Find a user by their id
async function findUserByID(client, userID) {
  const user = await client
    .db("businessesDB")
    .collection("users")
    .findOne({ _id: ObjectID(userID) });
  return user;
}

// adds a single business profile as a new document into the database
async function addBusiness(client, newBusiness) {
  const result = await client
    .db("businessesDB")
    .collection("businesses")
    .insertOne(newBusiness);
}

async function getBusinessById(client, id) {
  const cursor = client
    .db("businessesDB")
    .collection("businesses")
    .find({ _id: id });
  return cursor.toArray();
}

async function getBusinessesByBusinessOwner(client, ownerID) {
  const cursor = client
    .db("businessesDB")
    .collection("businesses")
    .find({ businessOwner: ObjectId(ownerID) });

  const results = await cursor.toArray();
  return results;
}

// Check if user owns the business. Used for authentication
async function doesUserOwnBusiness(req) {
  let client = await connectDatabase();
  // Find if this business is associated with this owner
  let results = await getBusinessesByBusinessOwner(client, req.cookies.user);
  for (let business of results) {
    if (req.params.id == business._id) {
      // user owns the business
      client.close();
      return true;
    }
  }
  client.close();
  return false; // user doesn't own the business
}

// returns all of the documents with a matching category field from the database
async function getBusinessByCategory(client, category) {
  const cursor = client
    .db("businessesDB")
    .collection("businesses")
    .find({ categories: category });
  return cursor.toArray();
}

// returns all of the documents with a matching namefield from the database
async function getBusinessName(client, businessName) {
  const cursor = client
    .db("businessesDB")
    .collection("businesses")
    .find({ name: businessName });
  return cursor.toArray();
}

// Find the business by its id and replace the business with updated one
async function updateBusiness(client, businessId, updatedInfo) {
  const result = await client
    .db("businessesDB")
    .collection("businesses")
    .replaceOne({ _id: businessId }, updatedInfo);
}

// Find the business by its id and delete the business
async function deleteBusiness(client, businessId) {
  const result = await client
    .db("businessesDB")
    .collection("businesses")
    .deleteOne({ _id: businessId });
}

// Find user favorites
async function getFavorites(client, userID) {
  let favorites = [];
  let count = 0;
  let user = await findUserByID(client, userID);
  for (let businessID of user.favorites) {
    let business = await getBusinessById(client, businessID);
    favorites[count] = business[0];
    count = count + 1;
  }
  return favorites;
}
