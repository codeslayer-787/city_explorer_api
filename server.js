
// Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();

//Set up the App
const app = express();
app.use(cors());


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`app is alive ${PORT}`));

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


app.get('/weather', handleGetWeather);
function handleGetWeather(req, res) {
  console.log('in the weather', req.query);
  superagent.get(`http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${req.query.latitude}&lon=${req.query.longitude}`)
    .then(weatherData => {
      console.log('in the weather.then', weatherData.body.data);
      const wxArr = weatherData.body.data.map(wxOutput);
      function wxOutput(day) {
        return new Forecast(day);
      }
      res.send(wxArr);
    })
    .catch(errorThatComesBack => {
      res.status(500).send(errorThatComesBack);
    });


  function Forecast(wxData) {
    this.forecast = wxData.weather.description;
    this.time = wxData.datetime;
    console.log(this.forecast);
  }
}
