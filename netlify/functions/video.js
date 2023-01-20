const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const { sendNotification } = require("../../sendNotification");

const uri = process.env.MONGODB_URI;

exports.handler = async function (event, context) {
  const { httpMethod, body: bodyString } = event;
  const body = JSON.parse(bodyString);
  if (httpMethod === "GET") {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const result = await client
        .db("sir_jukebox")
        .collection("videos")
        .findOne({}, { sort: { $natural: -1 } });
      return {
        statusCode: 200,
        body: JSON.stringify(result),
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
  if (httpMethod === "POST") {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("POST /api/video", body);
    try {
      await client.connect();
      const result = await client
        .db("sir_jukebox")
        .collection("videos")
        .insertOne(body.data);

      if (body.subscription) {
        // send notification to submitter
        sendNotification(body.subscription, `Your track has been added...`);
      }

      const subs = await client
        .db("sir_jukebox")
        .collection("subscriptions")
        .find()
        .sort({ $natural: 1 })
        .limit(50)
        .toArray();

      // send notification to everybody else
      subs
        .filter(
          ({ subscription }) =>
            subscription?.endpoint !== body.subscription?.endpoint
        )
        .map(({ subscription }) =>
          sendNotification(
            subscription,
            `${body?.data?.name} added a new track!`
          )
        );
      return {
        statusCode: 200,
        body: JSON.stringify(result),
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
