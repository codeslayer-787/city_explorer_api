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


