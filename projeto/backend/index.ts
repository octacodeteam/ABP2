import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rotas from './routes/rotas';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend rodando na porta http://localhost:${process.env.PORT}`);
});

app.use(rotas)