import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import './style/Mapa.css';

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
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

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

  // Carrega apenas o bioma selecionado
  useEffect(() => {
    const loadBioma = async () => {
      if (filtros.bioma && filtros.bioma !== 'todos') {
        try {
          // Primeiro limpa os dados
          setGeoJsonData(null);

          const response = await fetch('/biomas.geojson');
          const data = await response.json();

          const biomaFiltrado = {
            ...data,
            features: data.features.filter(
              (f: any) => f.properties.BIOMA?.toLowerCase() === filtros.bioma.toLowerCase()
            )
          };

          setGeoJsonData(biomaFiltrado);
        } catch (err) {
          console.error('Erro ao carregar GeoJSON:', err);
        }
      } else {
        setGeoJsonData(null);
      }
    };

    loadBioma();
  }, [filtros.bioma]);

  return (
    <div style={{ width: '100vw', height: '60vh', position: 'relative' }}>
      {/* Legenda FRP */}
      <div className="frp-legend">
        <div className="frp-legend-title">FRP (Fire Radiative Power)</div>
        {[1, 2, 3, 4].map(faixa => (
          <div key={faixa} className="frp-legend-item">
            <img src={`./${faixa}.png`} alt={`FRP faixa ${faixa}`} />
            <span>{faixa === 4 ? '600+' : `${(faixa - 1) * 200} - ${faixa * 200 - 1}`}</span>
          </div>
        ))}
      </div>

      <MapContainer center={[-14, -52]} zoom={4} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Exibe bioma filtrado */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={() => ({
              color: 'green',
              weight: 2,
              fillOpacity: 0.2,
            })}
          />
        )}

        {/* Label com nome do bioma */}
        {geoJsonData && geoJsonData.features.map((feature: { properties: { BIOMA: string }, geometry: any }, idx: number) => {
          const nome = feature.properties.BIOMA;
          const center = getPolygonCenter(feature.geometry);

          return (
            <Marker
              key={`label-${idx}`}
              position={center}
              interactive={false}
              icon={L.divIcon({
                className: 'bioma-label',
                html: `<div>${nome}</div>`,
                iconSize: [100, 20]
              })}
            />
          );
        })}

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
