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
const expressjwt = require("express-jwt");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

// set up a static directory and json data parsing
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));

//set up cors to prevent some fail to load errors
app.use(cors());

// set up cookie parsing to handle logins
app.use(cookieParser());

// set up the port to run on
const PORT = 3000 || process.env.PORT;
server.listen(PORT, console.log(`server running on port ${PORT}`));

let curId;

// Set up JSON Web Token Authentication
// get the access token from the cookie
function getAccessToken(req) {
  var token = req.cookies.access_token;
  if (token) {
    console.log("here");
    return token;
  }
  return null;
}

// Used to make requests for the correct page
function makeSecret(req, accountType) {
  secret = accountType + "/" + req.params.id;
  console.log(secret);
  return secret;
}

// Verify that the customer has access to this page
const customerLoggedIn = function (req, res, next) {
  const token = getAccessToken(req);
  const secret = makeSecret(req, "customer");
  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res
      .status(403)
      .send({ error: "You are not authorized to view this page." });
  }
};

// Verify that the business user has access to this page
const businessLoggedIn = function (req, res, next) {
  const token = getAccessToken(req);
  const secret = makeSecret(req, "business");
  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res
      .status(403)
      .send({ error: "You are not authorized to view this page." });
  }
};

app.get("/", (req, res) => {});

// display a page for confirming deletion of business
app.get("/delete-business/:id", (req, res) => {
  res.sendFile(__dirname + "/public/Views/deleteBusinessConfirmation.html");
});

// display the add business page on a get request of this url
app.get("/add-business", (req, res) => {
  res.sendFile(__dirname + "/public/Views/addBusiness.html");
});

// display the edit business page on a get request of this url
app.get("/edit-business/:id", (req, res) => {
  res.sendFile(__dirname + "/public/Views/editBusiness.html");
});

// display the business profile page on a get request of this url
app.get("/business-profile-owner/:id", async (req, res) => {
  res.sendFile(__dirname + "/public/Views/businessProfileOwner.html");
});

// display the business owner dashboard page on a get request of this url
app.get("/business-dashboard/:id", businessLoggedIn, async (req, res) => {
  res.sendFile(__dirname + "/public/Views/businessDashboard.html");
});

// display the customer dashboard page on a get request of this url
app.get("/customer-dashboard/:id", customerLoggedIn, async (req, res) => {
  res.sendFile(__dirname + "/public/Views/customerDashboard.html");
});

// This request returns the business found in the database by id
app.get("/business-get/:id", async (req, res) => {
  let client = await connectDatabase();
  let oId = new ObjectId(req.params.id);
  let businessData = await getBusinessById(client, oId);
  res.send(businessData[0]);
  console.log(businessData[0]);
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
// TODO: NOT DONE YET, remove console logs
app.post("/submit-form-create-account", async (req, res) => {
  let formRequest = req.body;
  formRequest["_id"] = new ObjectId();
  curId = formRequest["_id"];
  console.log(formRequest);
  console.log(curId);

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
// TODO: Needs to redirect to the correct page
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

// const businessjwtCheck = expressjwt({
//   secret: (req) => makeSecret(req, "business"),
//   algorithms: ["HS256"],
//   getToken: (req) => getAccessToken(req),
// });

// Handle post request for add business page
app.post("/submit-form-create", async (req, res) => {
  let formRequest = req.body;
  formRequest["_id"] = new ObjectId();
  curId = formRequest["_id"];
  console.log(formRequest);

  let client = await connectDatabase();
  await addBusiness(client, formRequest);
  res.send(curId);
  client.close();
});

// Handle post request for edit business page
app.post("/submit-form-edit/:id", async (req, res) => {
  let formRequest = req.body;
  let objId = new ObjectId(req.params.id);
  console.log(formRequest);

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
  // should do something here to redirect the user off the deletion page
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

// returns all of the documents with a matching category field from the database
async function getBusinessByCategory(client, category) {
  const cursor = client
    .db("businessesDB")
    .collection("businesses")
    .find({ categories: category });
  const results = await cursor.toArray();

  // print name for first result
  console.log(results[0].name);
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
