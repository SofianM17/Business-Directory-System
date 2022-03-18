const { MongoClient } = require('mongodb');

async function connectDatabase() {
    const uri = "mongodb+srv://businessDirSysAdmin:cYmACq0vr704SLbN@cluster0.4kjcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

    const client = new MongoClient(uri);

    try {
        await client.connect();
        await listDatabases(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// deals with case of rejected promise
connectDatabase().catch(console.error);

async function listDatabases(client) {
    const dbList = await client.db().admin().listDatabases();

    dbList.databases.forEach(db => {
        console.log(db.name);
    })
}