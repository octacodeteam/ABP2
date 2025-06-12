import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import './style/Mapa.css';

// Adicione este novo componente antes do componente Mapa
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

    // Se Brasil ainda não carregou, não faz nada
    if (geoJsonBrasil === null) return;

    // Função auxiliar para verificar se um GeoJSON tem features válidas
    const hasValidFeatures = (geoJson: any) => {
      return geoJson && Array.isArray(geoJson.features) && geoJson.features.length > 0;
    };

    const estadoValido = hasValidFeatures(geoJsonEstado);
    const biomaValido = hasValidFeatures(geoJsonBioma);

    if (estadoValido) {
      // Prioriza estado se estiver selecionado
      const layer = L.geoJSON(geoJsonEstado);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 7, padding: [20, 20], duration: 1.5 });
      }
    } else if (biomaValido) {
      // Se só bioma estiver selecionado
      const layer = L.geoJSON(geoJsonBioma);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { maxZoom: 7, padding: [20, 20], duration: 1.5 });
      }
    } else {
      // Visualização padrão do Brasil
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
  let faixa = Math.floor(frp / 200) + 1;
  if (faixa > 4) faixa = 4;
  const iconUrl = `./${faixa}.png`;
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

  useEffect(() => {
    fetch('/brasil.geojson')
      .then(res => res.json())
      .then(setGeoJsonBrasil)
      .catch(() => setGeoJsonBrasil(null));
  }, []);

  useEffect(() => {
  if (filtros.dataInicio && filtros.dataFim) {
    const params = new URLSearchParams({
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
    });

    if (filtros.estado && filtros.estado !== 'todos') {
      params.append('estado', filtros.estado);
    }
    if (filtros.bioma && filtros.bioma !== 'todos') {
      params.append('bioma', filtros.bioma);
    }

    const url = `http://localhost:3001/api/queimadas?${params.toString()}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        let pontosFiltrados = data;
        if (filtros.tipoVisualizacao === 'risco') {
          pontosFiltrados = data.filter((p: any) => p.RiscoFogo > 0 && p.RiscoFogo <= 1);
        }
        // Adicione outros filtros conforme necessário
        setPontos(pontosFiltrados);
      })
      .catch(err => console.error('Erro ao buscar queimadas:', err));
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

        {geoJsonEstado && (
          <GeoJSON
            data={geoJsonEstado}
            style={() => ({
              color: 'black',
              weight: 2,
              fillOpacity: 0,
            })}
          />
        )}

        {geoJsonBioma && (
          <GeoJSON
            data={geoJsonBioma}
            style={() => ({
              color: 'green',
              weight: 2,
              fillOpacity: 0.2,
            })}
          />
        )}

        {!geoJsonEstado && !geoJsonBioma && geoJsonBrasil && (
          <GeoJSON
            data={geoJsonBrasil}
            style={() => ({
              color: 'black',
              weight: 2,
              fillOpacity: 0,
            })}
          />
        )}

        {geoJsonEstado && geoJsonEstado.features.map(
          (feature: { properties: { Estado: string }, geometry: any }, idx: number) => {
            const nome = String(feature.properties?.Estado || '');
            const center = getPolygonCenter(feature.geometry);
            if (!nome || isNaN(center[0]) || isNaN(center[1])) return null;
            return (
              <Marker
                key={`label-estado-${idx}`}
                position={center}
                interactive={false}
                icon={L.divIcon({
                  className: 'estado-label',
                  html: `<div>${nome}</div>`,
                  iconSize: [100, 20]
                })}
              />
            );
          }
        )}

        {geoJsonBioma && geoJsonBioma.features.map(
          (feature: { properties: { BIOMA: string }, geometry: any }, idx: number) => {
            const nome = String(feature.properties?.BIOMA || '');
            const center = getPolygonCenter(feature.geometry);
            if (!nome || isNaN(center[0]) || isNaN(center[1])) return null;
            return (
              <Marker
                key={`label-bioma-${idx}`}
                position={center}
                interactive={false}
                icon={L.divIcon({
                  className: 'bioma-label',
                  html: `<div>${nome}</div>`,
                  iconSize: [100, 20]
                })}
              />
            );
          }
        )}

        {pontos.map((ponto, idx) => (
          <Marker
            key={idx}
            position={[ponto.Latitude, ponto.Longitude]}
            icon={getFrpIcon(ponto.FRP)}
          >
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