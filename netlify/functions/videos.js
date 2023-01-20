const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

exports.handler = async function (event, context) {
  const { httpMethod } = event;
  if (httpMethod === "GET") {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const results = await client
        .db("sir_jukebox")
        .collection("videos")
        .find()
        .sort({ $natural: -1 })
        .limit(50)
        .toArray();
      return {
        statusCode: 200,
        body: JSON.stringify(results),
      };
    } catch (err) {
      console.error(err);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
};
