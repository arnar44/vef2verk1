const express = require('express');
const fs = require('fs');
const fm = require('front-matter');
const path = require('path');
const ejs = require('ejs');
const router = require('./articles');

const app = express();

//Middleware sem raðar greinunum
function orderMiddleware(req, res, next) {
  articles.sort(function(a,b){
    return new Date(b.date) - new Date(a.date);
  })
  //Látum vita að gögnum var raðað.
  console.log("raðað!");
  console.log('----------------------------');
  //Breytum date úr streng í date hlut
  //Prentum gögnin út til að sjá hvort þau komu í réttri röð
  articles.forEach(articles => {
    articles['date'] = new Date(articles['date']);
    console.log(articles);
  });
  next(); 
}

//til að nota templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use til að lesa static skrár úr public möppunni
app.use(express.static(__dirname + '/public'));
app.use('/img', express.static(__dirname + '/img'));


//Ná í greinar
var articles = [];

fs.readdir('articles/', (err, files) => {
  files.forEach(file => {
      fs.readFile('articles/' + file, 'utf8', function(err, data){
        if(err) throw err;

        var content = fm(data);
        articles.push(content.attributes);
        console.log(content.attributes);
      });
  });
})

//Köllum á middleware til að raða fylkinu með greinunum í
app.use(orderMiddleware);


app.use('/:slug', router);
//upphafssíða
app.get('/', (req, res) => {
  res.render('index', { title: 'Greinasafnið', articles });
});


//setja upp server
const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
