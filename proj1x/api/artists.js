const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM Artist WHERE is_currently_employed = 1`,
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({artists: rows});
        }
    );
});

artistsRouter.param('artistId', (req, res, next, artistId)=>{
    db.get(
        "SELECT * FROM Artist where id = $id",
        { $id: artistId},
        (error, row)=>{
            if (error){
                next(error);
            }else if (row){
                req.artist = row;
                next();
            }else{
                res.status(404).send();
            }
            
        }
    );
});

artistsRouter.get('/:artistId', (req, res, next)=>{
    res.status(200).send({artist:req.artist});
});

artistsRouter.post('/', (req, res, next)=>{
    const artist = req.body.artist;
    if (!artist.name || !artist.biography || !artist.dateOfBirth){
        return res.status(400).send()
    }
    if(!artist.isCurrentlyEmployed){
        artist.isCurrentlyEmployed = 1;
    }
    db.run(`INSERT INTO Artist
        (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $date_of_birth, $biography, $is_currently_employed)`,
    {
        $name: artist.name,
        $date_of_birth: artist.dateOfBirth,
        $biography: artist.biography,
        $is_currently_employed: artist.isCurrentlyEmployed
    },
    function(error){
        if (error){
            next(error);
        }
        db.get(
            `SELECT * FROM Artist WHERE id=$id`, 
            {
                $id: this.lastID
            },
            (error, row)=>{
                if (error){
                    next(error);
                }
                res.status(201).send({artist: row});
            }
        )
    }
    )
});

artistsRouter.put('/:artistId', (req, res, next)=>{
    const artist = req.body.artist;
    if (!artist.name || !artist.biography || !artist.dateOfBirth){
        return res.status(400).send()
    }
    db.run(
        `UPDATE Artist
            SET name = $name,
            date_of_birth = $date_of_birth,
            biography = $biography,
            is_currently_employed = $is_currently_employed
            WHERE id = $id`,
        {
            $id: req.params.artistId,
            $name: req.body.artist.name,
            $date_of_birth: req.body.artist.dateOfBirth,
            $biography: req.body.artist.biography,
            $is_currently_employed: req.body.artist.isCurrentlyEmployed
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Artist WHERE id=${req.params.artistId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({artist: row});
                }
            )
        }
    )
});

artistsRouter.delete('/:artistId', (req, res, next)=>{
    db.run(
        `UPDATE Artist
            SET is_currently_employed = 0
            WHERE id = ${req.params.artistId}`,
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Artist WHERE id=${req.params.artistId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({artist: row});
                }
            )
        }
    )
})
module.exports = artistsRouter;