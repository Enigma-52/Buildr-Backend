const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000; 

app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
  console.log(req.body);
  const responseData = { message: 'User data received successfully' };
  res.status(200).json(responseData);
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
