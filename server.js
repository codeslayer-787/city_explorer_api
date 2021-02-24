
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
const weatherData = require('./data/weather.json');


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


app.get('/weather', getWeatherData);
function getWeatherData(req, res) {
  let forecast = new WeatherForecast(weatherData, req.query);
  res.send(forecast);
}
//To catch errors and give a message back
// req.catch(errorThatComesBack) => {
//   res.status(500).send('This is an error');
// };

function WeatherForecast(weatherData) {

  return weatherData = weatherData.data.map(weatherItem =>
    new Forecast(weatherItem.weather.description, weatherItem.datetime)
  );
  // return dasForecast;
}


function Forecast(forecast, time) {
  this.forecast = forecast;
  this.time = time;
  console.log(this.forecast);
}


