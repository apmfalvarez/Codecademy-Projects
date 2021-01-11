const ideasRouter = require('express').Router();

module.exports = ideasRouter;

const {
    createMeeting,
    getAllFromDatabase,
    getFromDatabaseById,
    addToDatabase,
    updateInstanceInDatabase,
    deleteFromDatabasebyId,
    deleteAllFromDatabase,
  } = require('./db');

ideasRouter.param('ideaId', (req, res, next, id)=>{
    const idea = getFromDatabaseById('ideas', id);
    if (idea){
        req.idea = idea;
        next();
    }else{
        res.status(404).send();
    }
});

ideasRouter.get('/', (req, res, next)=>{
    res.send(getAllFromDatabase('ideas'));
});

ideasRouter.post('/', (req, res, next)=>{
    const newIdea = addToDatabase('ideas', req.body);
    res.status(201).send(newIdea);
});

ideasRouter.get('/:ideaId', (req, res, next)=>{
    res.send(req.idea);
});

ideasRouter.put('/:ideaId', (req, res, next)=>{
    const updatedIdea = updateInstanceInDatabase('ideas', req.body);
    res.send(updatedIdea);
});

ideasRouter.delete('/:ideaId', (req, res, next)=>{
    const ideaToDel = deleteFromDatabaseById('ideas', req.params.ideaId);
    if (ideaToDel){
        res.status(204).send();
    }else{
        res.status(404).send();
    }
});