import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';  
import path from 'path';  
import { PORT, mongoDBURL } from "./config.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import './src/postSchedulerJob.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware untuk parsing req body
app.use(express.json());


// Middleware untuk handling CORS POLICY
app.use(cors());

// Middleware untuk serving static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  return res.status(200).send("Hello World");
});

// Route post
app.use('/post', postRoutes);

// Route user
app.use('/user', userRoutes);

// Route Notif
app.use('/notifications', notificationRoutes);

app.use('/uploads/posts', express.static(path.join(__dirname, 'uploads', 'posts')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads', 'profiles')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log(`Received ${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  res.status(500).send('Something broke!');
});

mongoose
  .connect(mongoDBURL, {})
  .then(() => {
    console.log("App connect");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });