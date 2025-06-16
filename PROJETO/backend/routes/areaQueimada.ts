import { Router } from "express";
import fs from "fs";
import path from "path";

const areaQueimadaRoutes = Router();

areaQueimadaRoutes.get('/api/area-queimada', (req, res) => {
  const { mesAno } = req.query;
  if (!mesAno || typeof mesAno !== 'string') {
    return res.status(400).json({ error: "Parâmetro 'mesAno' obrigatório no formato yyyy-MM" });
  }

  const filePath = path.resolve(__dirname, '../data/area_queimada_2025_01_a_04.geojson');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo GeoJSON:', err);
      return res.status(500).json({ error: 'Erro ao ler dados da área queimada' });
    }

    try {
      const geojson = JSON.parse(data);
      const filteredFeatures = geojson.features.filter((feature: any) => {
        const dataStr = feature.properties.data; // Exemplo: "20250101"
        return dataStr.startsWith(mesAno.replace('-', ''));
      });

      res.json({
        type: "FeatureCollection",
        features: filteredFeatures,
      });
    } catch (parseError) {
      console.error('Erro ao parsear GeoJSON:', parseError);
      res.status(500).json({ error: 'Erro ao processar dados da área queimada' });
    }
  });
});

export default areaQueimadaRoutes;
