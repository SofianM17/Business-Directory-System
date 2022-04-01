const path = require('path');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fetch = require('node-fetch');
const express = require('express');
const http = require('http');
const { response } = require('express');
const { del } = require('express/lib/application');

const app = express();
const server = http.createServer(app);

// set up a static directory and json data parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));

// set up the port to run on
const PORT = 3000 || process.env.PORT;
server.listen(PORT, console.log(`server running on port ${PORT}`));

let curId;

app.get('/', (req, res) => {})

// display a page for confirming deletion of business
app.get('/delete-business/:id', (req, res) => {
    res.sendFile(__dirname + '/public/Views/deleteBusinessConfirmation.html')
})

// display the add business page on a get request of this url
app.get('/add-business', (req, res) => {
    res.sendFile(__dirname + '/public/Views/addBusiness.html');
});

// display the edit business page on a get request of this url
app.get('/edit-business/:id', (req, res) => {
    res.sendFile(__dirname + '/public/Views/editBusiness.html');
});

// display the business profile page on a get request of this url
app.get('/business-profile-owner/:id', async(req, res) => {
    res.sendFile(__dirname + '/public/Views/businessProfileOwner.html');
});

// This request returns the business found in the database by id
app.get('/business-get/:id', async(req, res) => {
    let client = await connectDatabase();
    let oId = new ObjectId(req.params.id);
    let businessData = await getBusinessById(client, oId);
    res.send(businessData[0]);
    console.log(businessData[0]);
    client.close();
})

// display customer homepage on a get request of this url
app.get('/customer-homepage' , async(req, res) => {
    res.sendFile(__dirname + '/public/Views/customerHomepage.html');
});
 
// display customer search results on a get request of this url
app.get('/search/:query', async(req, res) => {
    res.sendFile(__dirname + '/public/Views/searchResults.html');
});
 
// display customer search results on a get request of this url
// TODO: add search by name
app.get('/search/generate/:query' , async(req, res) => {
    let client = await connectDatabase();
    let searchQuery = new RegExp(req.params.query, 'i');
    if (searchQuery){
        let categoryResults = await getBusinessByCategory(client, searchQuery);
        res.send(categoryResults);
    }
    client.close();
});

// Handle post request for add business page
app.post("/submit-form-create", async(req, res) => {
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
app.post("/submit-form-edit/:id", async(req, res) => {
    let formRequest = req.body;
    let objId = new ObjectId(req.params.id);
    console.log(formRequest);

    let client = await connectDatabase();
    await updateBusiness(client, objId, formRequest);
    res.send(objId);
    client.close();
});

// Handle request to delete the business from the database
app.post("/submit-form-delete/:id", async(req, res) => {
    let objId = new ObjectId(req.params.id);
    let client = await connectDatabase();
    await deleteBusiness(client, objId);
    client.close();
})


async function connectDatabase() {
    const uri = "mongodb+srv://businessDirSysAdmin:cYmACq0vr704SLbN@cluster0.4kjcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

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

// adds a single business profile as a new document into the database
async function addBusiness(client, newBusiness) {
    const result = await client.db("businessesDB").collection("businesses").insertOne(newBusiness);
}

async function getBusinessById(client, id) {
    const cursor = client.db("businessesDB").collection("businesses").find({ _id: id });
    return cursor.toArray();
}

// returns all of the documents with a matching category field from the database
async function getBusinessByCategory(client, category) {
    const cursor = client.db("businessesDB").collection("businesses").find({ categories: category });
    return cursor.toArray();
    //const results = await cursor.toArray();

    // print name for first result
    //console.log(results[0].name);
}

// Find the business by its id and replace the business with updated one
async function updateBusiness(client, businessId, updatedInfo) {
    const result = await client.db("businessesDB").collection("businesses").replaceOne({ "_id": businessId }, updatedInfo);
}

// Find the business by its id and delete the business
async function deleteBusiness(client, businessId) {
    const result = await client.db("businessesDB").collection("businesses").deleteOne({ "_id": businessId });
}