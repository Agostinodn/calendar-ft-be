// CONNESSIONE A MONGO DB
const { MongoClient } = require("mongodb");

module.exports = {
  start: async (MONGO_URI) => {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client
      .connect()
      .then((res) => {
        console.log("server connesso al DB");
      })
      .catch((error) => console.log(error.message));

    global.db = client.db("registro");
    global.anagrafica = client.db("registro").collection("anagrafica");
    global.users = client.db("registro").collection("users");
  },
};
