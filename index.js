const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

const sqlite = require('sqlite3');
const DB_FILE_NAME = "./db/laptops.db";
const LAPTOP_TABLE = "laptop(model, price, cpu_id, ram_id, storage, battery)";
const CPU_TABLE = "cpu(cpu_id, score)";
const RAM_TABLE = "ram(ram_id, capacity, speed)";

const PORT_NUMBER = 3000;





app.get('/', function(req, res) {
    console.log("GET /");
    res.sendfile('index.html');
});

app.get('/laptop', function(req, res) {
    console.log("GET /laptop");
    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    // Retrieve database items
    laptopDB.all(`SELECT * FROM laptop`, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(rows);
        res.status(200).send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });
});

app.get('/cpu/:cpu_id', function(req, res) {
    let cpuID = req.params.cpu_id;
    console.log("GET /cpu/ " + cpuID);

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });


    laptopDB.all(`SELECT cpu_id, score FROM cpu WHERE cpu_id = ?`, [cpuID], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(rows);
        res.status(200).send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });
});

app.get('/ram', function(req, res) {
    console.log("GET /ram");
    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.all(`SELECT * FROM ram`, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(rows);
        res.status(200).send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

});

app.get('/ram/:ram_id', function(req, res) {
    let ramID = req.params.ram_id;
    console.log("GET /ram/ " + ramID); // log the get request

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => { // connect to database
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    // get all the columns from the ram table
    laptopDB.all(`SELECT ram_id, capacity, speed FROM ram WHERE ram_id = ?`, [ramID], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(rows);
        res.status(200).send(rows);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

});





app.put('/laptop', function(req, res, next) {
    // Get the request object
    console.log("PUT /laptop");
    console.log(req.body);
    let model = req.body.model;
    let price = req.body.price;
    let cpuID = req.body.cpu_id;
    let ramID = req.body.ram_id;
    let storage = req.body.storage;
    let battery = req.body.battery;
    
    dbInsert(LAPTOP_TABLE, [model, price, cpuID, ramID, storage, battery]);

    res.status(200).send(`Successfully added laptop model '${model}'.`);
});

app.put('/cpu', function(req, res) {
    // Get the request object
    console.log("PUT /cpu");
    console.log(req.body);
    let cpuID = req.body.cpu_id;
    let score = req.body.score;
    
    dbInsert(CPU_TABLE, [cpuID, score]);

    res.status(200).send(`Successfully added cpu '${cpuID}'.`);
});

app.put('/ram', function(req, res) {
    // Get ram info to put into database
    console.log("PUT /ram");
    console.log(req.body);
    let ramID = req.body.ram_id;
    let capacity = req.body.capacity;
    let speed = req.body.speed;
    
    dbInsert(RAM_TABLE, [ramID, capacity, speed]);

    res.status(200).send(`Successfully added ram '${ramID}'.`);
});





app.delete('/laptop/:model', function(req, res) {
    console.log("DELETE /laptop/[model]");
    let model = req.body.model;

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(`DELETE FROM laptop WHERE model = ?`, model, function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log(`Deleted model ${model} from laptop table.`);
    });

    laptopDB.close((err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        console.log("Closed the connection to laptop database.");
    });

    res.status(200).send(`Successfully deleted laptop model '${model}''.`);
});





app.listen(PORT_NUMBER, function() {
    console.log("Listening on port " + PORT_NUMBER + "!");
});





/**
 * This function will insert the given set of attributes into the given table.
 *
 * EXAMPLE:
 * dbInsert("laptop(model, cpu_id, ram_id, storage, battery)", [Dell, 'some_cpu', 'some_ram', 256, 6]);
 */
function dbInsert(tableName, values) {
    let sql = `INSERT INTO ${tableName} VALUES(`;
    for (let i = 0; i < values.length; ++i) {
        if (i != values.length - 1) {
            sql += '?,';
        }
        else {
            sql += '?)';
        }
    }

    let laptopDB = new sqlite.Database(DB_FILE_NAME, (err) => {
        if (err) {
            throw err.message;
        }
        console.log("Connected to laptop database.");
    });

    laptopDB.run(sql, values, function(err) {
        if (err) {
            throw err.message;
        }
        console.log(`${values} inserted with rowid ${this.lastID} into ${tableName}`);
    });

    laptopDB.close((err) => {
        if (err) {
            throw err.message;
        }
        console.log("Closed the connection to laptop database.");
    });
}
