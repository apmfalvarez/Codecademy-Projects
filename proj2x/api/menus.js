const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require(`./menuitems`);

menusRouter.param('menuId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Menu where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (row){
                req.menu = row;
                next();
            }else{
                res.status(404).send();
            }
            
        }
    );
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get(`/`, (req, res, next)=>{
    db.all(
        `SELECT * FROM Menu`,
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({menus: rows});
        }
    );
});

menusRouter.post('/', (req, res, next)=>{
    const menu = req.body.menu;
    if (!menu.title){
        return res.status(400).send()
    }
    db.run(
        `INSERT INTO Menu
            (title) VALUES
            ($title)`,
        {
            $title: menu.title
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Menu WHERE id=$id`, 
                {
                    $id: this.lastID
                },
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(201).send({menu: row});
                }
            )
        }
    );
});

menusRouter.get('/:menuId', (req, res, next)=>{
    res.status(200).send({menu:req.menu});
});

menusRouter.put('/:menuId', (req, res, next)=>{
    const menu = req.body.menu;
    if (!menu.title){
        return res.status(400).send()
    }
    db.run(
        `UPDATE Menu
            SET title = $title`,
        {
            $title: menu.title
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Menu WHERE id=$id`, 
                {
                    $id: req.params.menuId
                },
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({menu: row});
                }
            )
        }
    );
});

menusRouter.delete('/:menuId', (req, res, next)=>{
    const menu = req.menu;
    if (!menu.title){
        return res.status(400).send()
    }
    db.get(
        `SELECT * FROM MenuItem
            WHERE menu_id = $menu_id`,
            {
                $menu_id: req.params.menuId
            },
            (error, row)=>{
                if (error){
                    next(error);
                }else if(row){
                    res.status(400).send();
                }else{
                    db.run(
                        `DELETE FROM Menu
                            WHERE id = $menu_id`,
                            {
                                $menu_id: req.params.menuId
                            },
                        function(error){
                            if (error){
                                next(error);
                            }
                            res.status(204).send();
                            
                        }
                    );
                }
            }
    );
});

module.exports = menusRouter;