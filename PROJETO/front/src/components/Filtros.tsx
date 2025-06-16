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
  const [tipoVisualizacao, setTipoVisualizacao] = useState('focos');

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleTipoVisualizacaoChange = (value: string) => {
    setTipoVisualizacao(value);

    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);

    if (value === 'area') {
      setDataInicio(mesAtual);
      setDataFim(mesAtual);
    } else {
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - 30);
      setDataInicio(inicio.toISOString().split('T')[0]);
      setDataFim(hoje.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    const endpoint = bioma !== 'todos'
      ? `http://localhost:3001/api/estados-por-bioma?bioma=${bioma}`
      : 'http://localhost:3001/api/estados';
    fetch(endpoint)
      .then(res => res.json())
      .then(setEstados)
      .catch(err => console.error('Erro ao buscar estados:', err));
  }, [bioma]);

  useEffect(() => {
    const endpoint = estado !== 'todos'
      ? `http://localhost:3001/api/biomas-por-estado?estado=${estado}`
      : 'http://localhost:3001/api/biomas';
    fetch(endpoint)
      .then(res => res.json())
      .then(setBiomas)
      .catch(err => console.error('Erro ao buscar biomas:', err));
  }, [estado]);

  return (
    <div className="filtros-container">
      <select
        value={tipoVisualizacao}
        onChange={e => handleTipoVisualizacaoChange(e.target.value)}
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

      {tipoVisualizacao === 'area' ? (
        <>
          <input
            type="month"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="filtro-input"
          />
          <input
            type="month"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="filtro-input"
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <button
        onClick={() => {
          console.log('Aplicando filtros:', { estado, bioma, dataInicio, dataFim, tipoVisualizacao });
          onFiltrar(estado, bioma, dataInicio, dataFim, tipoVisualizacao);
        }}
        className="filtro-btn"
      >
        Filtrar
      </button>
    </div>
  );
};
