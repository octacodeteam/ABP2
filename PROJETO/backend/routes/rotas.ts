import { Router } from "express";
import { pool } from '../controllers/db';

const routes = Router();

routes.get('/api/queimadas', async (req, res) => {
  const { estado, bioma, dataInicio, dataFim } = req.query;

  try {
    let query = 'SELECT * FROM queimadas WHERE 1=1';
    const params: any[] = [];

    if (estado && estado !== 'todos') {
      params.push(estado);
      query += ` AND "Estado" = $${params.length}`;
    }

    if (bioma && bioma !== 'todos') {
      params.push(bioma);
      query += ` AND "Bioma" = $${params.length}`;
    }

    if (dataInicio && dataFim) {
      params.push(dataInicio, dataFim);
      query += ` AND "DataHora" BETWEEN $${params.length - 1} AND $${params.length}`;
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

routes.get('/api/biomas', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT "Bioma" FROM queimadas ORDER BY "Bioma"');
    res.json(result.rows.map((r: any) => r.Bioma));
  } catch (err) {
    console.error('Erro ao buscar biomas:', err);
    res.status(500).json({ error: 'Erro ao buscar biomas' });
  }
});

routes.get('/api/estados-por-bioma', async (req, res) => {
  const { bioma } = req.query;
  try {
    const query = `
      SELECT DISTINCT "Estado"
      FROM queimadas
      WHERE "Bioma" = $1
      ORDER BY "Estado"
    `;
    const result = await pool.query(query, [bioma]);
    res.json(result.rows.map((r: any) => r.Estado));
  } catch (err) {
    console.error('Erro ao buscar estados por bioma:', err);
    res.status(500).json({ error: 'Erro ao buscar estados' });
  }
});

routes.get('/api/biomas-por-estado', async (req, res) => {
  const { estado } = req.query;
  try {
    const query = `
      SELECT DISTINCT "Bioma"
      FROM queimadas
      WHERE "Estado" = $1
      ORDER BY "Bioma"
    `;
    const result = await pool.query(query, [estado]);
    res.json(result.rows.map((r: any) => r.Bioma));
  } catch (err) {
    console.error('Erro ao buscar biomas por estado:', err);
    res.status(500).json({ error: 'Erro ao buscar biomas' });
  }
});

export default routes;
