const express = require('express');
const db = require('./db/connection');
const apiRoutes = require('./routes/apiRoutes');

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

app.use('/api', apiRoutes);

// Default response for any other request (Not Found) (aka 'Catchall')
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});