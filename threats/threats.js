import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import request from 'request';
import Debug from 'debug';

const debug = Debug('http-server-threats');
const port = process.argv.slice(2)[0];
const app = express();
app.use(bodyParser.json());

const heroesService = 'http://localhost:8081';

const threats = [
  {
      id: 1,
      displayName: 'Pisa tower is about to collapse.',
      necessaryPowers: ['flying'],
      img: 'tower.jpg',
      assignedHero: 0
  },
  {
      id: 2,
      displayName: 'Engineer is going to clean up server-room.',
      necessaryPowers: ['teleporting'],
      img: 'mess.jpg',
      assignedHero: 0
  },
  {
      id: 3,
      displayName: 'John will not understand the joke',
      necessaryPowers: ['clairvoyance'],
      img: 'joke.jpg',
      assignedHero: 0
  }
];

app.get('/threats', (req, res) => {
  debug('Returning threats list');
  res.send(threats);
});

app.post('/assignment', (req, res) => {
  request.post(
    {
      headers: {'content-type': 'application/json'},
      url: `${heroesService}/hero/${req.body.heroId}`,
      body: `{"busy": true}`
    }, 
    (err, heroResponse, body)=> {
      if (!err) {
        const threatId = parseInt(req.body.threatId);
        const threat = threats.find(el => el.id ===threatId);
        threat.assignedHero = req.body.heroId;
        res.status(202).send(threat);
      } else {
        res.status(404).send({problem: `Hero service responded with issue ${err}`});
      }
    });
});

app.use('/img', express.static(path.join(path.dirname('./'), 'img')));
debug(`threats service started and listening on port ${port}`);
app.listen(port);