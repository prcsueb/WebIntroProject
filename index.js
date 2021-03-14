const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://premang:shreenathji@cluster0.oevtu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/mongodb', (req, res) => {
        MongoClient.connect(url, function(err, client) {
            // mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {  // works with mongodb v2 but not v3
            if(err) throw err
            //get collection of routes
            const db = client.db('Test')  // in v3 we need to get the db from the client
            const Routes = db.collection('User')
            //get all Routes with frequency >=1
            Routes.find({}).toArray(function (err, docs) {
                if(err) throw err
                res.render('pages/mongodb', {results: docs})
            })
            //close connection when your app is terminating.
            // db.close(function (err) {
            client.close(function (err) {
                if(err) throw err
            })
        })
    })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

showTimes = () => {
  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return result;
}