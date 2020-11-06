const express = require("express");
const bodyParser = require("body-parser");
const assert = require("assert");
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${process.env.MONGOADDRESS}?retryWrites=true&w=majority`;
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
let dataResult = ["Not loaded yet"];
async function run(limit) {
  await MongoClient.connect(
    uri,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    },
    //callback of mongoclient connect function
    async function (err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");
      const db = client.db("dream");
      const collection = db.collection("crawls");
      const query = { createdAt: { $exists: true } };
      doSomething(db, collection, query, limit, (err, results) => {
        client.close();
        if (err) console.error(err);
        console.log(results.length);
        dataResult = results;
      });
    }
  );
}
const doSomething = (db, collection, query, limit, callback) => {
  collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray(callback);
};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/movies", (req, res) => {
  console.log(req.query.limit);
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;
  run(limit)
    .then(() => res.json(dataResult))
    .catch(console.dir);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("listening 3000");
});
