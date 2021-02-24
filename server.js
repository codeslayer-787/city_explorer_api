
// Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const PARKS_API_KEY = process.env.PARKS_API_KEY;
//Set up the App
const app = express();
app.use(cors());


const PORT = process.env.PORT || 3001;


//Initialize The Server
// const weatherData = require('./data/weather.json');


//Adds Location
app.get('/location', (req, res) => {
  const city = req.query.city;
  console.log(req.query);
  const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
  superagent.get(url)
    .then(data => {
      console.log(data.body);
      const city1 = new City(data.body, city);
      res.json(city1);
    }).catch(() => {
      res.status(500).send('Error has occured');
    });

});

//const cityName = req.query;
function City(dataFromFile, cityName) {
  this.search_query = cityName;
  this.formatted_query = dataFromFile[0].display_name;
  this.latitude = dataFromFile[0].lat;
  this.longitude = dataFromFile[0].lon;
  console.log(this.longitude);
}

//Slightly different approach than location... for testing purposes
app.get('/weather', handleGetWeather);
function handleGetWeather(req, res) {
  console.log('in the weather', req.query);
  superagent.get(`http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${req.query.latitude}&lon=${req.query.longitude}`)
    .then(weatherData => {
      console.log('in the weather.then', weatherData.body.data);
      const weatherArray = weatherData.body.data.map(weatherOutput);
      function weatherOutput(day) {
        return new Forecast(day);
      }
      res.send(weatherArray);
    })
    .catch(errorThatComesBack => {
      res.status(500).send(errorThatComesBack);
    });
  function Forecast(weatherData) {
    this.forecast = weatherData.weather.description;
    this.time = weatherData.datetime;
    console.log(this.forecast);
  }
}
//Adding Park Data:  Need to polish this function and find out the reason it says "free" instead of "fee"
app.get('/parks', handleGetParks);
function handleGetParks(req, res) {
  console.log('these are parks', req.query);
  superagent.get(`https://developer.nps.gov/api/v1/parks?limit=3&start=0&q=${req.query.search_query}&sort=&api_key=${PARKS_API_KEY}`)
    .then(parksData => {
      console.log('another parks log.then', parksData.body.data);
      const parksArray = parksData.body.data.map(newPark => new Park(newPark));
      res.send(parksArray);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error loading parks data');
    });
}
//Creates Park objects
function Park(object) {
  this.name = object.fullName;
  this.address = object.addresses[0].line1 + ' ' + object.addresses[0].city + ' ' + object.addresses.zipCode;
  this.fee = object.entranceFees[0].cost;
  this.description = object.description;
  this.url = object.url;
}

app.listen(PORT, () => console.log(`app is alive ${PORT}`));
