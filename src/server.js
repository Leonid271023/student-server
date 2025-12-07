import express from 'express';
import dotenv from 'dotenv';
import studentRouter from './routes/studentRoutes.js';


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRouter)

app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found')
});



app.listen(port, () => console.log(`Server started on port ${port}. Press CTRL+C to reload`));