import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import './style/Mapa.css';
import { useMap } from 'react-leaflet';

function AjustaVisualizacao({ geoJsonEstado, geoJsonBioma }: { geoJsonEstado: any, geoJsonBioma: any }) {
  const map = useMap();

  useEffect(() => {
    // Se algum está carregando (null), não faz nada
    if (geoJsonEstado === null && geoJsonBioma === null) {
      return;
    }

    // Se ambos são undefined ou vazios, volta para o Brasil inteiro
    if (!geoJsonEstado && !geoJsonBioma) {
      map.setView([-14, -52], 4);
      return;
    }

    // Prioridade: estado > bioma
    const geo = geoJsonEstado?.features?.length ? geoJsonEstado : geoJsonBioma?.features?.length ? geoJsonBioma : null;
    if (geo && geo.features.length > 0) {
      const layer = L.geoJSON(geo);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 7, padding: [20, 20] });
      }
    }
  }, [geoJsonEstado, geoJsonBioma, map]);

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

// Ícone com base no FRP
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

// Calcula centro do polígono ou multipolígono
function getPolygonCenter(geometry: any): [number, number] {
  const coords = geometry.coordinates;
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  if (geometry.type === 'Polygon') {
    coords[0].forEach((point: number[]) => {
      lngSum += point[0];
      latSum += point[1];
      count++;
    });
  }

  if (geometry.type === 'MultiPolygon') {
    coords.forEach((poly: any) => {
      poly[0].forEach((point: number[]) => {
        lngSum += point[0];
        latSum += point[1];
        count++;
      });
    });
  }

  return [latSum / count, lngSum / count];
}

export const Mapa = ({ filtros }: { filtros: { estado: string, bioma: string, dataInicio: string, dataFim: string } }) => {
  const [pontos, setPontos] = useState<Queimada[]>([]);
  const [geoJsonBioma, setGeoJsonBioma] = useState<any>(null);
  const [geoJsonEstado, setGeoJsonEstado] = useState<any>(null);

  // Carrega dados de queimadas
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
        .then(setPontos)
        .catch(err => console.error('Erro ao buscar queimadas:', err));
    }
  }, [filtros]);

  useEffect(() => {
    setGeoJsonBioma(null); // Limpa antes de carregar novo
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

  // Carrega estado selecionado
  useEffect(() => {
    setGeoJsonEstado(null); // Limpa antes de carregar novo
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
      {/* ...legenda... */}
      <MapContainer center={[-14, -52]} zoom={4} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustaVisualizacao geoJsonEstado={geoJsonEstado} geoJsonBioma={geoJsonBioma} />

        {/* Exibe perímetro do estado */}
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

        {/* Exibe perímetro do bioma */}
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

        {/* Label com nome do estado */}
        {geoJsonEstado && geoJsonEstado.features.map(
          (feature: { properties: { Estado: string }, geometry: any }, idx: number) => {
            const nome = feature.properties.Estado;
            const center = getPolygonCenter(feature.geometry);

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

        {/* Label com nome do bioma */}
        {geoJsonBioma && geoJsonBioma.features.map(
          (feature: { properties: { BIOMA: string }, geometry: any }, idx: number) => {
            const nome = feature.properties.BIOMA;
            const center = getPolygonCenter(feature.geometry);

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

        {/* Marcadores das queimadas */}
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
    </div>
  );
};
