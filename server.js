const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConn')
const mongodb = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();




// Serve public HTML page
app.use(express.static('public'));

// API endpoints
app.use('/states', require('./routes/states'));

// Error handling middleware for 404 errors
app.use((req, res, next) => {
    res.status(404);
  
    if (req.accepts('html')) {
      res.sendFile(__dirname + '/public/404.html');
      return;
    }
  
    if (req.accepts('json')) {
      res.json({ error: '404 Not Found' });
      return;
    }
  
    res.type('txt').send('404 Not Found');
  });
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
