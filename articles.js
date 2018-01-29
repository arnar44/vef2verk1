const express = require('express');
const router = express.Router();
const fs = require('fs');
const fm = require('front-matter');
var MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();

//Nafn á grein sem kemur í titil
var name = '';
//HTML úr markdown skjali
var html = '';


function getHTML(req, res, next) {
    console.log('middlewear keyrist');
    //sækja slugið og klippa '/' af sitthvoru megin
    var url = (req.originalUrl).slice(1, -1);

    fs.readdir('articles/', (err, files) => {
        files.forEach(file => {
            fs.readFile('articles/' + file, 'utf8', function(err, data){
              if(err) throw err;
      
              var content = fm(data);
              if(content.attributes['slug'] == url){
                  name = content.attributes['title'];
                  //Tökum út bil og bætum "-" í staðinn því þannig eru articles geymd
                  name = name.replace(/\s/g, "-");
                  //body úr .md skjali breytt í html
                  html = md.render(content.body);
                  console.log(name);
              }
            });
        });
      })
    next();
}


router.use(getHTML);



router.get('/', (req, res) => {
    console.log('router keyrist');
    res.render('article', { title: name, html});
  });

  

module.exports = router;