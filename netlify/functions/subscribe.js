const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");
const { sendNotification } = require("../../sendNotification");

const uri = process.env.MONGODB_URI;

exports.handler = async function (event, context) {
  const { httpMethod, body: bodyString } = event;
  const body = JSON.parse(bodyString);
  if (httpMethod === "POST") {
    const subscription = body;
    console.log(subscription);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const isSubscribed = await client
        .db("sir_jukebox")
        .collection("subscriptions")
        .findOne({ subscription }, { sort: { $natural: -1 } });
      console.log("isSubscribed?", Boolean(isSubscribed));
      if (!isSubscribed) {
        await client
          .db("sir_jukebox")
          .collection("subscriptions")
          .insertOne({ subscription });
        sendNotification(subscription, "Subscribed to now playing...");
      }
      return {
        statusCode: 201,
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

  if (httpMethod === "DELETE") {
    console.log("DELETE /subscribe");
    const subscription = body;
    console.log(subscription);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      await client
        .db("sir_jukebox")
        .collection("subscriptions")
        .deleteOne({ subscription });
      return {
        statusCode: 204,
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
