require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const busRoutes = require('./routes/busRoutes');

const app = express();

// Connect DB
connectDB();

app.use(cors());
app.use(express.json());

//vercel

app.get("/",(req,res)=> {
  res.json("hello");
})

// API routes
app.use('/api/buses', busRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});