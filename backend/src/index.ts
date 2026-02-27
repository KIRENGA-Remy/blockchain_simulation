import express, {Request, Response} from 'express';
import cors from 'cors';
import { initDatabase } from './config/db';
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

app.listen(port, async () => {
    await initDatabase();
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
