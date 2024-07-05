const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');

const PORT = process.env.PORT || 5000;
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', messageRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
