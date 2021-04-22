const express = require('express');
const mysql = require('mysql2');

//require inputCheck.js which will give us the
//function used in the validation for the 
//create candidate POST <inputCheck()>, which will return an error
// if all properties are not present
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '?G0LdF1sHy?',
    database: 'election'
  },
  console.log('Connected to the database!')
);

// GET all candidates
app.get('/api/candidates', (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
             AS party_name 
             FROM candidates 
             LEFT JOIN parties 
             ON candidates.party_id = parties.id`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(
      {
        message: 'Success!',
        data: rows
      }
    );
  });
});
// db.query(`SELECT * FROM candidates`, (err, rows) => {
//   console.log(rows);
// });

// GET a single candidate express GET by id from api endpoint
app.get('/api/candidate/:id', (req, res) => {
  //mysql request
  const sql = `SELECT candidates.*, parties.name 
             AS party_name 
             FROM candidates 
             LEFT JOIN parties 
             ON candidates.party_id = parties.id 
             WHERE candidates.id = ?`;
  //pass the id requests(req) from the url into a varaiable
  const params = [req.params.id];
  //query(the sql variable passed as argument in db.query) 
  //the mysql database(db), for the id of the table row(params)
  //and json return response of table rows(rows) as objects,
  //or if error(err), send error message
  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Success!',
      data: row
    });
  });
});
// db.query(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(row);
// });

// Delete a candidate
//similar to GET single candidate, but we are selecting a single
//candidate to remove them from the table in sql 
app.delete('/api/candidate/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.affectedRows) {
      res.json({
        message: 'Sorry, this candidate was not found.'
      });
    } else {
      res.json({
        message: 'Successfully deleted.',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});
// db.query(`DELETE FROM candidates WHERE id = ?`, 1, (err, result) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result);
// });

// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
  //validate newly created candidate for all properties required (firstname, lastname, industryconnected)
  const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  //create candidate
  //sql command
  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
  VALUES (?,?,?)`;
  //params passed in from the post api end point {body} must be passed as an array
  const params = [body.first_name, body.last_name, body.industry_connected];
  //add candidate, confirm no errors, and return the new candidate entered
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Successfully added candidate!',
      data: body
    });
  });

});
// const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) 
//               VALUES (?,?,?,?)`;
// const params = [1, 'Ronald', 'Firbank', 1];

// db.query(sql, params, (err, result) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result);
// });

//get all parties table data
app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Success!',
      data: rows
    });
  });
});

//get single party
app.get('/api/party/:id', (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Success!',
      data: row
    });
  });
});

//delete a party
app.delete('/api/party/:id', (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: res.message });
      // checks if anything was deleted
    } else if (!result.affectedRows) {
      res.json({
        message: 'Party not found'
      });
    } else {
      res.json({
        message: 'Deleted successfully.',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});

// Update a candidate's party
app.put('/api/candidate/:id', (req, res) => {
  const errors = inputCheck(req.body, 'party_id');

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  const sql = `UPDATE candidates SET party_id = ? 
               WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      // check if a record was found
    } else if (!result.affectedRows) {
      res.json({
        message: 'Candidate not found'
      });
    } else {
      res.json({
        message: 'success',
        data: req.body,
        changes: result.affectedRows
      });
    }
  });
});

// Default response for any other request (Not Found) (aka 'Catchall')
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});