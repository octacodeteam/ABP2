import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import './style/Mapa.css';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

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
  const ultimaRegiao = useRef<'estado' | 'bioma' | 'brasil' | null>(null);
  const ultimaChave = useRef<string>('');

  const prevGeoJsonEstado = usePrevious(geoJsonEstado);
  const prevGeoJsonBioma = usePrevious(geoJsonBioma);

  useEffect(() => {
    if (!map) return;

    const aplicarZoom = (geoJson: any, maxZoom: number) => {
      const layer = L.geoJSON(geoJson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom, padding: [20, 20] });
      }
    };

    const novaChaveEstado = geoJsonEstado?.features?.[0]?.properties?.Estado || '';
    const novaChaveBioma = geoJsonBioma?.features?.[0]?.properties?.BIOMA || '';

    const estadoVazio = !geoJsonEstado?.features?.length;
    const biomaVazio = !geoJsonBioma?.features?.length;
    const brasilValido = !!geoJsonBrasil?.features?.length;

    const estadoMudou = JSON.stringify(prevGeoJsonEstado) !== JSON.stringify(geoJsonEstado);
    const biomaMudou = JSON.stringify(prevGeoJsonBioma) !== JSON.stringify(geoJsonBioma);

    if (geoJsonEstado?.features?.length && ultimaChave.current !== novaChaveEstado && estadoMudou) {
      aplicarZoom(geoJsonEstado, 7);
      ultimaRegiao.current = 'estado';
      ultimaChave.current = novaChaveEstado;
    } else if (geoJsonBioma?.features?.length && ultimaChave.current !== novaChaveBioma && biomaMudou) {
      aplicarZoom(geoJsonBioma, 7);
      ultimaRegiao.current = 'bioma';
      ultimaChave.current = novaChaveBioma;
    } else if (estadoVazio && biomaVazio && brasilValido && ultimaChave.current !== 'brasil' && estadoMudou && biomaMudou) {
      aplicarZoom(geoJsonBrasil, 5);
      ultimaRegiao.current = 'brasil';
      ultimaChave.current = 'brasil';
    }
  }, [geoJsonEstado, geoJsonBioma, geoJsonBrasil, map, prevGeoJsonEstado, prevGeoJsonBioma]);

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

export const Mapa = ({ filtros }: { filtros: { estado: string, bioma: string, dataInicio: string, dataFim: string } }) => {
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
        .then(setPontos)
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
    </div>
  );
};