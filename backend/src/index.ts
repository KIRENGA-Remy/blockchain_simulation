import express, {Request, Response} from 'express';
import cors from 'cors';
import { config } from 'dotenv'
config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Blockchain Simulation!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
