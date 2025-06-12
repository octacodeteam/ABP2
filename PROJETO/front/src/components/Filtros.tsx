import React, { useEffect, useState } from 'react';
import './style/Filtros.css';

interface Props {
  onFiltrar: (estado: string, bioma: string, dataInicio: string, dataFim: string, tipoVisualizacao: string) => void;
}

export const Filtros: React.FC<Props> = ({ onFiltrar }) => {
  const [estados, setEstados] = useState<string[]>([]);
  const [estado, setEstado] = useState('todos');
  const [biomas, setBiomas] = useState<string[]>([]);
  const [bioma, setBioma] = useState('todos');
  const [tipoVisualizacao, setTipoVisualizacao] = useState('focos'); // focos, risco, area

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Atualiza estados quando bioma muda
  useEffect(() => {
    if (bioma !== 'todos') {
      fetch(`http://localhost:3001/api/estados-por-bioma?bioma=${bioma}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEstados(data);
          } else {
            console.error('Formato inesperado de estados filtrados:', data);
          }
        })
        .catch(err => console.error('Erro ao buscar estados filtrados:', err));
    } else {
      fetch('http://localhost:3001/api/estados')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEstados(data);
          } else {
            console.error('Formato inesperado de estados:', data);
          }
        })
        .catch(err => console.error('Erro ao buscar estados:', err));
    }
  }, [bioma]);

  // Atualiza biomas quando estado muda
  useEffect(() => {
    if (estado !== 'todos') {
      fetch(`http://localhost:3001/api/biomas-por-estado?estado=${estado}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBiomas(data);
          } else {
            console.error('Formato inesperado de biomas filtrados:', data);
          }
        })
        .catch(err => console.error('Erro ao buscar biomas filtrados:', err));
    } else {
      fetch('http://localhost:3001/api/biomas')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBiomas(data);
          } else {
            console.error('Formato inesperado de biomas:', data);
          }
        })
        .catch(err => console.error('Erro ao buscar biomas:', err));
    }
  }, [estado]);

  return (
    <div className="filtros-container">
      <select
        value={tipoVisualizacao}
        onChange={e => setTipoVisualizacao(e.target.value)}
        className="filtro-select"
      >
        <option value="focos">Focos de calor</option>
        <option value="risco">Risco de fogo</option>
        <option value="area">Área queimada</option>
      </select>
      <select
        value={estado}
        onChange={e => setEstado(e.target.value)}
        className="filtro-select"
      >
        <option value="todos">Todos os estados</option>
        {estados.map(est => (
          <option key={est} value={est}>{est}</option>
        ))}
      </select>

      <select
        value={bioma}
        onChange={e => setBioma(e.target.value)}
        className="filtro-select"
      >
        <option value="todos">Todos os biomas</option>
        {biomas.map(b => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      <input
        type="date"
        value={dataInicio}
        onChange={e => setDataInicio(e.target.value)}
        className="filtro-input"
      />
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="filtro-input"
      />
      <button
        onClick={() => {
          console.log('Aplicando filtros:', { estado, bioma, dataInicio, dataFim });
          onFiltrar(estado, bioma, dataInicio, dataFim, tipoVisualizacao);;
        }}
        className="filtro-btn"
      >
        Filtrar
      </button>
    </div>
  );
};
