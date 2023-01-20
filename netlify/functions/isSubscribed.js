const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

exports.handler = async function (event, context) {
  const { httpMethod, body: bodyString } = event;
  const body = JSON.parse(bodyString);
  if (httpMethod === "POST") {
    console.log("/isSubscribed");
    const subscription = body;
    console.log(subscription);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const isSubscribed = await client
        .db("sir_jukebox")
        .collection("subscriptions")
        .findOne({ subscription }, { sort: { $natural: -1 } });
      return {
        statusCode: 200,
        body: JSON.stringify({
          subscription: isSubscribed ? subscription : null,
        }),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 400,
      };
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
};
