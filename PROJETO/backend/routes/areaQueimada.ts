import { Router } from "express";
import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";

const areaQueimadaRoutes = Router();

areaQueimadaRoutes.get('/api/area-queimada', (req, res) => {
  const { mesInicio, mesFim, estado, bioma } = req.query;

  if (!mesInicio || !mesFim || typeof mesInicio !== 'string' || typeof mesFim !== 'string') {
    return res.status(400).json({ error: "Parâmetros 'mesInicio' e 'mesFim' são obrigatórios no formato yyyy-MM" });
  }

  try {
    const inicio = parseInt(mesInicio.split('-')[1]); // mês
    const fim = parseInt(mesFim.split('-')[1]);       // mês
    const ano = mesInicio.split('-')[0];              // assume mesmo ano

    const featuresTotais: any[] = [];

    // Carrega todos os arquivos de acordo com o intervalo
    for (let mes = inicio; mes <= fim; mes++) {
      const paddedMonth = mes.toString().padStart(2, '0');
      const filename = `area_queimada_${ano}_${paddedMonth}.geojson`;
      const filePath = path.resolve(__dirname, '../data/', filename);

      if (!fs.existsSync(filePath)) continue;

      const data = fs.readFileSync(filePath, 'utf-8');
      const geojson = JSON.parse(data);
      featuresTotais.push(...geojson.features);
    }

    // Filtro por estado (usando interseção com GeoJSON de estados)
    let featuresFiltradas = featuresTotais;

    if (estado && estado !== 'todos') {
      const estadosPath = path.resolve(__dirname, '../data/estados.geojson');
      const estadosData = JSON.parse(fs.readFileSync(estadosPath, 'utf-8'));
      const estadoFeature = estadosData.features.find(
        (f: any) => f.properties.Estado.toLowerCase() === (estado as string).toLowerCase()
      );

      if (estadoFeature) {
        featuresFiltradas = featuresFiltradas.filter((feature) =>
          turf.booleanIntersects(feature, estadoFeature)
        );
      }
    }

    // Filtro por bioma (interseção com GeoJSON de biomas)
    if (bioma && bioma !== 'todos') {
      const biomasPath = path.resolve(__dirname, '../data/biomas.geojson');
      const biomasData = JSON.parse(fs.readFileSync(biomasPath, 'utf-8'));
      const biomaFeature = biomasData.features.find(
        (f: any) => f.properties.BIOMA.toLowerCase() === (bioma as string).toLowerCase()
      );

      if (biomaFeature) {
        featuresFiltradas = featuresFiltradas.filter((feature) =>
          turf.booleanIntersects(feature, biomaFeature)
        );
      }
    }

    res.json({
      type: "FeatureCollection",
      features: featuresFiltradas,
    });

  } catch (error) {
    console.error('Erro ao processar dados da área queimada:', error);
    res.status(500).json({ error: 'Erro interno ao processar os dados' });
  }
});

export default areaQueimadaRoutes;
