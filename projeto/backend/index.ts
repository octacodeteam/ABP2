import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/queimadas', async (req, res) => {
  const { estado, dataInicio, dataFim } = req.query;
  try {
    let query = 'SELECT * FROM queimadas WHERE "DataHora" BETWEEN $1 AND $2';
    let params = [dataInicio, dataFim];
    
    if (estado && estado !== 'todos') {
      query = 'SELECT * FROM queimadas WHERE "Estado" = $1 AND "DataHora" BETWEEN $2 AND $3';
      params = [estado, dataInicio, dataFim];
    }

    console.log('Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro na query /api/queimadas:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.get('/api/estados', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT "Estado" FROM queimadas ORDER BY "Estado"');
    res.json(result.rows.map((r: any) => r.Estado));
  } catch (err) {
    console.error('Erro ao buscar estados:', err);
    res.status(500).json({ error: 'Erro ao buscar estados' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend rodando na porta ${process.env.PORT}`);
});