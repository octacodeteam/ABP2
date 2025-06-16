import { Router } from "express";
import { pool } from '../controllers/db';
import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

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

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro na query /api/queimadas:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

routes.get('/api/top-cidades-frp', async (req, res) => {
  const { estado, bioma, dataInicio, dataFim } = req.query;

  try {
    let query = `
      SELECT "Municipio", "Estado", AVG("FRP") as media_frp, AVG("DiaSemChuva") as media_dias
      FROM queimadas
      WHERE 1=1
    `;
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

    query += `
      GROUP BY "Municipio", "Estado"
      ORDER BY media_frp DESC
      LIMIT 10
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar top cidades por FRP:', err);
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

routes.get('/api/risco-de-fogo', async (req, res) => {
  const { estado } = req.query;
  try {
    const query = `
      SELECT * FROM "tabela_raster"
    `;
    const result = await pool.query(query, [estado]);
    res.json(result.rows.map((r: any) => r.Bioma));
  } catch (err) {
    console.error('Erro ao buscar biomas por estado:', err);
    res.status(500).json({ error: 'Erro ao buscar biomas' });
  }
});

// NOVA ROTA: Área Queimada (GeoJSON filtrado por mês e ano)
routes.get('/api/area-queimada', async (req, res) => {
  try {
    const { mesInicio, mesFim, estado, bioma } = req.query;

    if (!mesInicio || !mesFim) {
      return res.status(400).json({ error: 'mesInicio e mesFim são obrigatórios.' });
    }

    const startMonth = parseInt((mesInicio as string).split('-')[1]);
    const endMonth = parseInt((mesFim as string).split('-')[1]);

    const resultFeatures: any[] = [];

    // Carrega arquivos de área queimada de acordo com o intervalo de meses
    for (let mes = startMonth; mes <= endMonth; mes++) {
      const paddedMonth = mes.toString().padStart(2, '0');
      const filename = `area_queimada_2025_${paddedMonth}.geojson`;
      const filePath = path.join(__dirname, '../data', filename);

      if (!fs.existsSync(filePath)) continue;

      const rawData = fs.readFileSync(filePath, 'utf-8');
      const geojson = JSON.parse(rawData);

      resultFeatures.push(...geojson.features);
    }

    let featuresFiltradas = resultFeatures;

    // Carrega GeoJSON de estados se necessário
    if (estado && estado !== 'todos') {
      const estadoData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/estados.geojson'), 'utf-8'));
      const estadoFeature = estadoData.features.find(
        (f: any) => f.properties.Estado.toLowerCase() === (estado as string).toLowerCase()
      );

      if (estadoFeature) {
        featuresFiltradas = featuresFiltradas.filter((feature) =>
          turf.booleanIntersects(feature, estadoFeature)
        );
      }
    }

    // Carrega GeoJSON de biomas se necessário
    if (bioma && bioma !== 'todos') {
      const biomaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/biomas.geojson'), 'utf-8'));
      const biomaFeature = biomaData.features.find(
        (f: any) => f.properties.BIOMA.toLowerCase() === (bioma as string).toLowerCase()
      );

      if (biomaFeature) {
        featuresFiltradas = featuresFiltradas.filter((feature) =>
          turf.booleanIntersects(feature, biomaFeature)
        );
      }
    }

    const output = {
      type: 'FeatureCollection',
      features: featuresFiltradas
    };

    res.json(output);

  } catch (error) {
    console.error('Erro ao processar área queimada:', error);
    res.status(500).json({ error: 'Erro ao processar os dados de área queimada.' });
  }
})

export default routes;
