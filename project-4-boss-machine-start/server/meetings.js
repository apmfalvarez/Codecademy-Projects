const meetingsRouter = require('express').Router();

module.exports = meetingsRouter;

const e = require('express');
const {
    createMeeting,
    getAllFromDatabase,
    getFromDatabaseById,
    addToDatabase,
    updateInstanceInDatabase,
    deleteFromDatabasebyId,
    deleteAllFromDatabase,
  } = require('./db');

meetingsRouter.get('/', (req, res, next)=>{
    res.send(getAllFromDatabase('meetings'));
});

meetingsRouter.post('/', (req, res, next)=>{
    const newMeeting = addToDatabase('meetings', req.body);
    res.status(201).send(newMeeting);
});

meetingsRouter.delete('/', (req, res, next)=>{
    deleteAllFromDatabase('meetings');
    res.status(204).send();
})
