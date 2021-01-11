const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Issue where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (!row){
                res.status(404).send();
            }else{
                req.issue = row;
                next();
            }
            
        }
    );
});

issuesRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM Issue WHERE Issue.series_id = $series_id`,
        {
            $series_id: req.params.seriesId
        },
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).json({issues: rows});
        }
    );
});

issuesRouter.post('/', (req, res, next)=>{
    const issue = req.body.issue;
    if (!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId){
        return res.status(400).send()
    }
    db.serialize(()=>{
        db.get(
            `SELECT * FROM Artist WHERE id = ${issue.artistId}`,
            (error,row)=>{
                if (error){
                    next(error);
                }else if (!row){
                    return res.status(400).send();
                }
            }
        )
        db.run(`INSERT INTO Issue
            (name, issue_number, publication_date, artist_id, series_id)
            VALUES ($name, $issue_number, $publication_date, $artist_id, $series_id)`,
        {
            $name: issue.name,
            $issue_number: issue.issueNumber,
            $publication_date: issue.publicationDate,
            $artist_id: issue.artistId,
            $series_id: req.params.seriesId
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Issue WHERE id=${this.lastID}`, 
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(201).send({issue: row});
                }
            )
        }
        )
    });
});
issuesRouter.put('/:issueId', (req, res, next)=>{
    const issue = req.body.issue;
    if (!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId){
        return res.status(400).send()
    }
    db.serialize(()=>{
        db.get(
            `SELECT * FROM Artist WHERE id = ${issue.artistId}`,
            (error,row)=>{
                if (error){
                    next(error);
                }else if (!row){
                    return res.status(400).send();
                }
            }
        )
        db.run(
            `UPDATE Issue
                SET name = $name,
                issue_number = $issue_number,
                publication_date = $publication_date,
                artist_id = $artist_id,
                series_id = $series_id
                WHERE id = $id`,
            {
                $id: req.params.issueId,
                $name: issue.name,
                $issue_number: issue.issueNumber,
                $publication_date: issue.publicationDate,
                $artist_id: issue.artistId,
                $series_id: req.params.seriesId
            },
            function(error){
                if (error){
                    next(error);
                }
                db.get(
                    `SELECT * FROM Issue WHERE id=${req.params.issueId}`,
                    (error, row)=>{
                        if (error){
                            next(error);
                        }
                        res.status(200).send({issue: row});
                    }
                )
            }
        )
    });
});

issuesRouter.delete('/:issueId', (req, res, next)=>{
    db.run(
        `DELETE FROM Issue WHERE id = ${req.params.issueId}`,
        (error)=>{
            if(error){
                next(error);
            }
            res.status(204).send();
        }
    )
});


module.exports = issuesRouter;