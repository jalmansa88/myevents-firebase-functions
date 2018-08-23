import * as functions from 'firebase-functions';

const randexp = require('randexp').randexp;
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));

app.get('/token', async (req, res) => {
  const token = randexp('^[a-zA-Z0-9]{6}$');

  const role = req.query.role;
  const eventid = req.query.eventid;

  const tokenEntity = {
    eventId: eventid,
    role: parseInt(role),
    value: token,
    timestamp: Date.now() / 1000
  };

  console.log(tokenEntity);

  try {
    if (role === 4) {
      delete tokenEntity.eventId;
    } else {
      const eventResult = await findEventById(eventid);

      if (!eventResult.exists) {
        throw 'event id ' + eventid + ' does not exist';
      }
      console.log('event data', eventResult.data());
    }

    await saveToken(tokenEntity);

    console.log('token ' + JSON.stringify(tokenEntity) + ' saved!');

    res.send({ token: token });
  } catch (err) {
    console.log(err);

    res.status(400).send(err);
  }
});

function findEventById(eventid: string) {
  return admin
    .firestore()
    .collection('events')
    .doc(eventid)
    .get();
}

function saveToken(tokenEntity) {
  return admin
    .firestore()
    .collection('tokens')
    .add(tokenEntity);
}

exports.api = functions.https.onRequest(app);
