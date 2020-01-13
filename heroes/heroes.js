import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import Debug from 'debug';

const debug = Debug('http-server');
const port = process.argv.slice(2)[0];
debug(`port is ${port} ${process.argv}`);
const app = express();
app.use(bodyParser.json());
const powers = [
  {id:1, name: 'flying'},
  {id:2, name: 'teleporting'},
  {id:3, name: 'super strength'},
  {id:4, name: 'clairvoyance'},
  {id:5, name: 'mind reading'},
];

const heroes = [
  {
      id: 1,
      type: 'spider-dog',
      displayName: 'Cooper',
      powers: [1, 4],
      img: 'cooper.jpg',
      busy: false
  },
  {
      id: 2,
      type: 'flying-dogs',
      displayName: 'Jack & Buddy',
      powers: [2, 5],
      img: 'jack_buddy.jpg',
      busy: false
  },
  {
      id: 3,
      type: 'dark-light-side',
      displayName: 'Max & Charlie',
      powers: [3, 2],
      img: 'max_charlie.jpg',
      busy: false
  },
  {
      id: 4,
      type: 'captain-dog',
      displayName: 'Rocky',
      powers: [1, 5],
      img: 'rocky.jpg',
      busy: false
  }
];

app.get('/heroes', (req, res) => {
  debug('Returning heroes list');
  console.log('heroes');
  res.send(heroes);
});
app.get('/powers', (req, res) => {
  debug('Returning powers list');
  res.send(powers);
});
app.post('/hero/**', (req, res) => {
  debug(`received post request with params ${req.params[0]}`);
  const heroId = parseInt(req.params[0],10);
  const foundHero = heroes.find(element => element.id === heroId);
  debug(`found hero: ${foundHero}`);
  if (foundHero) {
    for (let attribute in foundHero) {
      const attr = req.body[attribute];
      if (attr) {
        foundHero[attribute] = attr;
        debug(`Set ${attribute} to ${attr} in hero: ${heroId}`);
      }
    }
    res.status(202).header({Location: `http://localhost:${port}/hero/${foundHero.id}`})
    res.send('updated');
  }
  else {
    debug(`Hero not found.`);
    res.status(404).send();
  }
});
app.use('/img', express.static(path.join(path.dirname('./'), 'img')));
debug(`Heroes services listening on port ${port}`);
app.listen(port);