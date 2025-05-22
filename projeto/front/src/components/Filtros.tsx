import React, { useEffect, useState } from 'react';

interface Props {
  onFiltrar: (estado: string, dataInicio: string, dataFim: string) => void;
}

export const Filtros: React.FC<Props> = ({ onFiltrar }) => {
  const [estados, setEstados] = useState<string[]>([]);
  const [estado, setEstado] = useState('todos');

  // Define datas iniciais como padrão (últimos 30 dias)
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-4" style={{ textAlign: 'center' }}>
      <select
        value={estado}
        onChange={e => setEstado(e.target.value)}
        className="mr-2 p-2 border rounded"
      >
        <option value="todos">Todos os estados</option>
        {estados.map(est => (
          <option key={est} value={est}>{est}</option>
        ))}
      </select>

      <input
        type="date"
        value={dataInicio}
        onChange={e => setDataInicio(e.target.value)}
        className="mr-2 p-2 border rounded"
      />

      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="mr-2 p-2 border rounded"
      />

      <button
        onClick={() => {
          console.log('Aplicando filtros:', { estado, dataInicio, dataFim });
          onFiltrar(estado, dataInicio, dataFim);
        }}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Filtrar
      </button>
    </div>
  );
};
