const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const webpush = require("web-push");

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "https://www.linkedin.com/in/tommyhobbs",
  publicVapidKey,
  privateVapidKey
);

app.use(express.json());
// use the express-static middleware
app.use(express.static("public"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/api/video", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const result = await client
      .db("sir_jukebox")
      .collection("videos")
      .findOne({}, { sort: { $natural: -1 } });
    console.log(result);
    res.send(result);
  } catch (err) {
    throw new Error(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/video", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  console.log("POST /api/video", req.body);
  try {
    await client.connect();
    const result = await client
      .db("sir_jukebox")
      .collection("videos")
      .insertOne(req.body.data);

    if (req.body.subscription) {
      // send notificaiton to submitter
      webpush
        .sendNotification(
          req.body.subscription,
          JSON.stringify({
            title: `Your track has been added...`,
          })
        )
        .catch((err) => console.error(err));
    }

    const subs = await client
      .db("sir_jukebox")
      .collection("subscriptions")
      .find()
      .sort({ $natural: 1 })
      .limit(50)
      .toArray();

    console.log("subscriptions", subs);
    // send notificaiton to everybody else
    subs
      .filter((sub) => sub !== req.body.subscription)
      .map((sub) =>
        webpush.sendNotification(
          sub,
          JSON.stringify({
            title: `${req.body?.data?.name}'s track has been added...`,
          })
        )
      );
    res.send(result);
  } catch (err) {
    throw new Error(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// certbot response
app.get("/.well-known/acme-challenge/:content", function (req, res) {
  res.send(
    "THBQZy95VEHLGBEaSAtdHYg5u-i42nTBs8xuCgA0Trs.38_nyYUeg_Q_neXtCpCGPrqwhrJqfacXiMcJS_Sfs30"
  );
});

//Subscribe Route
app.post("/subscribe", async (req, res) => {
  const subscription = req.body;
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
        .insertOne(subscription);
      webpush.sendNotification(
        subscription,
        JSON.stringify({ title: "Subscribed to now playing..." })
      );
    }
    res.status(201).json({});
  } catch (err) {
    throw new Error(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// start the server listening for requests
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
