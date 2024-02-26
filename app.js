const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/say', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const response = await axios.get('https://dohrnlovh4gvm3brkohdvkenia0grppp.lambda-url.us-east-1.on.aws/', {
      params: { keyword },
    });

    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: Keyword not found');
  }
});

app.listen(PORT, () => {
  console.log(`Web service running on http://localhost:${PORT}`);
});
