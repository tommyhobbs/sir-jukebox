const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");
const { sendNotification } = require("../../sendNotification");

const uri = process.env.MONGODB_URI;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;

exports.handler = async function (event, context) {
  const { httpMethod, body: bodyString } = event;
  const body = JSON.parse(bodyString);
  if (httpMethod === "POST") {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("POST /notify", body);
    try {
      await client.connect();
      if (body?.message && body?.publicVapidKey === publicVapidKey) {
        const subs = await client
          .db("sir_jukebox")
          .collection("subscriptions")
          .find()
          .sort({ $natural: 1 })
          .limit(50)
          .toArray();
        subs.map(({ subscription }) =>
          sendNotification(subscription, body.message)
        );
        return {
          statusCode: 201,
        };
      } else {
        return {
          statusCode: 406,
        };
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
};
