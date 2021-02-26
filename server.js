
// Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

//Set up the App
const app = express();
app.use(cors());

const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));
//Line above makes sure an error message shows up for any errors.

const PORT = process.env.PORT || 3001;

//SQL

app.get('/', (req, res) => {
  client.query('SELECT * FROM cities')
    .then(resultsHere => {
      res.send(resultsHere);
    });
});

//Initialize The Server
//Adds Location
app.get('/location', (req, res) => {
  const city = req.query.city;
  let SQL = 'SELECT * FROM cities WHERE search_query = $1';
  let VALUES = [city];
  client.query(SQL, VALUES)
    .then(results => {
      if (results.rowCount) {
        let city = results.rows[0].search_query;
        console.log(`${city} is already in the database`);
        return res.send(results.rows[0]);
      } else {
        const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
        superagent.get(url)
          .then(data => {
            let search_query = city;
            let formatted_query = data.body[0].display_name;
            let latitude = data.body[0].lat;
            let longitude = data.body[0].lon;
            new City(search_query, formatted_query, latitude, longitude);
            let SQL = 'INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * ';
            let VALUES = [search_query, formatted_query, latitude, longitude];
            console.log(city.body);

            client.query(SQL, VALUES)
              .then(results => {
                console.log(results);
                res.send(results.rows[0]);
              });
          }).catch(() => {
            res.status(500).send('An error has occured');
          });
      }
    });
});
function City(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
  console.log(this.longitude);
}

//Slightly different approach than location... for testing purposes
app.get('/weather', handleGetWeather);
function handleGetWeather(req, res) {
  // console.log('in the weather', req.query);
  superagent.get(`http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lat=${req.query.latitude}&lon=${req.query.longitude}`)
    .then(weatherData => {
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
  superagent.get(`https://developer.nps.gov/api/v1/parks?limit=3&start=0&q=${req.query.search_query}&sort=&api_key=${PARKS_API_KEY}`)
    .then(parksData => {
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
//Adding movies to the API
app.get('/movies', handleGetMovies);
function handleGetMovies(req, res) {
  const city = req.query.search_query;
  superagent.get(`https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`)
    .then(moviesData => {
      const moviesArray = moviesData.body.results.map(newMovie => new Movie(newMovie));
      res.send(moviesArray);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error loading movies data');
    });
}
//Creates Movies Objects
function Movie(object) {
  this.title = object.title;
  this.overview = object.overview;
  this.average_votes = object.vote_average;
  this.total_votes = object.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500' + object.poster_path;
  this.popularity = object.popularity;
  this.released_on = object.release_date;
}
//Adds Yelp route to API
app.get('/yelp', handleGetYelp);
function handleGetYelp(req, res) {
  const city = req.query.search_query;
  superagent.get(`https://api.yelp.com/v3/businesses/search?location=${city}`)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(yelpData => {
      const yelpArray = yelpData.body.businesses.map(newReview => new YelpReview(newReview));
      res.send(yelpArray);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error loading Yelp Data!');
    });
}
function YelpReview(object) {
  this.name = object.name;
  this.image_url = object.image_url;
  this.price = object.price;
  this.rating = object.rating;
  this.url = object.url;
}

client.connect().then(() => {
  app.listen(PORT, () => console.log(`app is alive ${PORT}`));
});

