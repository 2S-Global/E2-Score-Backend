import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
import userrouter from './routes/userRoutes.js';
// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the back end of the E2 Score ');
});
app.use('/api/users', userrouter);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.green.bold);
});
