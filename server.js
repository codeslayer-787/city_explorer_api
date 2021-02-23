const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
//talks to the server
app.use(cors());


const PORT =  process.env.PORT || 3001;

app.listen(PORT, () => console.log(`app is alive ${PORT}`));

//Instantiating The Server
const locationData = require('./data/location.json');
const weatherData = require('./data/weather.json');

//Adds Location
app.get('/location',(req, res) => {
  const city1 = new City(locationData, req.query);
  res.send(city1);
});

function City(dataFromFile, cityName){
  this.search_query = cityName,
  this.formatted_query = dataFromFile[0].display_name,
  this.latitude = dataFromFile[0].lat,
  this.longitude = dataFromFile[0].lon,
  console.log(this.longitude);
}


app.get('/weather',getWeatherData);
function getWeatherData(req, res) {
  let forecast = new WeatherForecast(weatherData, req.query);
  res.send(forecast);
}

function WeatherForecast(weatherData){
  let dasForecast = [];
  for(let i=0; i< weatherData.data.length; i++){
    let forecast = weatherData.data[i].weather.description;
    let dateTime = weatherData.data[i].datetime;
    let forecastObject = new Forecast(forecast, dateTime);
    dasForecast.push(forecastObject);
  }
  return dasForecast;
}


function Forecast(forecast, time){
  this.forecast = forecast;
  this.time = time;
  console.log(this.forecast);
}


