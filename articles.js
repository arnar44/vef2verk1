const express = require('express');

const router = express.Router();
const fs = require('fs');
const fm = require('front-matter');
const MarkdownIt = require('markdown-it');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const readDirAsync = util.promisify(fs.readdir);

// fall sem skilar promise að skrá verði lesin inn
async function read(file) {
  const data = await readFileAsync(file);
  return data.toString('utf8');
}

// Middleware sem sækir nöfn skráa í articles möppu
async function getFileNames(req, res, next) {
  req.names = await readDirAsync('./articles');
  next();
}

// Middleware sem les inn og parse-ar greinar
async function readArticles(req, res, next) {
  const promiseArticles = [];

  // filter út allt sem er ekki .md skrá
  req.names = req.names.filter(name => /.md$/.test(name));

  // fylla promiseArticles af promises um skrár sem verða lesnar inn
  req.names.map(file => promiseArticles.push(read(`articles/${file}`)));

  // Bíða eftir að skrárnar eru lesnar inn og pars-a þær svo allar
  req.articles = await Promise.all(promiseArticles).then(values => values.map(value => fm(value)));
  next();
}

// Middleware sem raðar greinunum og breytir dagsetningar strengnum í dagsetningarhlut
function order(req, res, next) {
  req.articles.sort((a, b) => new Date(b.attributes.date) - new Date(a.attributes.date));

  // Breytum date úr streng í date hlut
  /* eslint-disable no-param-reassign */
  req.articles.forEach((article) => {
    article.attributes.date = new Date(article.attributes.date);
  });
  /* eslint-enable no-param-reassign */
  next();
}

// köllum á async-middleware með þessu falli svo við getum gripið villur ef þæ koma upp
function catchErrors(fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

// Köllum á middleware
router.use(catchErrors(getFileNames));
router.use(catchErrors(readArticles));
router.use(order);

// Ef tómt þá sýnum við index síðuna
router.get('/', (req, res) => {
  const { articles } = req;
  res.render('index', { title: 'Greinasafnið', articles });
});

// Ef eitthvað slug, ath hvort það passi við nafn á grein, þá sýna
// (annars '404 villa - fannst ekki')
router.get('/:slug', (req, res, next) => {
  const { slug } = req.params;
  const md = new MarkdownIt();
  req.found = false;

  // Ath hvort slug passi við eitthvað slug af greinunum okkar, þá birta
  req.articles.forEach((article) => {
    if (article.attributes.slug === slug) {
      const articleTitle = article.attributes.title;
      const html = md.render(article.body);
      res.render('article', {
        error: false, title: articleTitle, html, tilbaka: 'TB',
      });
    }
  });
  next();
});

// Error handler fyrir 404 villur, þegar efni finnst ekki
router.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).render('article', {
      error: true, title: 'Fannst ekki', errormsg: 'Ó nei, efnið finnst ekki!', tilbaka: 'errorTB',
    });
  }
});

// Grípur middleware villur sem sendust niður
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('article', {
    error: true, title: 'Villa kom upp', errormsg: '', tilbaka: 'errorTB',
  });
  next();
});

module.exports = router;
