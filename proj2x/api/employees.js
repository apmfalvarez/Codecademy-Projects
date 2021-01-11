const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require(`./timesheets`);

employeesRouter.param('employeeId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Employee where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (row){
                req.employee = row;
                next();
            }else{
                res.status(404).send();
            }
            
        }
    );
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM Employee WHERE is_current_employee = 1`,
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({employees: rows});
        }
    );
});

employeesRouter.get('/:employeeId', (req, res, next)=>{
    res.status(200).send({employee:req.employee});
});

employeesRouter.post('/', (req, res, next)=>{
    const employee = req.body.employee;
    if (!employee.name || !employee.position || !employee.wage){
        return res.status(400).send()
    }
    db.run(`INSERT INTO Employee
        (name, position, wage, is_current_employee)
        VALUES ($name, $position, $wage, $is_current_employee)`,
    {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $is_current_employee: employee.isCurrentEmployee || 1
    },
    function(error){
        if (error){
            next(error);
        }
        db.get(
            `SELECT * FROM Employee WHERE id=$id`, 
            {
                $id: this.lastID
            },
            (error, row)=>{
                if (error){
                    next(error);
                }
                res.status(201).send({employee: row});
            }
        )
    }
    )
});

employeesRouter.put('/:employeeId', (req, res, next)=>{
    const employee = req.body.employee;
    if (!employee.name || !employee.position || !employee.wage){
        return res.status(400).send()
    }
    db.run(
        `UPDATE Employee
            SET name = $name,
            position = $position,
            wage = $wage,
            is_current_employee = $is_current_employee
            WHERE id = $id`,
        {
            $id: req.params.employeeId,
            $name: employee.name,
            $position: employee.position,
            $wage: employee.wage,
            $is_current_employee: employee.isCurrentEmployee? 1: 0
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Employee WHERE id=${req.params.employeeId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({employee: row});
                }
            )
        }
    )
});

employeesRouter.delete('/:employeeId', (req, res, next)=>{
    db.run(
        `UPDATE Employee
            SET is_current_employee = 0
            WHERE id = ${req.params.employeeId}`,
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Employee WHERE id=${req.params.employeeId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({employee: row});
                }
            )
        }
    )
});




module.exports = employeesRouter;