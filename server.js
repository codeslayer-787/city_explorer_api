const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
//talks to the server
app.use(cors());

const PORT =  process.env.PORT || 3001;
console.log(process.env.candy);

app.listen(PORT, () => console.log(`app is alive ${PORT}`));

//Instantiating The Server
app.get('/city_explorer',(req, res) => {
  res.send('It is really alive');
});
