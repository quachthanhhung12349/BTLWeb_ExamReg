require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const studentsRouter = require('./routes/students');
// const subjectsRouter = require('./routes/subjects');
// const examRoomsRouter = require('./routes/examRooms');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/students', studentsRouter);
// app.use('/api/subjects', subjectsRouter);
// app.use('/api/exam-rooms', examRoomsRouter);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });