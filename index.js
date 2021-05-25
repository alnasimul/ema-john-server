const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello ema john server');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66naq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db(process.env.DB_NAME).collection("products");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");

  app.post('/addProduct',(req,res) => {
      const products = req.body;
      console.log(products);
      productsCollection.insertMany(products)
      .then( result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount);
      })
  })

  app.get('/products', (req,res) => {
    const search = req.query.search;
    console.log(search)
    productsCollection.find({name: {$regex: search}})
    .toArray((err,documents) => {
      res.send(documents);
    })
  })

  app.get('/product/:key', (req,res) => {
    productsCollection.find({key: req.params.key})
    .toArray((err,documents) => {
      res.send(documents[0]);
    })
  })

  app.post('/productsByKeys',(req,res) => {
    const productKeys = req.body;
    productsCollection.find({key: {$in : productKeys }})
    .toArray((err,documents) => {
        res.send(documents);
    })
  })

  app.post('/addOrder',(req,res) => {
    const order = req.body;
    console.log(order);
    ordersCollection.insertOne(order)
    .then( result => {
      res.send(result.insertedCount > 0);
    })
  })
  console.log('Database Connected');
});


app.listen(process.env.PORT || port)