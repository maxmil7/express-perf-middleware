const express = require('express');
const app = express();
const middleware = require('../index.js');

app.use(middleware({ interval: 5000}));

app.get('/', (req, res) => res.send('OK'));

app.listen(8000, () => console.log('app started listening'));




