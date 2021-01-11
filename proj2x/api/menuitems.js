const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Menu where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (!row){
                res.status(404).send();
            }else{
                req.menuItem = row;
                next();
            }
            
        }
    );
})

menuItemsRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menu_id`,
        {
            $menu_id: req.params.menuId
        },
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({menuItems: rows});
        }
    );
});

menuItemsRouter.post('/', (req, res, next)=>{
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.inventory || !menuItem.price){
        return res.status(400).send()
    }
    db.run(`INSERT INTO MenuItem
            (name, description, inventory, price, menu_id)
            VALUES ($name, $description, $inventory, $price, $menu_id)`,
        {
            $name: menuItem.name,
            $description: menuItem.description,
            $inventory: menuItem.inventory,
            $price: menuItem.price,
            $menu_id: req.params.menuId
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM MenuItem WHERE id=${this.lastID}`, 
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(201).send({menuItem: row});
                }
            )
        }
    );
});

menuItemsRouter.put('/:menuItemId', (req, res, next)=>{
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.inventory || !menuItem.price){
        return res.status(400).send()
    }
    db.run(`UPDATE MenuItem
                SET name = $name,
                description = $description,
                inventory = $inventory,
                price = $price,
                menu_id = $menu_id
                WHERE id = $id`,
        {
            $name: menuItem.name,
            $description: menuItem.description,
            $inventory: menuItem.inventory,
            $price: menuItem.price,
            $menu_id: req.params.menuId,
            $id: req.params.menuItemId
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM MenuItem WHERE id=${req.params.menuItemId}`, 
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({menuItem: row});
                }
            )
        }
    );
});

menuItemsRouter.delete(`/:menuItemId`, (req, res, next)=>{
    db.run(
        `DELETE FROM MenuItem
            WHERE id = ${req.params.menuItemId}`,
        (error)=>{
            if (error){
                next(error);
            }
            res.status(204).send();
        }
    );
});




module.exports = menuItemsRouter;