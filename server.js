const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

// use the express-static middleware
app.use(express.static("public"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// define the first route
app.get("/api/video", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const result = await client.db("sir_jukebox").collection("videos").findOne();
    console.log(result)
    return result.json();
  } catch (err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// define the first route
app.post("/api/video", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  console.log(req);

  try {
    await client.connect();

    const database = client.db("sir_jukebox");
    const collection = database.collection("videos");
    const result = await collection.insertOne({
      name: "Tom",
      youtubeUrl: "https://www.youtube.com/embed/a7-vfu79EaA",
    });
    return res.json(result);
  } catch (err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// start the server listening for requests
app.listen(process.env.PORT || 5000, () => console.log("Server is running..."));
