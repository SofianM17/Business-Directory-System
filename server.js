const path = require('path');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const express = require('express');
const http = require('http');
const { response } = require('express');

const app = express();
const server = http.createServer(app);

// set up a static directory and json data parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));

// set up the port to run on
const PORT = 3000 || process.env.PORT;
server.listen(PORT, console.log(`server running on port ${PORT}`));

app.get('/', (req, res) => {})


// display the add business page on a get request of this url
app.get('/add-business', (req, res) => {
    res.sendFile(__dirname + '/public/Views/addBusiness.html')
})

// Handle post request for add business page
app.post("/submit-form", async(req, res) => {
    let formRequest = req.body;
    console.log(formRequest);

    let client = await connectDatabase();
    await addBusiness(client, formRequest);
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

// returns all of the documents with a matching category field from the database
async function getBusinessByCategory(client, category) {
    const cursor = client.db("businessesDB").collection("businesses").find({ categories: category });
    const results = await cursor.toArray();

    // print name for first result
    console.log(results[0].name);
}

// Find the business by its name and update the business with updatedInfo
async function updateBusiness(client, businessName, updatedInfo) {
    const result = await client.db("businessesDB").collection("businesses").updateOne({ name: businessName }, { $set: updatedInfo });
}

// Find the business by its name and delete the business
async function deleteBusiness(client, businessName) {
    const result = await client.db("businessesDB").collection("businesses").deleteOne({ name: businessName });
}