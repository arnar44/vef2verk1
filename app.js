const express = require('express');
const path = require('path');
const router = require('./articles');

const app = express();

// til að nota templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use til að lesa static skrár
app.use(express.static('articles'));
app.use(express.static('public'));

app.use('/', router);

// setja upp server
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
