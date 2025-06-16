import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rotas from './routes/rotas';
import areaQueimadaRoutes from './routes/areaQueimada';
import path from 'path'; // Adicione isso

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Sirva arquivos estáticos da pasta 'public'
app.use('/static', express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend rodando na porta http://localhost:${process.env.PORT}`);
});

app.use(rotas);
app.use(areaQueimadaRoutes);