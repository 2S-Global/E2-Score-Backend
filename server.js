import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import db from './config/db.js';
db();

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
import AuthRouter from './routes/AuthRoutes.js';
// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the back end of the E2 Score ');
});
app.use('/api/auth', AuthRouter);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
