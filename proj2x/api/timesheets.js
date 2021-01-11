const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, id)=>{
    db.get(
        "SELECT * FROM Timesheet where id = $id",
        { $id: id},
        (error, row)=>{
            if (error){
                next(error);
            }else if (!row){
                res.status(404).send();
            }else{
                req.timesheet = row;
                next();
            }
            
        }
    );
});

timesheetsRouter.get('/', (req, res, next)=>{
    db.all(
        `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employee_id`,
        {
            $employee_id: req.params.employeeId
        },
        (error, rows)=>{
            if (error){
                next(error);
            }
            res.status(200).send({timesheets: rows});
        }
    );
});

timesheetsRouter.post('/', (req, res, next)=>{
    const timesheet = req.body.timesheet;
    if (!timesheet.hours || !timesheet.rate || !timesheet.date){
        return res.status(400).send()
    }
    
    db.run(`INSERT INTO Timesheet
            (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employee_id)`,
        {
            $hours: timesheet.hours,
            $rate: timesheet.rate,
            $date: timesheet.date,
            $employee_id: req.params.employeeId
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Timesheet WHERE id=${this.lastID}`, 
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(201).send({timesheet: row});
                }
            )
        }
    );
});

timesheetsRouter.put(`/:timesheetId`, (req, res, next)=>{
    const timesheet = req.body.timesheet;
    if (!timesheet.hours || !timesheet.rate || !timesheet.date){
        return res.status(400).send()
    }
    db.run(
        `UPDATE Timesheet
            SET hours = $hours,
            rate = $rate,
            date = $date,
            employee_id = $employee_id
            WHERE id = $id`,
        {
            $hours: timesheet.hours,
            $rate: timesheet.rate,
            $date: timesheet.date,
            $employee_id: req.params.employeeId,
            $id: req.params.timesheetId
        },
        function(error){
            if (error){
                next(error);
            }
            db.get(
                `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
                (error, row)=>{
                    if (error){
                        next(error);
                    }
                    res.status(200).send({timesheet: row});
                }
            )
        }
    );
});

timesheetsRouter.delete(`/:timesheetId`, (req, res, next)=>{
    db.run(
        `DELETE FROM Timesheet
            WHERE id = ${req.params.timesheetId}`,
        (error)=>{
            if (error){
                next(error);
            }
            res.status(204).send();
        }
    );
});





module.exports = timesheetsRouter;