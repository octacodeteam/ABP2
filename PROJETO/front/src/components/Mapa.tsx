import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import './style/Mapa.css';
import 'leaflet-geotiff';
import 'plotty';
import { ImageOverlay } from 'react-leaflet';

// To avoid TypeScript errors, declare the global variable for leaflet-geotiff
declare global {
  interface Window {
    riscoLayer?: any;
    L: any;
  }
}

export default function MapPage() {
  const bounds = [
    [-28.87, -74.02], // [sul, oeste] — ajuste com base na área da imagem
    [5.27, -33.75],   // [norte, leste]
  ];

  return (
    <MapContainer center={[-15, -54]} zoom={4} style={{ height: "100vh" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ImageOverlay
        url="/risco_fogo_brasil.png"
        bounds={bounds}
        opacity={0.6}
      />
    </MapContainer>
  );
}

function RiscoFogoRaster({ url }: { url: string }) {
  const map = useMap();

  useEffect(() => {
    if (!url || !map) return;

    // Remove camadas antigas se necessário
    if (window.riscoLayer) {
      map.removeLayer(window.riscoLayer);
      window.riscoLayer = null;
    }

    // Adiciona o raster
    const PlottyRenderer = window.L.LeafletGeotiff?.Plotty || window.L.LeafletGeotiff?.plotty;
    const raster = new window.L.LeafletGeotiff(url, {
      renderer: new PlottyRenderer({
        displayMin: 0,
        displayMax: 255,
        colorScale: 'viridis',
      }),
    });
    raster.addTo(map);
    window.riscoLayer = raster;

    return () => {
      if (window.riscoLayer) {
        map.removeLayer(window.riscoLayer);
        window.riscoLayer = null;
      }
    };
  }, [url, map]);

  return null;
}


const FrpLegend = () => {
  const legendItems = [
    { color: "#F2B705", label: "0 - 199" },
    { color: "#D97904", label: "200 - 399" },
    { color: "#BF2604", label: "400 - 599" },
    { color: "#730202", label: "600 - 8.000" }
  ];

  return (
    <div className="frp-legend">
      <h4>Intensidade FRP</h4>
      {legendItems.map((item, index) => (
        <div key={index} className="frp-legend-item">
          <div className="frp-dot" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

function AjustaVisualizacao({
  geoJsonEstado,
  geoJsonBioma,
  geoJsonBrasil
}: {
  geoJsonEstado: any,
  geoJsonBioma: any,
  geoJsonBrasil: any
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (geoJsonBrasil === null) return;

    const hasValidFeatures = (geoJson: any) => {
      return geoJson && Array.isArray(geoJson.features) && geoJson.features.length > 0;
    };

    const estadoValido = hasValidFeatures(geoJsonEstado);
    const biomaValido = hasValidFeatures(geoJsonBioma);

    if (estadoValido) {
      const layer = L.geoJSON(geoJsonEstado);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 7, padding: [20, 20], duration: 1.5 });
      }
    } else if (biomaValido) {
      const layer = L.geoJSON(geoJsonBioma);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 7, padding: [20, 20], duration: 1.5 });
      }
    } else {
      const layer = L.geoJSON(geoJsonBrasil);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 5, padding: [20, 20], duration: 1.5 });
      } else {
        map.flyTo([-14, -52], 4, { duration: 1.5 });
      }
    }
  }, [geoJsonEstado, geoJsonBioma, geoJsonBrasil, map]);

  return null;
}

interface Queimada {
  id: number;
  Latitude: number;
  Longitude: number;
  DataHora: string;
  Municipio: string;
  Estado: string;
  Bioma: string;
  RiscoFogo: number;
  FRP: number;
}

const getFrpIcon = (frp: number) => {
  frp = Math.max(0, frp);
  let frpFaixa = Math.floor(frp / 200) + 1;
  if (frpFaixa > 4) frpFaixa = 4;
  const iconUrl = `./${frpFaixa}.png`;
  return new L.Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function getPolygonCenter(geometry: any): [number, number] {
  const coords = geometry.coordinates;
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  if (geometry.type === 'Polygon') {
    const points = coords?.[0];
    if (!Array.isArray(points)) return [0, 0];
    points.forEach((point: number[]) => {
      if (Array.isArray(point) && point.length === 2) {
        lngSum += point[0];
        latSum += point[1];
        count++;
      }
    });
  }

  if (geometry.type === 'MultiPolygon') {
    coords?.forEach((poly: any) => {
      const points = poly?.[0];
      if (!Array.isArray(points)) return;
      points.forEach((point: number[]) => {
        if (Array.isArray(point) && point.length === 2) {
          lngSum += point[0];
          latSum += point[1];
          count++;
        }
      });
    });
  }

  if (count === 0) return [0, 0];

  return [latSum / count, lngSum / count];
}

export const Mapa = ({ filtros }: { filtros: { estado: string, bioma: string, dataInicio: string, dataFim: string, tipoVisualizacao?: string } }) => {
  const [pontos, setPontos] = useState<Queimada[]>([]);
  const [geoJsonBioma, setGeoJsonBioma] = useState<any>(null);
  const [geoJsonEstado, setGeoJsonEstado] = useState<any>(null);
  const [geoJsonBrasil, setGeoJsonBrasil] = useState<any>(null);
  const [areaQueimada, setAreaQueimada] = useState<any>(null);

  useEffect(() => {
    fetch('/brasil.geojson')
      .then(res => res.json())
      .then(setGeoJsonBrasil)
      .catch(() => setGeoJsonBrasil(null));
  }, []);

  useEffect(() => {
    // Área Queimada (GeoJSON)
    if (filtros.tipoVisualizacao === 'area' && filtros.dataInicio && filtros.dataFim) {
      const url = `http://localhost:3001/api/area-queimada?mesInicio=${filtros.dataInicio}&mesFim=${filtros.dataFim}`;
      fetch(url)
        .then(res => res.json())
        .then(setAreaQueimada)
        .catch(() => setAreaQueimada(null));
      setPontos([]); // Limpa pontos
      return;
    }

    // Risco de Fogo


    // Focos de Calor (Queimadas)
    if (filtros.tipoVisualizacao === 'focos' && filtros.dataInicio && filtros.dataFim) {
      const params = new URLSearchParams({
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
      if (filtros.estado && filtros.estado !== 'todos') params.append('estado', filtros.estado);
      if (filtros.bioma && filtros.bioma !== 'todos') params.append('bioma', filtros.bioma);

      fetch(`http://localhost:3001/api/queimadas?${params.toString()}`)
        .then(res => res.json())
        .then(setPontos)
        .catch(() => setPontos([]));
      setAreaQueimada(null); // Limpa área queimada
      return;
    }
  }, [filtros]);

  useEffect(() => {
    setGeoJsonBioma(null);
    if (filtros.bioma && filtros.bioma !== 'todos') {
      fetch('/biomas.geojson')
        .then(res => res.json())
        .then(data => {
          const biomaFiltrado = {
            ...data,
            features: data.features.filter(
              (f: any) => f.properties.BIOMA?.toLowerCase() === filtros.bioma.toLowerCase()
            )
          };
          setGeoJsonBioma(biomaFiltrado);
        })
        .catch(() => setGeoJsonBioma(null));
    }
  }, [filtros.bioma]);

  useEffect(() => {
    setGeoJsonEstado(null);
    if (filtros.estado && filtros.estado !== 'todos') {
      fetch('/estados.geojson')
        .then(res => res.json())
        .then(data => {
          const estadoFiltrado = {
            ...data,
            features: data.features.filter(
              (f: any) => f.properties.Estado?.toLowerCase() === filtros.estado.toLowerCase()
            )
          };
          setGeoJsonEstado(estadoFiltrado);
        })
        .catch(() => setGeoJsonEstado(null));
    }
  }, [filtros.estado]);

  return (
    <div style={{ width: '100vw', height: '60vh', position: 'relative' }}>
      <MapContainer center={[-14, -52]} zoom={4} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustaVisualizacao
          geoJsonEstado={geoJsonEstado}
          geoJsonBioma={geoJsonBioma}
          geoJsonBrasil={geoJsonBrasil}
        />

        {geoJsonEstado && <GeoJSON data={geoJsonEstado} style={() => ({ color: 'black', weight: 2, fillOpacity: 0 })} />}
        {geoJsonBioma && <GeoJSON data={geoJsonBioma} style={() => ({ color: 'green', weight: 2, fillOpacity: 0.2 })} />}
        {!geoJsonEstado && !geoJsonBioma && geoJsonBrasil && (
          <GeoJSON data={geoJsonBrasil} style={() => ({ color: 'black', weight: 2, fillOpacity: 0 })} />
        )}

        {filtros.tipoVisualizacao === 'area' && areaQueimada && (
          <GeoJSON data={areaQueimada} style={() => ({ color: 'red', weight: 1, fillOpacity: 0.4 })} />
        )}

        {filtros.tipoVisualizacao === 'risco' && (
          <RiscoFogoRaster url="http://localhost:3001/static/risco_fogo_brasil.tif" />
        )}
        {filtros.tipoVisualizacao === 'risco' && (
          <RiscoFogoRaster url="http://localhost:3001/static/risco_fogo_brasil.tif" />
        )}

        {filtros.tipoVisualizacao === 'risco-png' && (
          <ImageOverlay
            url="/risco_fogo_brasil.png"
            bounds={[[-28.87, -74.02], [5.27, -33.75]]}
            opacity={0.6}
          />
        )}
        {pontos.map((ponto, idx) => (
          <Marker key={idx} position={[ponto.Latitude, ponto.Longitude]} icon={getFrpIcon(ponto.FRP)}>
            <Popup>
              <div>
                <strong>Município:</strong> {ponto.Municipio}<br />
                <strong>Estado:</strong> {ponto.Estado}<br />
                <strong>Data:</strong> {new Date(ponto.DataHora).toLocaleString()}<br />
                <strong>Bioma:</strong> {ponto.Bioma}<br />
                <strong>Risco de Fogo:</strong> {ponto.RiscoFogo}<br />
                <strong>FRP:</strong> {ponto.FRP}<br />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <FrpLegend />
    </div>
  );
};
