import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

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

// Função para obter o ícone baseado no valor de FRP
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


export const Mapa = ({ filtros }: { filtros: { estado: string, dataInicio: string, dataFim: string } }) => {
  const [pontos, setPontos] = useState<Queimada[]>([]);

  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      const params = new URLSearchParams({
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });

      if (filtros.estado && filtros.estado !== 'todos') {
        params.append('estado', filtros.estado);
      }

      const url = `http://localhost:3001/api/queimadas?${params.toString()}`;
      console.log('Fetching data from:', url);

      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then(setPontos)
        .catch(err => console.error('Erro ao buscar queimadas:', err));
    }
  }, [filtros]);

  return (
    <div style={{ width: '100vw', height: '60vh' }}>
      <MapContainer center={[-14, -52]} zoom={4} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
