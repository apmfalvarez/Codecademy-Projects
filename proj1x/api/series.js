const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');

seriesRouter.param('seriesId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Series where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (row){
                req.series = row;
                next();
            }else{
                res.status(404).send();
            }
            
        }
    );
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM Series`,
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({series: rows});
        }
    );
});

seriesRouter.get('/:seriesId', (req, res, next)=>{
    res.status(200).send({series:req.series});
});

seriesRouter.post('/', (req, res, next)=>{
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.status(400).send()
    }
    db.run(`INSERT INTO Series
        (name, description)
        VALUES ($name, $description)`,
    {
        $name: series.name,
        $description: series.description
    },
    function(error){
        if (error){
            next(error);
        }
        db.get(
            `SELECT * FROM Series WHERE id=$id`, 
            {
                $id: this.lastID
            },
            (error, row)=>{
                if (error){
                    next(error);
                }
                res.status(201).send({series: row});
            }
        )
    }
    )
});

seriesRouter.put('/:seriesId', (req, res, next)=>{
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.status(400).send()
    }
    db.run(
        `UPDATE Series
            SET name = $name,
            description = $description
            WHERE id = $id`,
        {
            $id: req.params.seriesId,
            $name: req.body.series.name,
            $description: req.body.series.description
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Series WHERE id=${req.params.seriesId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({series: row});
                }
            )
        }
    )
});

seriesRouter.delete('/:seriesId', (req, res, next)=>{
    db.serialize(()=>{
        db.get(
            `SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`,
            (error, row)=>{
                if(error){
                    next(error);
                }else if (row){
                    return res.status(400).send();
                }
            }
        );
        db.run(
            `DELETE * FROM Series WHERE id = ${req.params.seriesId}`,
            (error)=>{
                if (error){
                    next(error);
                }
                res.status(204).send();
            }
        )
    });
});




module.exports = seriesRouter;