const path = require('path');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const express = require('express');
const http = require('http');
const { response } = require('express');

// constants for location validation
const ADDRESS_HIGH_CONFIDENCE = 0.95;
const ADDRESS_LOW_CONFIDENCE = 0.2;
const validationResult = {}

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
app.post("/validate-form", (req, res) => {
    let formRequest = req.body;
    console.log(formRequest);

    const url = `https://api.geoapify.com/v1/geocode/search?housenumber=${encodeURIComponent(formRequest.location.unit)}&street=${encodeURIComponent(formRequest.location.street)}&city=${encodeURIComponent(formRequest.location.city)}&state=${encodeURIComponent(formRequest.location.province)}&country=${encodeURIComponent(formRequest.location.country)}&apiKey=dd6853e113004f1a83795613f67a78a8`;

    fetch(url)
        .then(resp => resp.json())
        .then((geocodingResult) => {
            console.log(geocodingResult);

            // address is invalid
            if (geocodingResult.features.length === 0) {
                validationResult.validation = 'NOT_CONFIRMED_NO_FEATURE';
                return validationResult;
            }

            const address = geocodingResult.features[0].properties;

            // Validate address
            if (address.rank.confidence >= ADDRESS_HIGH_CONFIDENCE) {
                validationResult.validation = 'CONFIRMED';
                validationResult.validation_details = '';
            } else if (address.rank.confidence < ADDRESS_LOW_CONFIDENCE) {
                validationResult.validation = 'NOT_CONFIRMED';
                validationResult.validation_details = '';
            } else {
                validationResult.validation = 'PARTIALLY_CONFIRMED';
                if (address.rank.confidence_street_level >= ADDRESS_HIGH_CONFIDENCE) {
                    validationResult.validation_details = 'BUILDING_NOT_FOUND';
                } else if (address.rank.confidence_city_level >= ADDRESS_HIGH_CONFIDENCE) {
                    validationResult.validation_details = 'STREET_NOT_FOUND';
                } else {
                    validationResult.validation_details = 'CITY_NOT_FOUND';
                }
            }

            console.log(address.rank.confidence);

            return validationResult;
        })
        .then(validationRes => (res.json(validationRes)));

    // respond with the validation result

})


async function connectDatabase() {
    const uri = "mongodb+srv://businessDirSysAdmin:cYmACq0vr704SLbN@cluster0.4kjcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

    const client = new MongoClient(uri);

    try {
        await client.connect();

        // Add a business into the database (Example)
        // await addBusiness(client, {
        //     name: "Tom's Pizzeria",
        //     categories: ["Restaurant", "Italian", "Pizza", "Dine-In", "Take-out", "Dining"],
        //     description: "A family-owned restaurant established in 1997 serving the broader Calgary area. With each bite is an authentic Italian taste that is unique only to our recipe.",
        //     contact: {
        //         website: "www.toms-pizza.com",
        //         phoneNumber: "(403) 119 2954"
        //     },
        //     location: "1212 104 Ave. SW Calgary",
        //     hours: {
        //         Mon: "10:00AM - 10:00PM",
        //         Tues: "10:00AM - 10:00PM",
        //         Wed: "10:00AM - 10:00PM",
        //         Thurs: "10:00AM - 10:00PM",
        //         Fri: "10:00AM - 10:00PM",
        //         Sat: "10:00AM - 10:00PM",
        //         Sun: "Closed"
        //     },
        //     reviews: [{
        //         name: "Maria",
        //         rating: "4.5",
        //         review: "The service was excellent and the food was delicious!"
        //     }]
        // });

        // Get business by category from the database (Example)
        await getBusinessByCategory(client, "Italian");

        // update business with name "Tom's Pizzeria"  to "Tom's Pizza" (Example)
        // await updateBusiness(client, "Tom's Pizzeria", { name: "Tom's Pizza" });

        // delete business with name "Tom's Pizzeria"
        // await deleteBusiness(client, "Tom's Pizzeria")

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// deals with case of rejected promise
connectDatabase().catch(console.error);

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