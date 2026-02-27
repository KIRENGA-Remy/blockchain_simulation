import express, {Request, Response} from 'express';
import cors from 'cors';
import { initDatabase } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { config } from 'dotenv'
config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res ) => {
    res.json({ status: 'ok' });
});

// Any route that calls next(err) will land here.
app.use(errorHandler)

app.listen(port, async () => {
    await initDatabase();
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
