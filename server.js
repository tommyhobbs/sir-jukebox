const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const webpush = require("web-push");

const { MongoClient } = require("mongodb");
const { response } = require("express");
const { stringify } = require("querystring");

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

// define the first route
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

// define the first route
app.post("/api/video", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  console.log(req.body);

  try {
    await client.connect();
    const result = await client
      .db("sir_jukebox")
      .collection("videos")
      .insertOne(req.body);
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
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Push Test" });
  console.log(subscription);
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
});

// start the server listening for requests
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
