const Promise = require('bluebird');

const mongo = Promise.promisifyAll(require('mongodb'));
const connString = process.env.MONGO_STRING;

const faker = require('faker');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');

const app = express();
app.engine('handlebars', hbs({defaultLayout: 'frame'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());

const genDogs = (n) => {
  return Array.apply(null, Array(n)).map(() => {
    return {
      name: faker.name.firstName(),
      age: faker.random.number({min: 1, max: 10}),
      ownerFirstName: faker.name.firstName(),
      ownerLastName: faker.name.lastName()
    };
  });
};

mongo.connect(connString).then((db) => {
  const dogs = db.collection('dogs');

  app.get('/', (req, res) => {
    dogs.find().sort({name: 1}).toArray()
      .then(dogs => res.render('index', {dogs}))
      .catch(err => res.error(err));
  });

  app.get('/doggies', (req, res) => {
    dogs.find().sort({name: 1}).toArray()
      .then(dogs => res.json(dogs))
      .catch(err => res.error(err));
  });

  app.post('/doggies', (req, res) => {
    dogs.insert(req.body)
      .then(dog => res.status(201).end())
      .catch(err => res.error(err));
  });

  app.get('/doggies/:name', (req, res) => {
    dogs.findOne({name: req.params.name})
      .then(dog => res.json(dog))
      .catch(err => res.error(err));
  });
  
  app.get('/create', (req, res) => {
    dogs.insertMany(genDogs(5))
      .then(() => res.redirect(302, '/'))
      .catch(err => res.error(err));
  });

  app.listen(3000);
});