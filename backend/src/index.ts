import express, {Request, Response} from 'express';
import cors from 'cors';
import { initDatabase } from './config/db';
import blockRouter from './routes/blocks'
import { errorHandler } from './middleware/errorHandler';
import { config } from 'dotenv'
import { METHODS } from 'http';
config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/api/blocks', blockRouter)

app.get('/health', (_req, res ) => {
    res.json({ status: 'ok' });
});

// Any route that calls next(err) will land here.
app.use(errorHandler)

app.listen(port, async () => {
    await initDatabase();
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
