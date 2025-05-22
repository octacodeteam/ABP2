import { Router } from "express";
import { pool } from '../controllers/db';

const routes = Router();

routes.get('/api/queimadas', async (req, res) => {
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

routes.get('/api/estados', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT "Estado" FROM queimadas ORDER BY "Estado"');
    res.json(result.rows.map((r: any) => r.Estado));
  } catch (err) {
    console.error('Erro ao buscar estados:', err);
    res.status(500).json({ error: 'Erro ao buscar estados' });
  }
});

export default routes;