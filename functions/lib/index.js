"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const randexp = require('randexp').randexp;
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');
const app = express();
app.get('/token', (req, res) => {
    const token = randexp('^[a-zA-Z0-9]{6}$');
    const eventid = req.query.eventid;
    const role = req.query.role;
    const tokenEntity = {
        eventId: eventid,
        role: role,
        value: token,
        timestamp: Date.now() / 1000
    };
    admin.firestore().collection('events').doc(eventid).get()
        .then((result) => {
        if (!result.exists) {
            throw ('event id ' + eventid + ' does not exist');
        }
        return admin.firestore().collection('tokens').add(tokenEntity);
    })
        .then((result) => {
        console.log('token ' + JSON.stringify(tokenEntity) + ' saved!');
        res.send(token);
    })
        .catch((err) => {
        console.error(err);
        res.status(400);
        res.send(err);
    });
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map