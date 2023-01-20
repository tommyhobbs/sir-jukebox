const { MongoClient } = require("mongodb");
const webpush = require("web-push");
const dotenv = require("dotenv");
dotenv.config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const uri = process.env.MONGODB_URI;

webpush.setVapidDetails(
  "https://www.linkedin.com/in/tommyhobbs",
  publicVapidKey,
  privateVapidKey
);

exports.sendNotification = async (subscription, message) => {
  try {
    console.log(subscription.endpoint);
    webpush
      .sendNotification(
        subscription,
        JSON.stringify({
          title: message,
        })
      )
      .then(async (res, rej) => {
        console.log(`res ${res}`);
        console.log(`rej ${rej}`);
        if (rej?.statusCode === 410) {
          try {
            const client = new MongoClient(uri, {
              useUnifiedTopology: true,
            });
            console.log(subscription);
            await client
              .db("sir_jukebox")
              .collection("subscriptions")
              .deleteOne({ subscription });
            console.log(`subscription ${subscription} removed`);
          } catch (e) {
            console.log(e);
          }
        }
      })
      .catch((e) => console.log(e));
  } catch (e) {
    console.log(e);
  }
};
